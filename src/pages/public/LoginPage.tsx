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
 const [showPassword, setShowPassword] = useState(false);
 
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

 // Step 2: Check the user's role first — superadmins skip org routing entirely
 const { data: profileData, error: profileError } = await supabase
 .from("profiles")
 .select("role")
 .eq("id", user.id)
 .single();

 if (profileError && profileError.code !== 'PGRST116') {
 console.error("Error fetching profile:", profileError);
 }
console.log("PROFILE CHECK:", { profileData, profileError, userId: user.id }); // ADD THIS LINE

 if (profileData?.role === "superadmin") {
 navigate("/superadmin", { replace: true });
 return;
 }

 // Step 3: Fetch the user's organization to know where to route them
 const { data: orgData, error: orgError } = await supabase
 .from("organizations")
 .select("type")
 .eq("owner_id", user.id)
 .single();

 if (orgError && orgError.code !== 'PGRST116') {
 console.error("Error fetching organization:", orgError);
 }

 // Step 4: Route to the correct dashboard based on org type
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
 <div className="min-h-screen bg-gray-50 py-12 px-4 flex flex-col justify-center">
 <div className="max-w-md w-full mx-auto">
 
 {/* Header */}
 <div className="mb-8 text-center">
 <Link
 to="/"
 className="inline-flex items-center text-gray-500 hover:text-gray-800 mb-6 transition-colors"
 >
 <ArrowLeft className="w-4 h-4 mr-2" />
 Back to Home
 </Link>
 <div className="flex flex-col items-center justify-center space-y-3 mb-4">
 <div className="p-3 bg-gray-100 rounded-full">
 <Store className="w-10 h-10 text-black hover:text-gray-800" />
 </div>
 <div>
 <h1 className="text-3xl font-bold text-gray-800 ">Welcome Back</h1>
 <p className="text-gray-500 mt-2">
 Log in to manage your organization
 </p>
 </div>
 </div>
 </div>

 {/* Form Card */}
 <Card className="rounded-xl border border-gray-200 bg-white p-6 ">
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

 <div className="relative">
 <Input
 label="Password"
 name="password"
 type={showPassword ? "text" : "password"}
 value={formData.password}
 onChange={handleChange}
 error={errors.password}
 placeholder="Enter your password"
 required
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 focus:outline-none"
 >
 {showPassword ? (
 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
 ) : (
 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
 )}
 </button>
 </div>
 </div>

 <Button type="submit" loading={loading} fullWidth size="lg" className="bg-transparent border border-black text-black hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-colors duration-200 group">
 Log In
 </Button>

 {/* Registration Link */}
 <p className="text-center text-sm text-gray-500 ">
 Don't have an account?{" "}
 <Link
 to="/register"
 className="text-black hover:text-gray-800 font-medium hover:underline transition-all"
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