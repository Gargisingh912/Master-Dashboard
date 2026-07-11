import { useEffect, useState } from "react";
import { supabase } from "../../config/supabase";

interface Profile {
  full_name: string | null;
}

export default function UserInfoCard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string>("");
  const [kitchenName, setKitchenName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError(userError?.message ?? "No logged-in user found");
        setLoading(false);
        return;
      }

      setEmail(user.email ?? "");

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, organization_id")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData) {
        setError(profileError?.message ?? "Profile not found");
        setLoading(false);
        return;
      }
      setProfile(profileData);

      if (profileData.organization_id) {
        const { data: orgData } = await supabase
          .from("organizations")
          .select("name")
          .eq("id", profileData.organization_id)
          .single();

        if (orgData) setKitchenName(orgData.name);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <p className="text-sm text-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
        {kitchenName}
      </h4>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
        <div>
          <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
            Name
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {profile?.full_name}
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
            Email address
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {email}
          </p>
        </div>
      </div>
    </div>
  );
}