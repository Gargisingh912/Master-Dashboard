import {
  BoxIconLine,
} from "../../icons";
import { useKitchen, MenuIngredient } from "../../context/KitchenContext";

// Same threshold/logic as menu.tsx — an ingredient is "low" once stock
// drops below 5x what a single dish requires.
const LOW_STOCK_MULTIPLIER = 5;

export default function EcommerceMetrics() {
  const { orders, menu, inventory } = useKitchen();

  const hasSufficientStock = (item: { ingredients: MenuIngredient[] }) => {
    if (item.ingredients.length === 0) return true; // no recipe defined — no constraint
    return item.ingredients.every((ing) => {
      const invItem = inventory.find((i) => i.id === ing.inventoryId);
      if (!invItem) return false; // referenced ingredient no longer exists
      return invItem.quantity >= ing.quantity * LOW_STOCK_MULTIPLIER;
    });
  };

  const lowStockCount = menu.filter((item) => !hasSufficientStock(item)).length;

  const todayStr = new Date().toISOString().split("T")[0];
  const todayOrders = orders.filter((o) => o.date && o.date.startsWith(todayStr));

  const totalOrders = todayOrders.length;

  const placedCount = orders.filter(o => o.status === "Placed").length;
  const preparingCount = orders.filter(o => o.status === "Preparing").length;
  const deliveredCount = orders.filter(o => o.status === "Delivered").length;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
  <span className="text-sm text-gray-500 dark:text-gray-400">
    Inventory Alerts
  </span>
  {lowStockCount === 0 ? (
    <h4 className="mt-2 flex items-center gap-1.5 font-bold text-title-sm text-success-600 dark:text-success-400">
      Inventory Stocked
    </h4>
  ) : (
    <h4 className="mt-2 flex items-center gap-1.5 font-bold text-title-sm text-red-600 dark:text-red-400">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className="shrink-0">
        <path fillRule="evenodd" clipRule="evenodd" d="M8.257 3.099c.765-1.36 2.72-1.36 3.486 0l6.516 11.598c.75 1.334-.213 2.987-1.743 2.987H3.484c-1.53 0-2.493-1.653-1.743-2.987L8.257 3.1zM10 7a1 1 0 011 1v3a1 1 0 11-2 0V8a1 1 0 011-1zm0 7a1 1 0 100 2 1 1 0 000-2z" />
      </svg>
      {lowStockCount.toLocaleString()}
    </h4>
  )}
</div>
          
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Orders (Today)
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {totalOrders.toLocaleString()}
            </h4>
          </div>

          
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
      </div>

      {/* Order Status KPI */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-4">Live Order Status</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Placed</span>
            <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">{placedCount}</p>
          </div>
          <div className="rounded-xl bg-warning-50 p-4 dark:bg-warning-500/10">
            <span className="text-xs text-warning-600 dark:text-warning-400 font-medium uppercase tracking-wider">Preparing</span>
            <p className="mt-1 text-2xl font-bold text-warning-700 dark:text-warning-300">{preparingCount}</p>
          </div>
          <div className="rounded-xl bg-success-50 p-4 dark:bg-success-500/10">
            <span className="text-xs text-success-600 dark:text-success-400 font-medium uppercase tracking-wider">Delivered</span>
            <p className="mt-1 text-2xl font-bold text-success-700 dark:text-success-300">{deliveredCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}