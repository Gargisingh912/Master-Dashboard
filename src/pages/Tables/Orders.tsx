import React, { useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import OrdersTable from "../../components/tables/BasicTables/OrdersTable";
import { useKitchen } from "../../context/KitchenContext";
import { useOrderDraft } from "../../context/OrderDraftContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getBestSellingIds } from "../../utils/helpers";
import { Plus, X, ChevronDown, Search, Trash2 } from "lucide-react";

export default function Orders() {
  const { menu, orders, addOrder } = useKitchen();
  const {
    contact, setContact,
    customerName, setCustomerName,
    email, setEmail,
    dob, setDob,
    notes, setNotes,
    discount, setDiscount,
    cart, setCart,
    activeCategory, setActiveCategory,
    clearDraft,
  } = useOrderDraft();

  // ── Floating button + modal visibility ────────────────────────────────────────
  const [showOrderForm, setShowOrderForm] = useState(false);

  // ── Search ───────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");

  const availableMenu = menu.filter((m) => m.isAvailable);

  // ── Best Selling: same logic as "Highest Selling Dishes" KPI ────────────────
  const bestSellingIds = useMemo(() => getBestSellingIds(orders), [orders]);

  // ── Categories ───────────────────────────────────────────────────────────────
  const categories = useMemo(() => {
    const cats = new Set<string>();
    availableMenu.forEach((m) => { if (m.category) cats.add(m.category); });
    return Array.from(cats);
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

  const resolvedActive = tabs.includes(activeCategory) ? activeCategory : "";

  const itemsForCategory = (cat: string) => {
    if (cat === "Best Selling") {
      return availableMenu.filter((m) => bestSellingIds.includes(m.id));
    }
    return grouped[cat] || [];
  };

  // ── Search results (flat, ignores category grouping when active) ────────────
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    return availableMenu.filter((m) => m.name.toLowerCase().includes(q));
  }, [searchQuery, availableMenu]);

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
  // Fully removes a line from the cart regardless of its current quantity
  const removeLineCompletely = (id: string) =>
    setCart((p) => {
      const n = { ...p };
      delete n[id];
      return n;
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
      dob ? dob.toISOString().split("T")[0] : undefined,
      notes
    );

    clearDraft();
    setSearchQuery("");
    setShowOrderForm(false);
  };

  // ── shared item card renderer (used by both accordion and search results) ──
  const renderItemCard = (item: (typeof availableMenu)[number]) => {
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
        {bestSellingIds.includes(item.id) && (
          <span className="absolute top-2 right-2 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
            🔥 Top
          </span>
        )}

        <div className="flex gap-3 items-start">
          {item.image_url && (
            <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-800 dark:text-white/90 text-sm leading-snug pr-8">{item.name}</p>
            <p className="text-brand-500 font-medium text-sm mt-0.5">₹{item.price}</p>
          </div>
        </div>

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
              <button
                type="button"
                onClick={() => removeLineCompletely(item.id)}
                className="w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-red-500 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                title="Remove item"
              >
                <Trash2 size={13} />
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
  };

  return (
    <>
      <PageMeta title="Orders Management | Kitchen Dashboard" description="Manage orders for the kitchen" />
      <div className="space-y-6">

        <OrdersTable />

        {/* ── Floating 'Order' button ── */}
        <button
          type="button"
          onClick={() => setShowOrderForm(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-brand-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-brand-600 hover:shadow-xl transition-all"
        >
          <Plus size={18} />
          Order
        </button>

        {/* ── Create Order Modal ── */}
        {showOrderForm && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowOrderForm(false)}
          >
            <div
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-gray-900 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/[0.05] bg-white dark:bg-gray-900">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Create New Order</h2>
                <button
                  type="button"
                  onClick={() => setShowOrderForm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X size={22} />
                </button>
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      placeholder="customer@email.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cooking Requests / Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      rows={2}
                      placeholder="e.g. Extra spicy, no onions, allergy notes..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date of Birth
                      <span className="ml-2 text-xs font-normal text-brand-500 italic">🎁 for exclusive offers</span>
                      <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
                    </label>
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

                {/* ── Menu selector — search + accordion categories ── */}
                <div className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select Items</p>

                  {/* Search bar */}
                  <div className="relative mb-4">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search menu items..."
                      className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  {searchResults !== null ? (
                    /* ── Flat search results ── */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
                      {searchResults.map((item) => renderItemCard(item))}
                      {searchResults.length === 0 && (
                        <p className="col-span-full text-sm text-gray-400 dark:text-gray-500 italic py-4">
                          No items found for "{searchQuery}".
                        </p>
                      )}
                    </div>
                  ) : (
                    /* ── Accordion by category ── */
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {tabs.map((tab) => {
                        const isOpen = resolvedActive === tab;
                        const items = itemsForCategory(tab);
                        const cartCountInTab = items.reduce((sum, i) => sum + (cart[i.id] || 0), 0);
                        return (
                          <div
                            key={tab}
                            className="rounded-xl border border-gray-200 dark:border-white/[0.07] overflow-hidden"
                          >
                            <button
                              type="button"
                              onClick={() => setActiveCategory(isOpen ? "" : tab)}
                              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-white/[0.03] hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
                            >
                              <span className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                                {tab}
                                {tab === "Best Selling" && <span className="text-xs">🔥</span>}
                                {cartCountInTab > 0 && (
                                  <span className="text-[10px] font-bold text-white bg-brand-500 rounded-full px-1.5 py-0.5">
                                    {cartCountInTab}
                                  </span>
                                )}
                              </span>
                              <ChevronDown
                                size={16}
                                className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                              />
                            </button>

                            {isOpen && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 bg-white dark:bg-gray-900">
                                {items.length > 0 ? (
                                  items.map((item) => renderItemCard(item))
                                ) : (
                                  <p className="col-span-full text-sm text-gray-400 dark:text-gray-500 italic py-2">
                                    No items in this category.
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ── Cart summary ── */}
                {cartLines.length > 0 && (
                  <div className="mx-6 mb-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] p-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Order Summary <span className="text-gray-400 font-normal">({cartLines.length} item{cartLines.length !== 1 ? "s" : ""})</span>
                    </p>
                    <div className="space-y-1.5 mb-3">
                      {cartLines.map((line) => (
                        <div key={line.menuItemId} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700 dark:text-gray-300">
                            {line.name} <span className="text-gray-400">× {line.quantity}</span>
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="font-medium text-gray-800 dark:text-white/80">₹{(line.price * line.quantity).toFixed(2)}</span>
                            <button
                              type="button"
                              onClick={() => removeLineCompletely(line.menuItemId)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              title="Remove from order"
                            >
                              <Trash2 size={13} />
                            </button>
                          </span>
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

                <div className="px-6 pb-6 flex justify-end gap-3 border-t border-gray-100 dark:border-white/[0.05] pt-4">
                  <button
                    type="button"
                    onClick={() => setShowOrderForm(false)}
                    className="rounded-lg px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
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
          </div>
        )}
      </div>
    </>
  );
}