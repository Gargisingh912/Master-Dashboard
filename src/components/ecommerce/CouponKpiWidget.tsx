import { Link } from "react-router";
import { useKitchen } from "../../context/KitchenContext";
import { Tag } from "lucide-react";

export default function CouponKpiWidget() {
  const { coupons } = useKitchen();

  const activeCouponsCount = coupons.filter(c => c.is_active).length;
  const totalUses = coupons.reduce((sum, c) => sum + c.used_count, 0);

  return (
    <Link
      to="/coupons"
      className="block bento-glass p-6 group"
    >
      <div className="absolute -bottom-4 -right-4 p-4 opacity-5 group-hover:opacity-10 group-hover:-translate-y-2 group-hover:-translate-x-2 transition-all duration-500">
        <Tag size={120} />
      </div>

      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-2xl shadow-lg shadow-orange-500/30">
          <Tag size={24} />
        </div>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-500 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14m-7-7 7 7-7 7" />
          </svg>
        </div>
      </div>

      <div className="relative z-10">
        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
          Discount Coupons
        </h4>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black text-gray-800 dark:text-white/90">
            {activeCouponsCount}
          </p>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">active</span>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-white/10 flex justify-between items-center text-xs font-semibold">
          <span className="text-gray-500 dark:text-gray-400">Total Uses</span>
          <span className="text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2 py-1 rounded-lg">
            {totalUses.toLocaleString()} times
          </span>
        </div>
      </div>
    </Link>
  );
}
