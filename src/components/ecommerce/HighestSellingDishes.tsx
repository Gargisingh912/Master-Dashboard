import { useState, useMemo } from "react";
import { useKitchen } from "../../context/KitchenContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

export default function HighestSellingDishes() {
  const { orders, menu } = useKitchen();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");

  const topDishes = useMemo(() => {
    const now = new Date();
    const rangeInDays = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 365;

    // Filter orders by time range
    const filteredOrders = orders.filter((order) => {
      if (!order.date) return false;
      const orderDate = new Date(order.date);
      const diffTime = Math.abs(now.getTime() - orderDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= rangeInDays;
    });

    // Aggregate quantities by menuItemId
    const dishCounts: Record<string, number> = {};
    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!dishCounts[item.menuItemId]) {
          dishCounts[item.menuItemId] = 0;
        }
        dishCounts[item.menuItemId] += item.quantity;
      });
    });

    // Map to menu item details and sort
    const sortedDishes = Object.entries(dishCounts)
      .map(([menuItemId, quantity]) => {
        const dish = menu.find((m) => m.id === menuItemId);
        return {
          id: menuItemId,
          name: dish ? dish.name : "Unknown Dish",
          price: dish ? dish.price : 0,
          quantity,
          revenue: (dish ? dish.price : 0) * quantity,
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5); // top 5

    return sortedDishes;
  }, [orders, menu, timeRange]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 py-4 sm:px-6 flex justify-between items-center border-b border-gray-100 dark:border-white/[0.05]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Highest Selling Dishes
        </h3>
        <div className="flex gap-2">
          {(["week", "month", "year"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs font-medium rounded-lg capitalize ${
                timeRange === range
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Dish Name
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Price
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Units Sold
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Revenue
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {topDishes.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="px-5 py-6 text-center text-gray-500 text-sm">
                  No sales found in this period.
                </TableCell>
              </TableRow>
            )}
            {topDishes.map((dish) => (
              <TableRow key={dish.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {dish.name}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  ₹{dish.price}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-theme-sm font-medium text-brand-500">
                  {dish.quantity}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  ₹{dish.revenue.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
