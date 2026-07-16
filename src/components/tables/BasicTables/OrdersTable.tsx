import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";



import { useState, useRef } from "react";
import { useKitchen } from "../../../context/KitchenContext";
import { Edit, Check, X, FileText, Printer } from "lucide-react";

const playAcceptSound = () => {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;
  const ctx = new AudioContextClass();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  osc.type = "sine";
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
  
  osc.start();
  gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
  osc.stop(ctx.currentTime + 0.5);
};

export default function OrdersTable() {
  const { orders, menu, updateOrderStatus, updateOrder } = useKitchen();
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editingItems, setEditingItems] = useState<any[]>([]);
  const [invoiceOrder, setInvoiceOrder] = useState<any>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleEditClick = (order: any) => {
    setEditingOrderId(order.id);
    // clone items
    setEditingItems(order.items.map((i: any) => ({ ...i })));
  };

  const handleUpdateEditingItem = (index: number, field: string, value: string | number) => {
    const newItems = [...editingItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditingItems(newItems);
  };

  const handleAddEditingItem = () => {
    if (menu.length > 0) {
      setEditingItems([...editingItems, { menuItemId: menu[0].id, quantity: 1 }]);
    }
  };

  const handleRemoveEditingItem = (index: number) => {
    setEditingItems(editingItems.filter((_, i) => i !== index));
  };

  const handleSaveEdit = async () => {
    if (!editingOrderId) return;
    await updateOrder(editingOrderId, {
      items: editingItems,
    });
    setEditingOrderId(null);
  };

  const handleStatusChange = (order: any, newStatus: string) => {
    if (newStatus === "Preparing") {
      playAcceptSound();
      setInvoiceOrder(order);
    }
    updateOrderStatus(order.id, newStatus);
  };
  
  const handlePrint = () => {
    if (invoiceRef.current) {
      const printContents = invoiceRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Reload to restore React state cleanly
    }
  };
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
      <TableCell
        isHeader
        className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
      >
        Actions
      </TableCell>
    </TableRow>
  </TableHeader>

  {/* Table Body */}
  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
    {orders.filter(o => o.status !== "Declined" && o.status !== "Missed" && o.status !== "Cancelled").map((order) => (
      <TableRow key={order.id}>
        {/* Order ID (display number, UUID retained internally) */}
        <TableCell className="px-5 py-4 sm:px-6 text-start">
          <div className="flex items-center gap-3">
            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
              #{orders.length - orders.findIndex(o => o.id === order.id)}
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
          {editingOrderId === order.id ? (
            <div className="flex flex-col gap-2 min-w-[250px]">
              {editingItems.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select
                    value={item.menuItemId}
                    onChange={(e) => handleUpdateEditingItem(idx, 'menuItemId', e.target.value)}
                    className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700"
                  >
                    {menu.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleUpdateEditingItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-16 rounded border border-gray-300 px-2 py-1 text-sm focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700"
                  />
                  <button onClick={() => handleRemoveEditingItem(idx)} className="text-red-500 hover:text-red-700 p-1">
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button onClick={handleAddEditingItem} className="text-xs text-brand-500 font-semibold self-start hover:text-brand-600">
                + Add Item
              </button>
            </div>
          ) : (
            order.items.map(item => {
              const menuItem = menu.find(m => m.id === item.menuItemId);
              return menuItem ? `${menuItem.name} (x${item.quantity})` : `Unknown Item (x${item.quantity})`;
            }).join(", ")
          )}
        </TableCell>

        {/* Total */}
        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
          {editingOrderId === order.id ? (
            <span className="italic text-gray-400">Auto-calculated</span>
          ) : (
            `₹${order.total}`
          )}
        </TableCell>

        {/* Status */}
        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
          <select
  value={order.status}
  onChange={(e) => handleStatusChange(order, e.target.value)}
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
        
        {/* Actions */}
        <TableCell className="px-4 py-3 text-end">
          {editingOrderId === order.id ? (
            <div className="flex justify-end gap-2">
              <button onClick={handleSaveEdit} className="text-green-500 hover:text-green-700">
                <Check size={18} />
              </button>
              <button onClick={() => setEditingOrderId(null)} className="text-gray-500 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              {(order.status === "Preparing" || order.status === "Delivered") && (
                <button onClick={() => setInvoiceOrder(order)} className="text-gray-500 hover:text-gray-700" title="View Invoice">
                  <FileText size={18} />
                </button>
              )}
              <button onClick={() => handleEditClick(order)} className="text-blue-500 hover:text-blue-700" title="Edit Order">
                <Edit size={18} />
              </button>
            </div>
          )}
        </TableCell>
      </TableRow>
    ))}
  </TableBody>

</Table>
      </div>

      {/* Invoice Modal */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-theme-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setInvoiceOrder(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            >
              <X size={24} />
            </button>
            
            <div ref={invoiceRef} className="p-8 text-gray-800 dark:text-white">
              <div className="text-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <h2 className="text-2xl font-bold uppercase tracking-widest">INVOICE</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Order #{orders.length - orders.findIndex(o => o.id === invoiceOrder.id)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(invoiceOrder.date).toLocaleString()}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-1">Customer Details:</h3>
                <p>{invoiceOrder.customer.name}</p>
                {invoiceOrder.customer.contact && <p>{invoiceOrder.customer.contact}</p>}
                {invoiceOrder.customer.email && <p>{invoiceOrder.customer.email}</p>}
              </div>
              
              <div className="mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                      <th className="pb-2 font-semibold">Item</th>
                      <th className="pb-2 font-semibold text-center">Qty</th>
                      <th className="pb-2 font-semibold text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceOrder.items.map((item: any, i: number) => {
                      const menuItem = menu.find((m) => m.id === item.menuItemId);
                      return (
                        <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-2">{menuItem ? menuItem.name : 'Unknown'}</td>
                          <td className="py-2 text-center">{item.quantity}</td>
                          <td className="py-2 text-right">₹{menuItem ? (menuItem.price * item.quantity).toFixed(2) : '0.00'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end text-sm">
                <div className="w-48 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Subtotal:</span>
                    <span>₹{invoiceOrder.subtotal.toFixed(2)}</span>
                  </div>
                  {invoiceOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Discount ({invoiceOrder.discount}%):</span>
                      <span>-₹{((invoiceOrder.subtotal * invoiceOrder.discount) / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                    <span>Total:</span>
                    <span>₹{invoiceOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 italic">
                Thank you for your order!
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
              <button 
                onClick={() => setInvoiceOrder(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Close
              </button>
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600"
              >
                <Printer size={16} /> Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
