import { useState, useEffect } from "react";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import TrialBanner from "../layout/TrialBanner";
import { supabase } from "../config/supabase"; // adjust to your actual client path

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrg() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      // adjust "profiles" / "org_id" to match your actual schema —
      // this assumes profiles.id === auth user id, with an org_id column
      const { data, error } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", session.user.id)
        .single();

      if (!error && data) setOrgId(data.org_id);
    }

    loadOrg();
  }, []);

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        {orgId && <TrialBanner orgId={orgId} />}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;