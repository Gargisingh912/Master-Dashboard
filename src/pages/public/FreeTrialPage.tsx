import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui";

const FreeTrialPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the target dashboard route passed from the register page, default to /dashboard
  const dashboardRoute = (location.state as any)?.dashboardRoute || "/dashboard/kitchen";

  const handleContinue = () => {
    navigate(dashboardRoute, { replace: true });
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 flex flex-col items-center justify-center text-center">
      <div className="max-w-md w-full mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-black">
          You have 7 days free trial to enjoy
        </h1>
        <p className="text-gray-600">
          Explore all the features of our platform for the next 3 days, completely free!
        </p>
        <Button onClick={handleContinue} size="lg" fullWidth className="bg-transparent border border-black text-black hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-colors duration-200 group">
          yaay
        </Button>
      </div>
    </div>
  );
};

export default FreeTrialPage;
