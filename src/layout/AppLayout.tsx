import { Outlet } from "react-router";
import FloatingNav from "./FloatingNav";
import TrialBanner from "../layout/TrialBanner";
import { useAuth } from "../hooks/useAuth";
import ErrorBoundary from "../components/common/ErrorBoundary";

const LayoutContent: React.FC = () => {
  const { plan, trialEnds } = useAuth();

  return (
    // ── Global Background Matching the Image ──
    <div className="min-h-screen font-sans text-gray-900 dark:text-gray-100 bg-gradient-to-br from-indigo-50 via-white to-pink-50 dark:from-[#2a1b3d] dark:via-[#1a1525] dark:to-[#120f18]">
      <FloatingNav />
      <div className="flex-1 transition-all duration-300 ease-in-out">
        {/* Padding for desktop left nav, padding for mobile bottom nav */}
        <div className="pt-4 lg:pt-6 lg:pl-32 pb-28 lg:pb-8 pr-4 lg:pr-8">
          <TrialBanner plan={plan} trialEnds={trialEnds} />
          <div className="mx-auto max-w-(--breakpoint-2xl)">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return <LayoutContent />;
};

export default AppLayout;