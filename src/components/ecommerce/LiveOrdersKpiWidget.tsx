import { Link } from "react-router";
import { useKitchen } from "../../context/KitchenContext";
import { Activity } from "lucide-react";

export default function LiveOrdersKpiWidget() {
  const { orders } = useKitchen();

  const todayStr = new Date().toISOString().split("T")[0];
  const todayOrders = orders.filter((o) => o.date && o.date.startsWith(todayStr));

  const placedCount = todayOrders.filter((o) => o.status === "Placed").length;
  const preparingCount = todayOrders.filter((o) => o.status === "Preparing" || o.status === "Ready").length;
  const deliveredCount = todayOrders.filter((o) => o.status === "Delivered").length;

  return (
    <Link
      to="/orders-tables"
      className="block bento-glass p-6 group"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-brand-50 dark:bg-brand-500/10 text-brand-500 rounded-xl">
            <Activity size={20} />
          </div>
          <h4 className="text-sm font-bold text-gray-800 dark:text-white/90 tracking-wide">
            Live Order Status
          </h4>
        </div>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-500 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14m-7-7 7 7-7 7" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-gray-50/80 backdrop-blur-sm p-4 dark:bg-white/5 border border-gray-100 dark:border-white/5">
          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider block mb-1">Placed</span>
          <p className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-white/90">{placedCount}</p>
        </div>
        <div className="rounded-2xl bg-warning-50/80 backdrop-blur-sm p-4 dark:bg-warning-500/10 border border-warning-100 dark:border-warning-500/20">
          <span className="text-[10px] sm:text-xs text-warning-600 dark:text-warning-400 font-semibold uppercase tracking-wider block mb-1">Preparing</span>
          <p className="text-2xl sm:text-3xl font-black text-warning-700 dark:text-warning-300">{preparingCount}</p>
        </div>
        <div className="rounded-2xl bg-success-50/80 backdrop-blur-sm p-4 dark:bg-success-500/10 border border-success-100 dark:border-success-500/20">
          <span className="text-[10px] sm:text-xs text-success-600 dark:text-success-400 font-semibold uppercase tracking-wider block mb-1">Delivered</span>
          <p className="text-2xl sm:text-3xl font-black text-success-700 dark:text-success-300">{deliveredCount}</p>
        </div>
      </div>
    </Link>
  );
}
