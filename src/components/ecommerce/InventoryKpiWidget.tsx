import { Link } from "react-router";
import { useKitchen } from "../../context/KitchenContext";
import { PackageOpen, AlertTriangle } from "lucide-react";

export default function InventoryKpiWidget() {
  const { inventory } = useKitchen();

  // Sort inventory by lowest quantity first and take top 3
  const lowestStockItems = [...inventory]
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 3);

  const lowStockThreshold = 10; // arbitrary threshold for visualization

  return (
    <Link
      to="/inventory"
      className="block bento-glass p-6 group"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:rotate-12 transition-all duration-500">
        <PackageOpen size={100} />
      </div>

      <div className="relative z-10 flex items-center justify-between mb-5">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/30">
          <PackageOpen size={24} />
        </div>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-500 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14m-7-7 7 7-7 7" />
          </svg>
        </div>
      </div>

      <div className="relative z-10">
        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Inventory Status
        </h4>

        <div className="space-y-3">
          {lowestStockItems.length === 0 ? (
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              No inventory items found.
            </p>
          ) : (
            lowestStockItems.map((item) => {
              const isLow = item.quantity <= lowStockThreshold;
              return (
                <div key={item.id} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate pr-2">
                    {item.name}
                  </span>
                  <div className={`flex items-center gap-1.5 text-sm font-bold ${isLow ? "text-red-500 dark:text-red-400" : "text-gray-800 dark:text-white/90"
                    }`}>
                    {isLow && <AlertTriangle size={12} strokeWidth={3} />}
                    {item.quantity} <span className="text-[10px] font-semibold opacity-70 uppercase">{item.unit}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Link>
  );
}
