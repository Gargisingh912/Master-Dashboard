import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Store, ArrowLeft } from "lucide-react";
import { Button, Input, Alert, Card } from "../../components/ui";
import { supabase } from "../../config/supabase";
import { isValidEmail } from "../../utils/helpers";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  // Maps organization_type -> dashboard route
  const dashboardRouteFor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "academy":
        return "/dashboard/academy";
      case "salon":
        return "/dashboard/salon";
      case "kitchen":
        return "/dashboard/kitchen";
      default:
        // CHANGED: Default to the kitchen dashboard instead of just "/dashboard"
        // This guarantees they see your new dashboard even if org type is missing.
        return "/dashboard/kitchen"; 
    }
  };

  const validateForm = (): boolean => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Step 1: Authenticate the user
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (signInError) throw signInError;

      const user = authData.user;
      if (!user) throw new Error("No user returned from login.");

      // Step 2: Fetch the user's organization to know where to route them
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("type")
        .eq("owner_id", user.id)
        .single();

      if (orgError && orgError.code !== 'PGRST116') {
        console.error("Error fetching organization:", orgError);
      }

      // Step 3: Route to the correct dashboard based on org type
      const route = dashboardRouteFor(orgData?.type || "");
      navigate(route, { replace: true });

    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Invalid login credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:text-white/90 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex flex-col items-center justify-center space-y-3 mb-4">
            <div className="p-3 bg-brand-50 dark:bg-brand-500/20 rounded-full">
              <Store className="w-10 h-10 text-brand-500 hover:text-brand-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white/90">Welcome Back</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Log in to manage your organization
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          {error && <Alert type="error" message={error} className="mb-6" />}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="your@email.com"
                required
              />

              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Enter your password"
                required
              />
            </div>

            <Button type="submit" loading={loading} fullWidth size="lg">
              Log In
            </Button>

            {/* Registration Link */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-brand-500 hover:text-brand-600 font-medium hover:underline transition-all"
              >
                Register your organization
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
