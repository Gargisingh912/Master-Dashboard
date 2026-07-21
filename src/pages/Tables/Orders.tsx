import React, { useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import OrdersTable from "../../components/tables/BasicTables/OrdersTable";
import { useKitchen } from "../../context/KitchenContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getBestSellingIds } from "../../utils/helpers";

export default function Orders() {
  const { menu, orders, addOrder } = useKitchen();

  // ── customer fields ──────────────────────────────────────────────────────────
  const [contact, setContact] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState<Date | null>(null);
  const [discount, setDiscount] = useState(0);

  // ── cart (menuItemId → quantity) ─────────────────────────────────────────────
  const [cart, setCart] = useState<Record<string, number>>({});

  // ── category tab ─────────────────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState<string>("Best Selling");

  const availableMenu = menu.filter((m) => m.isAvailable);

  // ── Best Selling: same logic as "Highest Selling Dishes" KPI ────────────────
  // Last 30 days, top 5 by quantity, no minimum threshold
  const bestSellingIds = useMemo(() => getBestSellingIds(orders), [orders]);

  // ── Categories ───────────────────────────────────────────────────────────────
  const categories = useMemo(() => {
    const cats = new Set<string>();
    availableMenu.forEach((m) => { if (m.category) cats.add(m.category); });
    return Array.from(cats).sort();
  }, [availableMenu]);

  const grouped = useMemo(() => {
    const g: Record<string, typeof availableMenu> = {};
    availableMenu.forEach((m) => {
      const cat = m.category || "Other";
      if (!g[cat]) g[cat] = [];
      g[cat].push(m);
    });
    return g;
  }, [availableMenu]);

  const tabs = useMemo(() => {
    const t: string[] = [];
    if (bestSellingIds.length > 0) t.push("Best Selling");
    t.push(...categories);
    if (availableMenu.some((m) => !m.category)) t.push("Other");
    return t;
  }, [bestSellingIds, categories, availableMenu]);

  // Default to first available tab
  const resolvedActive = tabs.includes(activeCategory) ? activeCategory : tabs[0] ?? "Best Selling";

  const visibleItems = useMemo(() => {
    if (resolvedActive === "Best Selling") {
      return availableMenu.filter((m) => bestSellingIds.includes(m.id));
    }
    return grouped[resolvedActive] || [];
  }, [resolvedActive, availableMenu, bestSellingIds, grouped]);

  // ── contact auto-fill ────────────────────────────────────────────────────────
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setContact(val);
    if (val.length >= 10) {
      const found = orders.find((o) => o.customer.contact === val)?.customer;
      if (found) {
        if (found.name) setCustomerName(found.name);
        if (found.email) setEmail(found.email);
        if (found.dob) setDob(new Date(found.dob));
      }
    }
  };

  // ── cart helpers ─────────────────────────────────────────────────────────────
  const addToCart = (id: string) => setCart((p) => ({ ...p, [id]: (p[id] || 0) + 1 }));
  const removeFromCart = (id: string) =>
    setCart((p) => {
      if (!p[id]) return p;
      if (p[id] <= 1) { const n = { ...p }; delete n[id]; return n; }
      return { ...p, [id]: p[id] - 1 };
    });

  const cartLines = Object.entries(cart)
    .map(([id, qty]) => {
      const item = availableMenu.find((m) => m.id === id);
      return item ? { menuItemId: id, name: item.name, price: item.price, quantity: qty } : null;
    })
    .filter(Boolean) as { menuItemId: string; name: string; price: number; quantity: number }[];

  const subtotal = cartLines.reduce((s, l) => s + l.price * l.quantity, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  // ── submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact || !customerName || cartLines.length === 0) return;
    if (contact.length !== 10) { alert("Please enter a valid 10-digit phone number."); return; }

    addOrder(
      customerName,
      cartLines.map((l) => ({ menuItemId: l.menuItemId, quantity: l.quantity })),
      discount,
      contact,
      email,
      dob ? dob.toISOString().split("T")[0] : ""
    );

    setContact(""); setCustomerName(""); setEmail(""); setDob(null);
    setDiscount(0); setCart({});
  };

  return (
    <>
      <PageMeta title="Orders Management | Kitchen Dashboard" description="Manage orders for the kitchen" />
      <div className="space-y-6">

        {/* ── Create Order Form ── */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/[0.05]">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Create New Order</h2>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Customer details */}
            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-100 dark:border-white/[0.05]">
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
                      Friends &amp; Family
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Menu selector — category tabs + card grid ── */}
            <div className="px-6 py-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select Items</p>

              {/* Category tab bar */}
              {tabs.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveCategory(tab)}
                      className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                        resolvedActive === tab
                          ? "bg-brand-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/[0.05] dark:text-gray-400 dark:hover:bg-white/[0.08]"
                      }`}
                    >
                      {tab}
                      {tab === "Best Selling" && (
                        <span className="ml-1.5 text-[10px] opacity-75">🔥</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Item cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
                {visibleItems.map((item) => {
                  const qty = cart[item.id] || 0;
                  return (
                    <div
                      key={item.id}
                      className={`relative rounded-xl border p-3.5 transition-all ${
                        qty > 0
                          ? "border-brand-400 bg-brand-50 dark:border-brand-500/50 dark:bg-brand-500/10"
                          : "border-gray-200 bg-gray-50 dark:border-white/[0.07] dark:bg-white/[0.02] hover:border-gray-300"
                      }`}
                    >
                      {/* Best-seller badge */}
                      {resolvedActive !== "Best Selling" && bestSellingIds.includes(item.id) && (
                        <span className="absolute top-2 right-2 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                          🔥 Top
                        </span>
                      )}

                      <p className="font-semibold text-gray-800 dark:text-white/90 text-sm leading-snug pr-8">{item.name}</p>
                      <p className="text-brand-500 font-medium text-sm mt-0.5">₹{item.price}</p>

                      <div className="mt-3 flex items-center justify-between">
                        {qty > 0 ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-base font-bold hover:bg-gray-50 transition-colors"
                            >
                              −
                            </button>
                            <span className="w-5 text-center text-sm font-bold text-gray-800 dark:text-white/90">{qty}</span>
                            <button
                              type="button"
                              onClick={() => addToCart(item.id)}
                              className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center text-base font-bold hover:bg-brand-600 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(item.id)}
                            className="rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold px-3 py-1 hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {visibleItems.length === 0 && (
                  <p className="col-span-full text-sm text-gray-400 dark:text-gray-500 italic py-4">
                    No items in this category.
                  </p>
                )}
              </div>
            </div>

            {/* ── Cart summary ── */}
            {cartLines.length > 0 && (
              <div className="mx-6 mb-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] p-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Order Summary <span className="text-gray-400 font-normal">({cartLines.length} item{cartLines.length !== 1 ? "s" : ""})</span>
                </p>
                <div className="space-y-1.5 mb-3">
                  {cartLines.map((line) => (
                    <div key={line.menuItemId} className="flex justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">
                        {line.name} <span className="text-gray-400">× {line.quantity}</span>
                      </span>
                      <span className="font-medium text-gray-800 dark:text-white/80">₹{(line.price * line.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 dark:border-white/[0.08] pt-2 space-y-1">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-success-600 dark:text-success-400">
                      <span>Discount ({discount}%)</span>
                      <span>−₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-800 dark:text-white/90 pt-1">
                    <span>Total</span>
                    <span className="text-brand-500">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="px-6 pb-6 flex justify-end border-t border-gray-100 dark:border-white/[0.05] pt-4">
              <button
                type="submit"
                disabled={cartLines.length === 0 || !contact || !customerName}
                className="rounded-lg bg-brand-500 px-8 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Place Order {total > 0 && `· ₹${total.toFixed(2)}`}
              </button>
            </div>
          </form>
        </div>

        <OrdersTable />
      </div>
    </>
  );
}
