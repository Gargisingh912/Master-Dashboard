import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";



import { useKitchen } from "../../../context/KitchenContext";

export default function OrdersTable() {
  const { orders, menu, updateOrderStatus } = useKitchen();
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
  {/* Table Header */}
  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
    <TableRow>
      <TableCell
        isHeader
        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
      >
        Order ID
      </TableCell>
      <TableCell
        isHeader
        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
      >
        Customer Name
      </TableCell>
      <TableCell
        isHeader
        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
      >
        Items
      </TableCell>
      <TableCell
        isHeader
        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
      >
        Total
      </TableCell>
      <TableCell
        isHeader
        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
      >
        Status
      </TableCell>
    </TableRow>
  </TableHeader>

  {/* Table Body */}
  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
    {orders.map((order, index) => (
      <TableRow key={order.id}>
        {/* Order ID (display number, UUID retained internally) */}
        <TableCell className="px-5 py-4 sm:px-6 text-start">
          <div className="flex items-center gap-3">
            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
              #{orders.length - index}
            </span>
          </div>
        </TableCell>

        {/* Customer Name */}
        <TableCell className="px-5 py-4 sm:px-6 text-start">
          <div className="flex items-center gap-3">
            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
              {order.customer.name}
            </span>
          </div>
        </TableCell>

        {/* Items */}
        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
          {order.items.map(item => {
            const menuItem = menu.find(m => m.id === item.menuItemId);
            return menuItem ? `${menuItem.name} (x${item.quantity})` : `Unknown Item (x${item.quantity})`;
          }).join(", ")}
        </TableCell>

        {/* Total */}
        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
  ₹{order.total}
</TableCell>

        {/* Status */}
        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
          <select
  value={order.status}
  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
  disabled={order.status === "Delivered"}
  className={`rounded-full px-3 py-1 text-xs font-medium border-0 focus:ring-2 focus:ring-brand-500 ${
    order.status === "Delivered" ? "cursor-not-allowed opacity-75" : "cursor-pointer"
  } ${
    order.status === "Delivered"
      ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400"
      : order.status === "Preparing"
      ? "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400"
      : "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80"
  }`}
>
            <option value="Placed" className="text-gray-800 bg-white">Placed</option>
            <option value="Preparing" className="text-gray-800 bg-white">Preparing</option>
            <option value="Delivered" className="text-gray-800 bg-white">Delivered</option>
          </select>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
      </div>
    </div>
  );
}
