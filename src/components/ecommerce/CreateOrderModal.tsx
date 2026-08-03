import React, { useMemo, useState } from "react";
import { useKitchen, MenuAddon } from "../../context/KitchenContext";
import { useOrderDraft } from "../../context/OrderDraftContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getBestSellingIds, getDietRank } from "../../utils/helpers";
import { X, ChevronDown, Search, Trash2 } from "lucide-react";

// ── Composite cart key helpers ──────────────────────────────────────────────
const makeCartKey = (menuItemId: string, addonIds: string[]): string => {
  if (addonIds.length === 0) return menuItemId;
  return `${menuItemId}::${[...addonIds].sort().join(",")}`;
};

const parseCartKey = (key: string): { menuItemId: string; addonIds: string[] } => {
  const [menuItemId, addonPart] = key.split("::");
  return { menuItemId, addonIds: addonPart ? addonPart.split(",") : [] };
};

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateOrderModal({ isOpen, onClose }: CreateOrderModalProps) {
  const { menu, orders, addOrder, categories: kitchenCategories } = useKitchen();
  const {
    contact, setContact,
    customerName, setCustomerName,
    email, setEmail,
    dob, setDob,
    notes, setNotes,
    discount, setDiscount,
    cart, setCart,
    clearDraft,
  } = useOrderDraft();

  // ── Search ───────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");

  // ── Nested accordion state ──────────────────────────────────────────────────
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [openSubcategories, setOpenSubcategories] = useState<Set<string>>(new Set());

  const toggleCategory = (tab: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(tab)) next.delete(tab);
      else next.add(tab);
      return next;
    });
  };

  const toggleSubcategory = (key: string) => {
    setOpenSubcategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // ── Add-on picker state
  const [addonPickerItemId, setAddonPickerItemId] = useState<string | null>(null);
  const [pendingAddonIds, setPendingAddonIds] = useState<Set<string>>(new Set());

  const availableMenu = menu.filter((m) => m.isAvailable);
  const bestSellingIds = useMemo(() => getBestSellingIds(orders), [orders]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    availableMenu.forEach((m) => { if (m.category) cats.add(m.category); });
    return Array.from(cats).sort((a, b) => {
      const rankA = kitchenCategories.find(c => c.name === a)?.rank ?? 9999;
      const rankB = kitchenCategories.find(c => c.name === b)?.rank ?? 9999;
      return rankA - rankB;
    });
  }, [availableMenu, kitchenCategories]);

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

  const itemsForCategory = (cat: string) => {
    let items = [];
    if (cat === "Best Selling") {
      items = availableMenu.filter((m) => bestSellingIds.includes(m.id));
      items.sort((a, b) => bestSellingIds.indexOf(a.id) - bestSellingIds.indexOf(b.id));
    } else {
      items = grouped[cat] || [];
      items = [...items].sort((a, b) => {
        const rankDiff = getDietRank(a.diet_type as string) - getDietRank(b.diet_type as string);
        return rankDiff !== 0 ? rankDiff : a.price - b.price;
      });
    }
    return items;
  };

  const groupBySubcategory = (items: typeof availableMenu) => {
    const g: Record<string, typeof availableMenu> = {};
    items.forEach((m) => {
      const sub = m.subcategory || "";
      if (!g[sub]) g[sub] = [];
      g[sub].push(m);
    });
    return g;
  };

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    return availableMenu.filter((m) => m.name.toLowerCase().includes(q));
  }, [searchQuery, availableMenu]);

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

  const addToCart = (key: string) => setCart((p) => ({ ...p, [key]: (p[key] || 0) + 1 }));
  const removeFromCart = (key: string) =>
    setCart((p) => {
      if (!p[key]) return p;
      if (p[key] <= 1) { const n = { ...p }; delete n[key]; return n; }
      return { ...p, [key]: p[key] - 1 };
    });
  const removeLineCompletely = (key: string) =>
    setCart((p) => {
      const n = { ...p };
      delete n[key];
      return n;
    });

  const totalQtyForItem = (itemId: string): number =>
    Object.entries(cart)
      .filter(([key]) => parseCartKey(key).menuItemId === itemId)
      .reduce((s, [, qty]) => s + qty, 0);

  const totalQtyForItems = (items: { id: string }[]): number =>
    items.reduce((sum, i) => sum + totalQtyForItem(i.id), 0);

  const handleAddClick = (item: (typeof availableMenu)[number]) => {
    if (item.addons.length === 0) {
      addToCart(makeCartKey(item.id, []));
      return;
    }
    setAddonPickerItemId(item.id);
    setPendingAddonIds(new Set());
  };

  const toggleAddonSelection = (addonId: string) => {
    setPendingAddonIds((prev) => {
      const next = new Set(prev);
      if (next.has(addonId)) next.delete(addonId);
      else next.add(addonId);
      return next;
    });
  };

  const confirmAddonSelection = () => {
    if (!addonPickerItemId) return;
    addToCart(makeCartKey(addonPickerItemId, Array.from(pendingAddonIds)));
    setAddonPickerItemId(null);
    setPendingAddonIds(new Set());
  };

  const cancelAddonSelection = () => {
    setAddonPickerItemId(null);
    setPendingAddonIds(new Set());
  };

  const resolveCartLine = (key: string, qty: number) => {
    const { menuItemId, addonIds } = parseCartKey(key);
    const item = availableMenu.find((m) => m.id === menuItemId);
    if (!item) return null;
    const selectedAddons: MenuAddon[] = addonIds
      .map((id) => item.addons.find((a) => a.id === id))
      .filter(Boolean) as MenuAddon[];
    const addonTotal = selectedAddons.reduce((s, a) => s + a.price, 0);
    return {
      key,
      menuItemId,
      name: item.name,
      basePrice: item.price,
      addons: selectedAddons,
      unitPrice: item.price + addonTotal,
      quantity: qty,
    };
  };

  const cartLines = Object.entries(cart)
    .map(([key, qty]) => resolveCartLine(key, qty))
    .filter(Boolean) as NonNullable<ReturnType<typeof resolveCartLine>>[];

  const subtotal = cartLines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact || !customerName || cartLines.length === 0) return;
    if (contact.length !== 10) { alert("Please enter a valid 10-digit phone number."); return; }

    addOrder(
      customerName,
      cartLines.map((l) => ({
        menuItemId: l.menuItemId,
        quantity: l.quantity,
        selectedAddons: l.addons.map((a) => ({ addon_id: a.id, name: a.name, price: a.price })),
      })) as any, 
      discount,
      contact,
      email,
      dob ? dob.toISOString().split("T")[0] : undefined,
      notes
    );

    clearDraft();
    setSearchQuery("");
    onClose();
  };

  const renderItemCard = (item: (typeof availableMenu)[number]) => {
    const totalQtyForItemValue = totalQtyForItem(item.id);
    const isPickerOpen = addonPickerItemId === item.id;

    return (
      <div
        key={item.id}
        className={`relative rounded-xl border p-3.5 transition-all ${
          totalQtyForItemValue > 0
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
            {item.addons.length > 0 && (
              <p className="text-[11px] text-gray-400 mt-0.5">{item.addons.length} add-on{item.addons.length !== 1 ? "s" : ""} available</p>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          {totalQtyForItemValue > 0 && item.addons.length === 0 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => removeFromCart(makeCartKey(item.id, []))}
                className="w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-base font-bold hover:bg-gray-50 transition-colors"
              >
                −
              </button>
              <span className="w-5 text-center text-sm font-bold text-gray-800 dark:text-white/90">{totalQtyForItemValue}</span>
              <button
                type="button"
                onClick={() => addToCart(makeCartKey(item.id, []))}
                className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center text-base font-bold hover:bg-brand-600 transition-colors"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => removeLineCompletely(makeCartKey(item.id, []))}
                className="w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-red-500 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                title="Remove item"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleAddClick(item)}
              className="rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold px-3 py-1 hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors"
            >
              {totalQtyForItemValue > 0 ? `Add another (${totalQtyForItemValue} in cart)` : "Add"}
            </button>
          )}
        </div>

        {isPickerOpen && (
          <div
            className="mt-3 pt-3 border-t border-gray-200 dark:border-white/[0.08] space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Choose add-ons</p>
            {item.addons.map((addon) => (
              <label key={addon.id} className="flex items-center justify-between text-sm cursor-pointer">
                <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={pendingAddonIds.has(addon.id)}
                    onChange={() => toggleAddonSelection(addon.id)}
                    className="rounded border-gray-300"
                  />
                  {addon.name}
                </span>
                <span className="text-gray-500">+₹{addon.price}</span>
              </label>
            ))}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={cancelAddonSelection}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAddonSelection}
                className="flex-1 rounded-lg bg-brand-500 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
              >
                Add to Cart
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCategorySection = (tab: string) => {
    const isOpen = openCategories.has(tab);
    const items = itemsForCategory(tab);
    const cartCountInTab = totalQtyForItems(items);
    const subGroups = groupBySubcategory(items);
    const subKeys = Object.keys(subGroups);

    return (
      <div
        key={tab}
        className="rounded-xl border border-gray-200 dark:border-white/[0.07] overflow-hidden"
      >
        <button
          type="button"
          onClick={() => toggleCategory(tab)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-white/[0.03] hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-white/90">
            {tab}
            {tab === "Best Selling" && <span className="text-xs">🔥</span>}
            <span className="text-xs font-normal text-gray-400 dark:text-gray-500">({items.length})</span>
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
          <div className="p-3 bg-white dark:bg-gray-900 space-y-2">
            {items.length > 0 ? (
              subKeys.map((sub) => {
                if (!sub) {
                  return (
                    <div key="__none__" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {subGroups[sub].map((item) => renderItemCard(item))}
                    </div>
                  );
                }

                const subItems = subGroups[sub];
                const subKey = `${tab}::${sub}`;
                const isSubOpen = openSubcategories.has(subKey);
                const subCartCount = totalQtyForItems(subItems);

                return (
                  <div key={subKey} className="rounded-lg border border-gray-100 dark:border-white/[0.06] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleSubcategory(subKey)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-gray-50/70 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors"
                    >
                      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {sub}
                        <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 normal-case">
                          ({subItems.length})
                        </span>
                        {subCartCount > 0 && (
                          <span className="text-[10px] font-bold text-white bg-brand-500 rounded-full px-1.5 py-0.5 normal-case">
                            {subCartCount}
                          </span>
                        )}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`text-gray-400 transition-transform ${isSubOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isSubOpen && (
                      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {subItems.map((item) => renderItemCard(item))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic py-2">
                No items in this category.
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-gray-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/[0.05] bg-white dark:bg-gray-900">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Create New Order</h2>
          <button
            type="button"
            onClick={onClose}
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

          {/* Menu selector */}
          <div className="px-6 py-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select Items</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
                {searchResults.map((item) => renderItemCard(item))}
                {searchResults.length === 0 && (
                  <p className="col-span-full text-sm text-gray-400 dark:text-gray-500 italic py-4">
                    No items found for "{searchQuery}".
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {tabs.map((tab) => renderCategorySection(tab))}
              </div>
            )}
          </div>

          {/* Cart summary */}
          {cartLines.length > 0 && (
            <div className="mx-6 mb-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] p-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Order Summary <span className="text-gray-400 font-normal">({cartLines.length} item{cartLines.length !== 1 ? "s" : ""})</span>
              </p>
              <div className="space-y-1.5 mb-3">
                {cartLines.map((line) => (
                  <div key={line.key} className="flex justify-between items-start text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      {line.name} <span className="text-gray-400">× {line.quantity}</span>
                      {line.addons.length > 0 && (
                        <span className="block text-xs text-gray-400 mt-0.5">
                          + {line.addons.map((a) => a.name).join(", ")}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="font-medium text-gray-800 dark:text-white/80">₹{(line.unitPrice * line.quantity).toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => removeLineCompletely(line.key)}
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
              onClick={onClose}
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
  );
}
