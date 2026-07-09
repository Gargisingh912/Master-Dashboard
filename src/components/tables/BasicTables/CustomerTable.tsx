import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { useKitchen } from "../../../context/KitchenContext";

export default function CustomerTable() {
  const { orders } = useKitchen();

  const customers = useMemo(() => {
    const map = new Map<string, any>();

    orders.forEach((order) => {
      const contact = order.customer.contact || "Unknown";
      if (!map.has(contact)) {
        map.set(contact, {
          contact,
          name: order.customer.name,
          email: order.customer.email || "-",
          dob: order.customer.dob || "-",
          orderCount: 0,
          totalSpent: 0,
        });
      }

      const c = map.get(contact);
      // Update name/email/dob if they were missing before but present now
      if (!c.name && order.customer.name) c.name = order.customer.name;
      if (c.email === "-" && order.customer.email) c.email = order.customer.email;
      if (c.dob === "-" && order.customer.dob) c.dob = order.customer.dob;

      c.orderCount += 1;

      // Extract numeric value from "₹450.00"
      const totalStr = typeof order.total === "string" ? order.total : String(order.total);
      const totalNum = parseFloat(totalStr.replace(/[^0-9.-]+/g, "")) || 0;
      c.totalSpent += totalNum;
    });

    return Array.from(map.values());
  }, [orders]);

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
                Contact
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Name
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Email
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                DOB
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Number of Orders
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Total Spent
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {customers.map((customer, index) => (
              <TableRow key={index}>
                <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-white/90">
                  {customer.contact}
                </TableCell>
                <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-white/90">
                  {customer.name}
                </TableCell>
                <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {customer.email}
                </TableCell>
                <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {customer.dob}
                </TableCell>
                <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {customer.orderCount}
                </TableCell>
                <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-white/90 font-medium">
                  ₹{customer.totalSpent.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}

            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
