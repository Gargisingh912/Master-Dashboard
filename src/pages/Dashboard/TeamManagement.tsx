import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { supabase } from "../../config/supabase";
import { useAuth } from "../../hooks/useAuth";

interface TeamMember {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at?: string;
}

export default function TeamManagement() {
  const { profile, role } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamMembers();
  }, [profile?.organization_id]);

  const fetchTeamMembers = async () => {
    if (!profile?.organization_id) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, role")
        .eq("organization_id", profile.organization_id)
        .order("role", { ascending: false }); // Show owners first

      if (error) throw error;
      setMembers(data || []);
    } catch (err: any) {
      console.error("Failed to fetch team members", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error } = await supabase.functions.invoke("invite-admin", {
        body: { email: inviteEmail.trim() },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setSuccess(`Invitation successfully sent to ${inviteEmail}`);
      setInviteEmail("");
      fetchTeamMembers(); // Refresh the list
    } catch (err: any) {
      console.error("Invite failed", err);
      setError(err.message || "Failed to send invitation.");
    } finally {
      setInviting(false);
    }
  };

  if (role !== "owner" && role !== "superadmin") {
    return (
      <>
        <PageMeta title="Team Management | Kitchen Dashboard" description="Manage your organization's team" />
        <div className="p-10 text-center text-gray-500">
          <h2 className="text-xl font-bold mb-2 text-red-500">Access Denied</h2>
          <p>Only organization owners can access team management.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta title="Team Management | Kitchen Dashboard" description="Manage your organization's team" />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Team Management</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Members List */}
          <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="border-b border-gray-100 p-6 dark:border-white/[0.05]">
              <h3 className="font-semibold text-gray-800 dark:text-white/90">Team Members</h3>
            </div>
            <div className="p-6">
              {loading ? (
                <p className="text-sm text-gray-500">Loading members...</p>
              ) : members.length === 0 ? (
                <p className="text-sm text-gray-500">No members found.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-white/5">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white/90">{member.full_name || "Pending User"}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        member.role === 'owner' ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400' : 
                        member.role === 'admin' ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400' : 
                        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {member.role.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Invite Form */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] h-fit">
            <div className="border-b border-gray-100 p-6 dark:border-white/[0.05]">
              <h3 className="font-semibold text-gray-800 dark:text-white/90">Invite Admin</h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleInvite} className="flex flex-col gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90"
                  />
                </div>
                
                {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                {success && <p className="text-xs text-green-500 font-medium">{success}</p>}

                <button
                  type="submit"
                  disabled={inviting}
                  className="w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {inviting ? "Sending Invite..." : "Send Invitation"}
                </button>
              </form>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Invited users will receive an email to set up their account. They will automatically be assigned the <strong>Admin</strong> role and will not have access to financial data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
