import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Store, ArrowLeft } from "lucide-react";
import {
 Button,
 Input,
 Select,
 Alert,
 Card,
} from "../../components/ui";
import { APP_CONFIG } from "../../config/config";
import { supabase } from "../../config/supabase";
import { isValidEmail, isValidPhone } from "../../utils/helpers";

interface FormData {
 organization_name: string;
 owner_name: string;
 phone: string;
 email: string;
 password: string;
 confirm_password: string;
 city: string;
 address: string;
 organization_type: string;
 heard_from: string;
 notes: string;
}

const RegisterPage: React.FC = () => {
 const navigate = useNavigate();
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");
 const [formData, setFormData] = useState<FormData>({
 organization_name: "",
 owner_name: "",
 phone: "",
 email: "",
 password: "",
 confirm_password: "",
 city: "",
 address: "",
 organization_type: "",
 heard_from: "",
 notes: "",
 });

 const [errors, setErrors] = useState<Partial<FormData>>({});

 const validateForm = (): boolean => {
 const newErrors: Partial<FormData> = {};

 if (!formData.organization_name.trim()) {
 newErrors.organization_name = "Organization name is required";
 }

 if (!formData.owner_name.trim()) {
 newErrors.owner_name = "Owner name is required";
 }

 if (!formData.phone.trim()) {
 newErrors.phone = "Phone number is required";
 } else if (!isValidPhone(formData.phone)) {
 newErrors.phone = "Please enter a valid 10-digit phone number";
 }

 if (!formData.email.trim()) {
 newErrors.email = "Email is required";
 } else if (!isValidEmail(formData.email)) {
 newErrors.email = "Please enter a valid email address";
 }

 if (!formData.password) {
 newErrors.password = "Password is required";
 } else if (formData.password.length < 6) {
 newErrors.password = "Password must be at least 6 characters";
 }

 if (formData.confirm_password !== formData.password) {
 newErrors.confirm_password = "Passwords do not match";
 }

 if (!formData.city.trim()) {
 newErrors.city = "City is required";
 }

 if (!formData.organization_type) {
 newErrors.organization_type = "Organization type is required";
 }

 setErrors(newErrors);
 return Object.keys(newErrors).length === 0;
 };

 // Maps organization_type -> dashboard route.
 // Adjust these paths to match your actual router config.
 const dashboardRouteFor = (type: string) => {
 const safeType = type.toLowerCase();
 
 if (safeType.includes("kitchen")) return "/dashboard/kitchen";
 if (safeType.includes("academy")) return "/dashboard/academy";
 if (safeType.includes("salon")) return "/dashboard/salon";
 
 return "/dashboard";
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError("");

 if (!validateForm()) {
 return;
 }

 setLoading(true);

 try {
 // Step 1: create the auth user
 const { data: authData, error: signUpError } = await supabase.auth.signUp({
 email: formData.email.trim(),
 password: formData.password,
 options: {
 data: { full_name: formData.owner_name.trim() },
 },
 });

 if (signUpError) throw signUpError;

 const user = authData.user;
 if (!user) {
 throw new Error("Signup succeeded but no user was returned.");
 }

 // Step 2: create the organization, owned by this user
 const { data: org, error: orgError } = await supabase
 .from("organizations")
 .insert([
 {
 name: formData.organization_name.trim(),
 owner_name: formData.owner_name.trim(),
 phone: formData.phone.replace(/[\s\-()]/g, ""),
 email:formData.email.trim(),
 city: formData.city.trim(),
 address: formData.address.trim() || null,
 type: formData.organization_type,
 heard_from: formData.heard_from || null,
 notes: formData.notes.trim() || null,
 owner_id: user.id,
 },
 ])
 .select()
 .single();

 if (orgError) throw orgError;

 // Step 3: link the profile (auto-created by DB trigger on signup)
 // to this organization
 const { error: profileError } = await supabase
 .from("profiles")
 .update({
 full_name: formData.owner_name.trim(),
 email: formData.email.trim(),
 organization_id: org.id,

 })
 .eq("id", user.id);

 if (profileError) throw profileError;

      // Step 4: go straight to the free trial page.
      navigate("/free-trial", { 
        state: { dashboardRoute: dashboardRouteFor(formData.organization_type) }, 
        replace: true 
      });
 } catch (err: any) {
 console.error("Registration error:", err);
 setError(err.message || "Failed to register. Please try again.");
 } finally {
 setLoading(false);
 }
 };

 const handleChange = (
 e: React.ChangeEvent<
 HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
 >
 ) => {
 const { name, value } = e.target;
 setFormData((prev) => ({ ...prev, [name]: value }));
 if (errors[name as keyof FormData]) {
 setErrors((prev) => ({ ...prev, [name]: "" }));
 }
 };

 return (
 <div className="min-h-screen bg-gray-50 py-12 px-4">
 <div className="max-w-2xl mx-auto">
 {/* Header */}
 <div className="mb-8">
 <Link
 to="/"
 className="inline-flex items-center text-gray-500 hover:text-gray-800 mb-6"
 >
 <ArrowLeft className="w-4 h-4 mr-2" />
 Back to Home
 </Link>
 <div className="flex items-center space-x-3 mb-4">
 <Store className="w-10 h-10 text-black hover:text-gray-800" />
 <div>
 <h1 className="text-3xl font-bold text-gray-800 ">
 Register Your Organization
 </h1>
 <p className="text-gray-500 ">
 Start your digital journey today
 </p>
 </div>
 </div>
 </div>

 {/* Form */}
 <Card className="rounded-xl border border-gray-200 bg-white p-6 ">
 {error && <Alert type="error" message={error} className="mb-6" />}

 <form onSubmit={handleSubmit} className="space-y-6">
 {/* Organization Details */}
 <div>
 <h2 className="text-lg font-semibold text-gray-800 mb-4">
 Organization Details
 </h2>
 <div className="space-y-4">
 <Input
 label="Organization Name"
 name="organization_name"
 value={formData.organization_name}
 onChange={handleChange}
 error={errors.organization_name}
 placeholder="e.g., Tasty Bites Restaurant"
 required
 />

 <Select
 label="Organization Type"
 name="organization_type"
 value={formData.organization_type}
 onChange={handleChange}
 error={errors.organization_type}
 options={APP_CONFIG.organizationTypes.map((type) => ({
 value: type,
 label: type,
 }))}
 required
 />

 <div className="grid md:grid-cols-2 gap-4">
 <Input
 label="City"
 name="city"
 value={formData.city}
 onChange={handleChange}
 error={errors.city}
 placeholder="e.g., Mumbai"
 required
 />

 <Input
 label="Address (Optional)"
 name="address"
 value={formData.address}
 onChange={handleChange}
 placeholder="Street address"
 />
 </div>
 </div>
 </div>

 {/* Owner Details */}
 <div>
 <h2 className="text-lg font-semibold text-gray-800 mb-4">
 Owner Details
 </h2>
 <div className="space-y-4">
 <Input
 label="Owner Name"
 name="owner_name"
 value={formData.owner_name}
 onChange={handleChange}
 error={errors.owner_name}
 placeholder="Your full name"
 required
 />

 <div className="grid md:grid-cols-2 gap-4">
 <Input
 label="Phone Number"
 name="phone"
 type="tel"
 value={formData.phone}
 onChange={handleChange}
 error={errors.phone}
 placeholder="10-digit mobile number"
 required
 />

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
 </div>

 <div className="grid md:grid-cols-2 gap-4">
 <Input
 label="Password"
 name="password"
 type="password"
 value={formData.password}
 onChange={handleChange}
 error={errors.password}
 placeholder="At least 6 characters"
 required
 />

 <Input
 label="Confirm Password"
 name="confirm_password"
 type="password"
 value={formData.confirm_password}
 onChange={handleChange}
 error={errors.confirm_password}
 placeholder="Re-enter password"
 required
 />
 </div>
 </div>
 </div>

 
 {/* Terms */}
 <div className="bg-white rounded-lg p-4 text-sm text-gray-500 ">
 By submitting this form, you agree to our Terms of Service and
 Privacy Policy.
 </div>

 {/* Submit Button */}
 <Button type="submit" loading={loading} fullWidth size="lg" className="bg-transparent border border-black text-black hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-colors duration-200 group">
 Create Account
 </Button>

 {/* Login Link */}
 <p className="text-center text-sm text-gray-500 ">
 Already have an account?{" "}
 <Link
 to="/login"
 className="text-black hover:text-gray-800 font-medium hover:underline"
 >
 Login here
 </Link>
 </p>
 </form>
 </Card>
 </div>
 </div>
 );
};

export default RegisterPage;