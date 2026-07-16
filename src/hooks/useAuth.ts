import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../config/supabase";

export interface Organization {
  id: string;
  name: string;
  type: string;
  plan: "trial" | "standard" | "premium" | "enterprise";
  trial_ends: string | null;
  [key: string]: any;
}

export interface OrgWithEffectivePlan extends Organization {
  effectivePlan: string;
}

export interface Profile {
  id: string;
  full_name?: string;
  email?: string;
  role?: "viewer" | "owner" | "superadmin";
  organization_id?: string;
  organizations?: Organization;
  [key: string]: any;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [org, setOrg] = useState<OrgWithEffectivePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (userId: string) => {
    // Must select the profile's own columns ('*') AND embed the related
    // organization row — .select('organizations') alone only returns the
    // embedded relation and drops every profile column (role, full_name,
    // email), which silently made role-based checks always fall back
    // to 'viewer'.
    const { data: prof, error: fetchError } = await supabase
      .from("profiles")
      .select("*, organizations(*)")
      .eq("id", userId)
      .single();

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    if (prof) {
      setProfile(prof as Profile);

      const orgData = (prof as Profile).organizations;
      let effectivePlan: string = orgData?.plan || "trial";

      if (effectivePlan === "trial" && orgData?.trial_ends) {
        const expired = new Date(orgData.trial_ends) < new Date();
        if (expired) effectivePlan = "standard"; // trial expired → free tier
      }

      if (orgData) {
        setOrg({ ...orgData, effectivePlan });
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setOrg(null);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (loginError) setError(loginError.message);
    return { error: loginError };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setOrg(null);
  };

  return {
    user,
    profile,
    org,
    role: profile?.role || "viewer",
    plan: org?.effectivePlan || "trial",
    type: org?.type || "kitchen",
    trialEnds: org?.trial_ends || null,
    loading,
    error,
    login,
    logout,
  };
}