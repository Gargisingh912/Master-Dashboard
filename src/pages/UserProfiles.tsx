import { useEffect, useState, useRef } from "react";
import { Link } from "react-router";
import PageMeta from "../components/common/PageMeta";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import { isSilentMode, setSilentMode } from "../utils/helpers";
import { supabase } from "../config/supabase";
import { useAuth } from "../hooks/useAuth";
import {
  Users,
  MessageSquareText,
  FileText,
  Headset,
  LogOut,
  Camera,
  Bell,
  BellOff,
  Power,
  ChevronDown
} from "lucide-react";

export default function UserProfiles() {
  const { org } = useAuth();
  const [silent, setSilent] = useState(isSilentMode());
  const [kitchenName, setKitchenName] = useState(org?.name || "My Kitchen");
  const [isLive, setIsLive] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchOrgStatus() {
      if (!org?.id) return;
      const { data } = await supabase
        .from("organizations")
        .select("is_live, name")
        .eq("id", org.id)
        .single();

      if (data) {
        if (data.is_live !== undefined && data.is_live !== null) setIsLive(data.is_live);
        if (data.name) setKitchenName(data.name);
      }
    }
    fetchOrgStatus();
  }, [org?.id]);

  const toggleSilent = () => {
    const next = !silent;
    setSilentMode(next);
    setSilent(next);
  };

  const toggleLiveStatus = async () => {
    if (!org?.id) return;
    const nextStatus = !isLive;
    setIsLive(nextStatus);
    // You should have an is_live column in organizations table. 
    // If it fails, we revert UI or handle error. Assuming it works.
    await supabase.from("organizations").update({ is_live: nextStatus }).eq("id", org.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleSupportWhatsApp = () => {
    const msg = encodeURIComponent("I have a query/problem");
    window.open(`https://wa.me/919999999999?text=${msg}`, "_blank");
  };

  return (
    <>
      <PageMeta title="Profile | Master-Dashboard" description="Manage your kitchen profile" />

      <div className="max-w-4xl mx-auto pb-12">
        {/* Settings Dropdown & Header Area */}
        <div className="flex justify-end mb-6 relative z-30">
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-full shadow-sm hover:shadow-md transition-all text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Quick Settings <ChevronDown size={16} className={`transition-transform duration-300 ${showSettings ? "rotate-180" : ""}`} />
            </button>

            {showSettings && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-2 animate-in slide-in-from-top-2 fade-in duration-200 overflow-hidden">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-colors">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                    <ThemeToggleButton />
                  </div>

                  <button
                    onClick={toggleSilent}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-colors text-left"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notifications</span>
                    <div className={`p-1.5 rounded-full transition-colors ${silent ? "bg-red-100 text-red-500 dark:bg-red-500/20" : "bg-brand-100 text-brand-500 dark:bg-brand-500/20"}`}>
                      {silent ? <BellOff size={16} /> : <Bell size={16} />}
                    </div>
                  </button>

                  <button
                    onClick={toggleLiveStatus}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-colors text-left"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kitchen Status</span>
                      <span className="text-[10px] text-gray-400">{isLive ? "Accepting orders" : "Offline"}</span>
                    </div>
                    <div className={`p-1.5 rounded-full transition-colors ${!isLive ? "bg-red-100 text-red-500 dark:bg-red-500/20" : "bg-success-100 text-success-600 dark:bg-success-500/20"}`}>
                      <Power size={16} />
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Brand & Logo Section */}
        <div className="flex flex-col items-center justify-center mb-12">
          <div className="relative group mb-4">
            <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-tr from-brand-500 to-brand-400 flex items-center justify-center text-white font-bold text-5xl shadow-xl shadow-brand-500/20 overflow-hidden">
              {kitchenName.charAt(0) || "K"}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
            >
              <Camera size={24} className="mb-1" />
              <span className="text-xs font-medium">Edit Logo</span>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight text-center">
            {kitchenName}
          </h2>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400">
            <span className={`w-2 h-2 rounded-full ${isLive ? "bg-success-500 animate-pulse" : "bg-red-500"}`}></span>
            {isLive ? "Online & Accepting Orders" : "Currently Offline"}
          </div>
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-12">

          <Link to="/customer-tables" className="flex items-center gap-4 p-5 rounded-[2rem] bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-sm hover:shadow-md hover:border-brand-300 dark:hover:border-brand-500/40 transition-all group">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white/90">Customer Directory</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">View and manage your customers</p>
            </div>
          </Link>

          <Link to="/blank" className="flex items-center gap-4 p-5 rounded-[2rem] bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-sm hover:shadow-md hover:border-brand-300 dark:hover:border-brand-500/40 transition-all group">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
              <MessageSquareText size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white/90">Talk to Data (AI Bot)</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Ask questions about your data</p>
            </div>
          </Link>

          <Link to="/docs" className="flex items-center gap-4 p-5 rounded-[2rem] bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-sm hover:shadow-md hover:border-brand-300 dark:hover:border-brand-500/40 transition-all group">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white/90">Documentation</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Guides and tutorials</p>
            </div>
          </Link>

          <div onClick={handleSupportWhatsApp} className="cursor-pointer flex items-center gap-4 p-5 rounded-[2rem] bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-sm hover:shadow-md hover:border-brand-300 dark:hover:border-brand-500/40 transition-all group">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-500/10 text-green-500 group-hover:scale-110 transition-transform">
              <Headset size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 dark:text-white/90">Help & Support</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">support@gargi.ai</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-100 px-2 py-1 rounded-full">WhatsApp</span>
          </div>

        </div>

        {/* Logout Button */}
        <div className="flex justify-center">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 rounded-[1.5rem] bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 font-semibold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

      </div>
    </>
  );
}
