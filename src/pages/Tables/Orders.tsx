import React, { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import OrdersTable from "../../components/tables/BasicTables/OrdersTable";
import { useKitchen } from "../../context/KitchenContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Orders() {
  const { menu, orders, addOrder } = useKitchen();
  const [contact, setContact] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState<Date | null>(null);
  const [discount, setDiscount] = useState(0);
  const [orderItems, setOrderItems] = useState<{ menuItemId: string; quantity: number }[]>([]);

  const availableMenu = menu.filter(m => m.isAvailable);

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newContact = e.target.value;
    setContact(newContact);

    if (newContact.length >= 10) {
      const existingCustomer = orders.find(o => o.customer.contact === newContact)?.customer;
      if (existingCustomer) {
        if (existingCustomer.name) setCustomerName(existingCustomer.name);
        if (existingCustomer.email) setEmail(existingCustomer.email);
        if (existingCustomer.dob) setDob(new Date(existingCustomer.dob));
      }
    }
  };

  const handleAddItem = () => {
    if (availableMenu.length > 0) {
      setOrderItems([...orderItems, { menuItemId: availableMenu[0].id, quantity: 1 }]);
    }
  };

  const handleUpdateItem = (index: number, field: string, value: string) => {
    const updated = [...orderItems];
    if (field === "menuItemId") {
      updated[index].menuItemId = value;
    } else if (field === "quantity") {
      updated[index].quantity = parseInt(value, 10) || 1;
    }
    setOrderItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact || !customerName || orderItems.length === 0 || contact.length !== 10) {
      if (contact.length !== 10) {
        alert("Please enter a valid 10-digit phone number.");
      }
      return;
    }

    const mergedItems = orderItems.reduce((acc, curr) => {
      const existing = acc.find(item => item.menuItemId === curr.menuItemId);
      if (existing) {
        existing.quantity += curr.quantity;
      } else {
        acc.push({ ...curr });
      }
      return acc;
    }, [] as { menuItemId: string; quantity: number }[]);

    addOrder(customerName, mergedItems, discount, contact, email, dob ? dob.toISOString().split('T')[0] : "");
    
    setContact("");
    setCustomerName("");
    setEmail("");
    setDob(null);
    setDiscount(0);
    setOrderItems([]);
  };

  return (
    <>
      <PageMeta
        title="Orders Management | Kitchen Dashboard"
        description="Manage orders for the kitchen"
      />
      <div className="space-y-6">
        {/* Create Order Form */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-4">Create New Order</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Number</label>
                <input
                  type="tel"
                  value={contact}
                  onChange={handleContactChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  required
                  placeholder="Enter 10-digit number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                <div className="relative z-10 w-full">
                  <DatePicker
                    selected={dob}
                    onChange={(date: Date | null) => setDob(date)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select Date of Birth"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    min="0"
                    max="100"
                  />
                  {discount === 100 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-brand-500 bg-brand-50 dark:bg-brand-500/10 px-2 py-1 rounded-full">
                      Friends & Family
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order Items</label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-sm text-brand-500 hover:text-brand-600 font-medium"
                >
                  + Add Item
                </button>
              </div>

              {orderItems.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No items added to the order yet.</p>
              )}

              {orderItems.map((item, index) => (
                <div key={index} className="flex gap-4 items-center mb-2">
                  <select
                    value={item.menuItemId}
                    onChange={(e) => handleUpdateItem(index, "menuItemId", e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    {availableMenu.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} - ₹{m.price}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(index, "quantity", e.target.value)}
                    className="w-24 rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    min="1"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="submit"
                disabled={orderItems.length === 0}
                className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              >
                Place Order
              </button>
            </div>
          </form>
        </div>

        <OrdersTable />
      </div>
    </>
  );
}
