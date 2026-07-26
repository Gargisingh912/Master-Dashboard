import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import TrialBanner from "../layout/TrialBanner";
import { useAuth } from "../hooks/useAuth";
import ErrorBoundary from "../components/common/ErrorBoundary";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { plan, trialEnds } = useAuth();

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
        <AppHeader onClick={toggleSidebar} onToggle={toggleMobileSidebar} />
        <TrialBanner plan={plan} trialEnds={trialEnds} />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
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