import { useState, useEffect } from "react";
import { supabase } from "../config/supabase"; // adjust to your actual client path

interface TrialBannerProps {
  orgId: string;
}

export default function TrialBanner({ orgId }: TrialBannerProps) {
  const [plan, setPlan] = useState<string | null>(null);
  const [trialEnds, setTrialEnds] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) return;

    async function fetchPlan() {
      // Adjust table/column names to match your actual schema
      const { data, error } = await supabase
        .from("businesses")
        .select("plan, trial_ends_at")
        .eq("org_id", orgId)
        .single();

      if (!error && data) {
        setPlan(data.plan);
        setTrialEnds(data.trial_ends_at);
      }
    }

    fetchPlan();
  }, [orgId]);

  const trialDaysLeft = (() => {
    if (plan !== "trial" || !trialEnds) return null;
    const diff = new Date(trialEnds).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  })();

  if (plan !== "trial" || trialDaysLeft === null) return null;

  const isUrgent = trialDaysLeft <= 2;

  return (
    <div
      style={{
        background: isUrgent ? "#F8717118" : "#FBBF2418",
        border: `1px solid ${isUrgent ? "#F87171" : "#FBBF24"}33`,
        padding: "10px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      <span
        style={{
          color: isUrgent ? "#F87171" : "#FBBF24",
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {trialDaysLeft === 0
          ? "⚠ Your trial has expired — upgrade to continue"
          : `⏳ ${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left in your free trial`}
      </span>
      <button
        onClick={() =>
          window.open(
            "https://wa.me/91XXXXXXXXXX?text=I want to upgrade my gargi.ai plan",
            "_blank"
          )
        }
        style={{
          background: "#818CF8",
          color: "#000",
          border: "none",
          borderRadius: 8,
          padding: "6px 14px",
          fontSize: 11,
          fontWeight: 800,
          cursor: "pointer",
          fontFamily: "inherit",
          whiteSpace: "nowrap",
        }}
      >
        Upgrade Now →
      </button>
    </div>
  );
}