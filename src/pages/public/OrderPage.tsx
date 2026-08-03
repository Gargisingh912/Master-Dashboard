import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { supabasePublic } from "../../config/supabasePublic";
import { base62ToUuid, generateOrderNumber } from "../../utils/helpers";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface MenuAddon {
  id: string;
  name: string;
  price: number;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category?: string;
  subcategory?: string;
  image_url?: string;
  image_urls?: string[];
  quantity_info?: string;
  spice_level?: number;
  diet_type?: "veg" | "nonveg" | "vegan";
  addons: MenuAddon[];
}

interface CartLine {
  key: string; // menuItemId, or menuItemId::addonId1,addonId2 for a specific add-on combo
  menu_item_id: string;
  name: string;
  basePrice: number;
  addons: MenuAddon[];
  unitPrice: number;
  quantity: number;
}

// A menu item with no add-ons has cart key === its own id. A menu item with
// a specific add-on combo gets a compound key so different combos of the
// same dish exist as separate cart lines (e.g. "Burger + Coke" vs "Burger + Fries").
const makeCartKey = (menuItemId: string, addonIds: string[]): string =>
  addonIds.length === 0 ? menuItemId : `${menuItemId}::${[...addonIds].sort().join(",")}`;

const parseCartKey = (key: string): { menuItemId: string; addonIds: string[] } => {
  const [menuItemId, addonPart] = key.split("::");
  return { menuItemId, addonIds: addonPart ? addonPart.split(",") : [] };
};

export default function OrderPage({ organizationId: propOrgId }: { organizationId?: string }) {
  const { organizationId: paramOrgId } = useParams<{ organizationId: string }>();
  const organizationId = propOrgId || paramOrgId;
  const [orgName, setOrgName] = useState("");
  const [orgLogo, setOrgLogo] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categoriesOrder, setCategoriesOrder] = useState<Record<string, number>>({});
  const [cart, setCart] = useState<Record<string, number>>({}); // cart key -> quantity
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [isLive, setIsLive] = useState(true);

  // Accordion open/close state — multi-open, so several categories (and
  // several subcategories within them) can be expanded at the same time.
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [openSubcats, setOpenSubcats] = useState<Set<string>>(new Set());

  // Feature 9: diet filter
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'nonveg' | 'vegan'>('all');

  const [contact, setContact] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [dob, setDob] = useState<Date | null>(null);
  const [lookupDone, setLookupDone] = useState(true); // Always show fields

  // Add-on picker state — which item's picker is open, and the addon ids
  // currently checked before confirming
  const [addonPickerItemId, setAddonPickerItemId] = useState<string | null>(null);
  const [pendingAddonIds, setPendingAddonIds] = useState<Set<string>>(new Set());

  // Feature 12: coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponId, setCouponId] = useState<string | null>(null);
  const [couponMinOrder, setCouponMinOrder] = useState(0);

  // Feature 7: image zoom
  const [zoomImages, setZoomImages] = useState<string[]>([]);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);

  const [submittedOrder, setSubmittedOrder] = useState<{
    id: string;
    order_id: string;
    total: number;
    created_at: string;
    status: string;
  } | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);

  // ── Anonymous session ────────────────────────────────────────────────────────
  useEffect(() => {
    const ensureAnonSession = async () => {
      const { data: sessionData } = await supabasePublic.auth.getSession();
      if (!sessionData.session) {
        const { error: signInError } = await supabasePublic.auth.signInAnonymously();
        if (signInError) {
          console.error("Anonymous sign-in failed:", signInError);
          setError("Could not start your ordering session. Please refresh and try again.");
        }
      }
      setAuthReady(true);
    };
    ensureAnonSession();
  }, []);

  // ── Order countdown + realtime ───────────────────────────────────────────────
  useEffect(() => {
    if (!submittedOrder || (submittedOrder.status !== "Placed" && submittedOrder.status !== "Waiting")) return;

    const startTime = new Date(submittedOrder.created_at).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, 60 - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        supabasePublic
          .from("orders")
          .update({ status: "Declined" })
          .eq("id", submittedOrder.id)
          .then(() => {
            setSubmittedOrder((prev) => (prev ? { ...prev, status: "Declined" } : null));
          });
      }
    }, 1000);

    const channel = supabasePublic
      .channel(`customer-order-${submittedOrder.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${submittedOrder.id}` },
        (payload) => {
          const updated = payload.new as { status: string };
          setSubmittedOrder((prev) => (prev ? { ...prev, status: updated.status } : null));
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabasePublic.removeChannel(channel);
    };
  }, [submittedOrder]);

  const handleEditOrder = async () => {
    if (!submittedOrder) return;
    await supabasePublic.from("orders").update({ status: "Declined" }).eq("id", submittedOrder.id);
    setEditingOrderId(submittedOrder.id);
    setSubmittedOrder(null);
  };

  // ── Fetch menu + org name ────────────────────────────────────────────────────
  useEffect(() => {
    if (!organizationId) return;
    const actualOrgId = base62ToUuid(organizationId);

    const fetchData = async () => {
      const { data: orgData, error: orgErr } = await supabasePublic
        .from("public_org_info")
        .select("name, is_live, logo_url")
        .eq("id", actualOrgId)
        .maybeSingle();

      if (orgErr) console.error("Failed to load organization:", orgErr);
      setOrgName(orgData?.name || "");
      if (orgData?.logo_url) setOrgLogo(orgData.logo_url);
      if (orgData?.is_live !== undefined) setIsLive(orgData.is_live);

      const { data: catData } = await supabasePublic
        .from("menu_categories")
        .select("name, rank")
        .eq("organization_id", actualOrgId);
        
      const catOrder: Record<string, number> = {};
      (catData || []).forEach((c: any) => {
        catOrder[c.name] = c.rank;
      });
      setCategoriesOrder(catOrder);

      const { data: items, error: menuErr } = await supabasePublic
        .from("menu_items")
        .select("id, name, price, category, subcategory, image_url, image_urls, quantity_info, spice_level, diet_type, menu_addons(id, name, price)")
        .eq("organization_id", actualOrgId)
        .eq("is_available", true);

      if (menuErr) console.error("Failed to load menu:", menuErr);

      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: recentOrders, error: ordersErr } = await supabasePublic
        .from("orders")
        .select("created_at, order_items(menu_item_id, quantity)")
        .eq("organization_id", actualOrgId)
        .gte("created_at", cutoff);

      if (ordersErr) console.error("Failed to load recent orders:", ordersErr);

      const counts: Record<string, number> = {};
      (recentOrders || []).forEach((o: any) => {
        (o.order_items || []).forEach((oi: any) => {
          counts[oi.menu_item_id] = (counts[oi.menu_item_id] || 0) + (oi.quantity || 0);
        });
      });

      const top5Ids = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id]) => id);

      setBestSellingIds(top5Ids);
      setMenuItems((items || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category ?? undefined,
        subcategory: item.subcategory ?? undefined,
        image_url: item.image_url ?? undefined,
        image_urls: item.image_urls || [],
        quantity_info: item.quantity_info ?? undefined,
        spice_level: item.spice_level ?? 0,
        diet_type: item.diet_type ?? undefined,
        addons: (item.menu_addons || []).map((a: any) => ({ id: a.id, name: a.name, price: a.price })),
      })));
      setLoading(false);
    };

    fetchData();
  }, [organizationId]);

  const [bestSellingIds, setBestSellingIds] = useState<string[]>([]);

  const bestSellingItems = menuItems.filter((m) => bestSellingIds.includes(m.id));
  bestSellingItems.sort((a, b) => bestSellingIds.indexOf(a.id) - bestSellingIds.indexOf(b.id));

  // ── Category Ordering ─────────────────────────────────────────────────────────
  const getCategoryRank = (category: string): number => {
    return categoriesOrder[category] ?? 9999;
  };

  const userCategories = Array.from(
    new Set(menuItems.map((m) => m.category).filter((c): c is string => !!c))
  ).sort((a, b) => getCategoryRank(a) - getCategoryRank(b));

  const grouped: Record<string, MenuItem[]> = {};
  menuItems.forEach((m) => {
    const cat = m.category || "Other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(m);
  });

  // Sub-grouping within a category. Only meaningful when a category has more
  // than one distinct subcategory value — a single-subcategory (or
  // subcategory-less) category renders as a flat list instead of a
  // pointless single header.
  const groupBySubcategory = (items: MenuItem[]): Record<string, MenuItem[]> => {
    const g: Record<string, MenuItem[]> = {};
    items.forEach((item) => {
      const sub = item.subcategory || "";
      if (!g[sub]) g[sub] = [];
      g[sub].push(item);
    });
    return g;
  };

  // ── Diet-first sort helper ────────────────────────────────────────────────────
  // Used only when dietFilter === 'all': veg items first, then non-veg, each
  // group ascending by price. Vegan is grouped with veg (both meat-free).
  const getDietRank = (type?: string): number => {
    if (type === 'veg' || type === 'vegan') return 0;
    if (type === 'nonveg') return 1;
    return 2; // items with no diet_type set, sorted last
  };

  // Items for a given top-level category, with diet filter + diet-first sort
  // applied (mirrors the old tab behavior, just keyed by category instead of
  // "active tab").
  const getCategoryItems = (cat: string): MenuItem[] => {
    let items = grouped[cat] || [];
    if (dietFilter !== 'all') {
      items = items.filter((m) => m.diet_type === dietFilter);
    } else {
      items = [...items].sort((a, b) => {
        const rankDiff = getDietRank(a.diet_type) - getDietRank(b.diet_type);
        return rankDiff !== 0 ? rankDiff : a.price - b.price;
      });
    }
    return items;
  };

  // Best Selling keeps its popularity order — only the diet filter is applied.
  const filteredBestSelling = dietFilter === 'all'
    ? bestSellingItems
    : bestSellingItems.filter((m) => m.diet_type === dietFilter);

  // ── Accordion open/close handlers (multi-open) ───────────────────────────────
  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const toggleSubcat = (subKey: string) => {
    setOpenSubcats((prev) => {
      const next = new Set(prev);
      if (next.has(subKey)) next.delete(subKey);
      else next.add(subKey);
      return next;
    });
  };

  // Open the first category by default so the menu isn't fully collapsed on
  // first load. Only runs once, when the menu first arrives.
  useEffect(() => {
    if (menuItems.length === 0) return;
    setOpenCategories((prev) => {
      if (prev.size > 0) return prev;
      const first = bestSellingItems.length > 0 ? "Best Selling" : userCategories[0];
      return first ? new Set([first]) : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuItems]);

  // ── Contact lookup ───────────────────────────────────────────────────────────
  const handleContactLookup = async () => {
    if (!contact.trim() || !organizationId) return;
    const actualOrgId = base62ToUuid(organizationId);
    const { data, error } = await supabasePublic
      .from("customers")
      .select("name, email, address, dob")
      .eq("organization_id", actualOrgId)
      .eq("contact_number", contact.trim())
      .maybeSingle();

    if (error) console.error("Lookup error:", error);

    if (data) {
      setName(data.name || "");
      setEmail(data.email || "");
      setAddress(data.address || "");
      if (data.dob) setDob(new Date(data.dob));
      else setDob(null);
    }
    setLookupDone(true);
  };

  // Feature 12: Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponInput.trim() || !organizationId) return;
    setCouponError("");
    const actualOrgId = base62ToUuid(organizationId);

    const { data, error } = await supabasePublic
      .from("discount_coupons")
      .select("id, code, discount_percent, max_uses, used_count, min_order_value, valid_from, valid_to, is_active")
      .eq("organization_id", actualOrgId)
      .eq("code", couponInput.trim().toUpperCase())
      .maybeSingle();

    if (error || !data) { setCouponError("Invalid coupon code."); return; }
    if (!data.is_active) { setCouponError("This coupon is no longer active."); return; }
    if (data.max_uses !== null && data.used_count >= data.max_uses) { setCouponError("This coupon has reached its usage limit."); return; }
    const now = new Date();
    if (data.valid_from && new Date(data.valid_from) > now) { setCouponError("This coupon is not yet active."); return; }
    if (data.valid_to && new Date(data.valid_to) < now) { setCouponError("This coupon has expired."); return; }

    if (data.min_order_value && subtotal < data.min_order_value) {
      setCouponError(`Add ₹${(data.min_order_value - subtotal).toFixed(2)} more to use this coupon (min. order ₹${data.min_order_value}).`);
      return;
    }

    setCouponCode(data.code);
    setCouponDiscount(data.discount_percent);
    setCouponApplied(true);
    setCouponId(data.id);
    setCouponMinOrder(data.min_order_value || 0);
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponInput("");
    setCouponDiscount(0);
    setCouponApplied(false);
    setCouponId(null);
    setCouponError("");
    setCouponMinOrder(0);
  };

  // ── Cart helpers ─────────────────────────────────────────────────────────────
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

  // For items with add-ons: opens the picker instead of adding straight to cart
  const handleAddClick = (item: MenuItem) => {
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

  const totalQtyForItem = (itemId: string): number =>
    Object.entries(cart)
      .filter(([key]) => parseCartKey(key).menuItemId === itemId)
      .reduce((s, [, qty]) => s + qty, 0);

  const resolveCartLine = (key: string, qty: number): CartLine | null => {
    const { menuItemId, addonIds } = parseCartKey(key);
    const item = menuItems.find((m) => m.id === menuItemId);
    if (!item) return null;
    const selectedAddons = addonIds
      .map((id) => item.addons.find((a) => a.id === id))
      .filter(Boolean) as MenuAddon[];
    const addonTotal = selectedAddons.reduce((s, a) => s + a.price, 0);
    return {
      key,
      menu_item_id: menuItemId,
      name: item.name,
      basePrice: item.price,
      addons: selectedAddons,
      unitPrice: item.price + addonTotal,
      quantity: qty,
    };
  };

  const cartLines = Object.entries(cart)
    .map(([key, qty]) => resolveCartLine(key, qty))
    .filter((l): l is CartLine => l !== null);

  const subtotal = cartLines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const couponDiscountAmount = couponApplied ? (subtotal * couponDiscount) / 100 : 0;
  const total = subtotal - couponDiscountAmount;

  // ── Auto-remove coupon if cart falls below its minimum order value ───────────
  useEffect(() => {
    if (couponApplied && couponMinOrder > 0 && subtotal < couponMinOrder) {
      handleRemoveCoupon();
      setCouponError(`Coupon removed — order fell below the ₹${couponMinOrder} minimum.`);
    }
  }, [subtotal]);

  // ── Submit order ─────────────────────────────────────────────────────────────
  const handleSubmitOrder = async () => {
    setError("");

    if (!authReady) { setError("Still setting up your session, please wait a second and try again."); return; }
    if (!name.trim() || !contact.trim()) { setError("Please enter your name and contact number."); return; }
    if (contact.trim().length !== 10) { setError("Please enter a valid 10-digit phone number."); return; }
    if (cartLines.length === 0) { setError("Your cart is empty."); return; }

    setSubmitting(true);

    try {
      const actualOrgId = base62ToUuid(organizationId || "");

      const { error: customerError } = await supabasePublic
        .from("customers")
        .upsert(
          {
            organization_id: actualOrgId,
            contact_number: contact.trim(),
            name: name.trim(),
            email: email.trim() || null,
            address: address.trim() || null,
            dob: dob ? dob.toISOString().split("T")[0] : null,
          },
          { onConflict: "organization_id,contact_number" }
        );

      if (customerError) throw customerError;

      let orderPk = editingOrderId;
      let orderCode: string;
      let orderCreatedAt: string;

      if (editingOrderId) {
        const { data: order, error: orderError } = await supabasePublic
          .from("orders")
          .update({ total, status: "Placed", created_at: new Date().toISOString(), notes: notes.trim() || null })
          .eq("id", editingOrderId)
          .select("id, order_id, created_at")
          .single();

        if (orderError) throw orderError;
        orderCode = order.order_id;
        orderCreatedAt = order.created_at;

        await supabasePublic.from("order_items").delete().eq("order_id", editingOrderId);
      } else {
        const { data: order, error: orderError } = await supabasePublic
          .from("orders")
          .insert([
            {
              organization_id: actualOrgId,
              order_id: generateOrderNumber(),
              customer_name: name.trim(),
              customer_contact: contact.trim(),
              customer_email: email.trim() || null,
              customer_dob: dob ? dob.toISOString().split("T")[0] : null,
              notes: notes.trim() || null,
              discount: 0,
              coupon_code: couponApplied ? couponCode : null,
              coupon_discount: couponDiscountAmount,
              total,
              status: "Placed",
            },
          ])
          .select("id, order_id, created_at")
          .single();

        if (orderError) throw orderError;
        orderPk = order.id;
        orderCode = order.order_id;
        orderCreatedAt = order.created_at;

        // Increment coupon used_count
        if (couponApplied && couponId) {
          const { error: rpcError } = await supabasePublic.rpc("increment_coupon_usage", { coupon_id: couponId });
          if (rpcError) {
            // Fallback: client-side increment
            const { data: couponData } = await supabasePublic
              .from("discount_coupons")
              .select("used_count")
              .eq("id", couponId)
              .single();
            if (couponData) {
              await supabasePublic
                .from("discount_coupons")
                .update({ used_count: (couponData.used_count || 0) + 1 })
                .eq("id", couponId);
            }
          }
        }
      }

      // NOTE: selected_addons assumes an `order_items.selected_addons` jsonb
      // column exists. If it doesn't yet, add it via migration or this
      // insert will fail.
      const itemsPayload = cartLines.map((line) => ({
        order_id: orderPk,
        menu_item_id: line.menu_item_id,
        quantity: line.quantity,
        selected_addons: line.addons.map((a) => ({ addon_id: a.id, name: a.name, price: a.price })),
      }));

      const { error: itemsError } = await supabasePublic.from("order_items").insert(itemsPayload);
      if (itemsError) throw itemsError;

      setSubmittedOrder({ id: orderPk!, order_id: orderCode, total, created_at: orderCreatedAt, status: "Placed" });
      setEditingOrderId(null);
    } catch (err: any) {
      console.error("Order submission failed:", err);
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading menu…</p>
        </div>
      </div>
    );
  }

  // ── Post-submission screens ───────────────────────────────────────────────────
  if (submittedOrder) {
    if (submittedOrder.status === "Declined" || submittedOrder.status === "Missed") {
      return (
        <div className="max-w-md mx-auto p-8 text-center bg-white rounded-xl shadow-theme-sm mt-10 border border-red-200">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Declined</h1>
          <p className="text-gray-600 mb-6">
            We're sorry, but the kitchen was unable to accept your order at this time. They will contact you soon.
          </p>
          <button onClick={() => setSubmittedOrder(null)} className="px-6 py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200">
            Return to Menu
          </button>
        </div>
      );
    }

    if (submittedOrder.status === "Preparing" || submittedOrder.status === "Delivered") {
      return (
        <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-theme-sm mt-10 border border-gray-200">
          <div className="text-center mb-6 border-b border-gray-200 pb-4">
            <h1 className="text-2xl font-bold text-gray-800 tracking-widest uppercase">INVOICE</h1>
            <p className="text-gray-500 font-semibold mt-1">Order #{submittedOrder.order_id}</p>
            <p className="text-sm text-gray-400 mt-2">{new Date(submittedOrder.created_at).toLocaleString()}</p>
          </div>
          <div className="mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">Customer Details:</p>
            <p className="text-sm text-gray-800 font-medium">{name}</p>
            <p className="text-sm text-gray-600 mt-1">{contact}</p>
            {email && <p className="text-sm text-gray-600 mt-1">{email}</p>}
          </div>
          <div className="mb-6">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="py-2 font-semibold">Item</th>
                  <th className="py-2 font-semibold text-center">Qty</th>
                  <th className="py-2 font-semibold text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {cartLines.map((line) => (
                  <tr key={line.key} className="border-b border-gray-50">
                    <td className="py-2 text-gray-800">
                      {line.name}
                      {line.addons.length > 0 && (
                        <span className="block text-xs text-gray-400">
                          + {line.addons.map((a) => a.name).join(", ")}
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-center text-gray-600">{line.quantity}</td>
                    <td className="py-2 text-right text-gray-800">₹{(line.unitPrice * line.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {couponApplied && couponDiscountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Coupon ({couponCode}) – {couponDiscount}% off:</span>
                <span>−₹{couponDiscountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span>₹{submittedOrder.total.toFixed(2)}</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-brand-600 font-medium mb-1">Thank you for your order!</p>
            <p className="text-xs text-gray-400 italic">Please screenshot this invoice as your receipt.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-md mx-auto p-8 text-center bg-white rounded-xl shadow-theme-sm mt-10 border border-brand-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Waiting for Kitchen…</h1>
        <div className="my-8 relative w-32 h-32 mx-auto">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-gray-100" strokeWidth="2" />
            <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-brand-500 transition-all duration-1000 ease-linear" strokeWidth="2" strokeDasharray="100" strokeDashoffset={100 - (timeLeft / 60) * 100} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-800">{timeLeft}</span>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Secs</span>
          </div>
        </div>
        <p className="text-gray-600 mb-6 text-sm">
          Your order <strong className="text-gray-900">#{submittedOrder.order_id}</strong> has been sent to the kitchen. Please wait while they accept it.
        </p>
        <button onClick={handleEditOrder} className="w-full py-3 bg-gray-100 text-gray-800 font-bold rounded-xl hover:bg-gray-200 transition-colors">
          Edit Order
        </button>
      </div>
    );
  }

  // ── Main order page ───────────────────────────────────────────────────────────

  // Renders a flat list of MenuItemCards — shared by the "no subcategories"
  // branch and the innermost level of the subcategory accordion.
  const renderItemsList = (items: MenuItem[]) => {
    if (items.length === 0) {
      return <p className="text-sm text-gray-400 italic py-3 text-center">No items in this category.</p>;
    }
    return (
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            totalQty={totalQtyForItem(item.id)}
            isPickerOpen={addonPickerItemId === item.id}
            pendingAddonIds={pendingAddonIds}
            onAddClick={() => handleAddClick(item)}
            onIncrement={() => addToCart(makeCartKey(item.id, []))}
            onDecrement={() => removeFromCart(makeCartKey(item.id, []))}
            onToggleAddon={toggleAddonSelection}
            onConfirmAddon={confirmAddonSelection}
            onCancelAddon={cancelAddonSelection}
            onZoom={(urls) => {
              if (urls && urls.length > 0) {
                setZoomImages(urls);
                setZoomImageIndex(0);
              }
            }}
            isLive={isLive}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">

      {/* Feature 7: Image zoom modal (Multiple Images) */}
      {zoomImages.length > 0 && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200"
          onClick={() => setZoomImages([])}
        >
          <div className="relative w-full max-w-3xl aspect-square sm:aspect-video flex items-center justify-center">
            {zoomImages.length > 1 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomImageIndex(prev => prev > 0 ? prev - 1 : zoomImages.length - 1);
                }}
                className="absolute left-2 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
            )}
            
            <img
              src={zoomImages[zoomImageIndex]}
              alt="Zoomed product"
              className="max-w-[90vw] max-h-[85vh] rounded-xl object-contain shadow-2xl"
              style={{ touchAction: 'pinch-zoom' }}
              onClick={(e) => e.stopPropagation()}
            />

            {zoomImages.length > 1 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomImageIndex(prev => prev < zoomImages.length - 1 ? prev + 1 : 0);
                }}
                className="absolute right-2 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            )}
            
            <button 
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full transition-colors"
              onClick={() => setZoomImages([])}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            {zoomImages.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {zoomImages.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i === zoomImageIndex ? 'bg-white' : 'bg-white/30'}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sticky header with brand name + diet filter */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 pt-5 pb-3">
        <div className="flex flex-row items-center justify-center gap-3 mb-1">
          {orgLogo && (
            <img src={orgLogo} alt="Logo" className="w-12 h-12 rounded-full object-cover shadow-sm" />
          )}
          {orgName && (
            <h2 className="text-center text-xl font-extrabold text-gray-900 tracking-tight">
              {orgName}
            </h2>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1 text-center">Order Menu</h1>

        {!isLive && (
          <div className="mt-2 mb-3 bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm font-semibold flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Kitchen is currently closed
          </div>
        )}

        {/* Feature 9: Diet filter dropdown */}
        <div className="flex items-center gap-2 mt-2 mb-1">
          <span className="text-xs text-gray-500 font-medium">Filter:</span>
          <select
            value={dietFilter}
            onChange={(e) => setDietFilter(e.target.value as any)}
            className="text-xs font-semibold rounded-full px-3 py-1.5 border border-gray-200 bg-white text-gray-700 focus:border-brand-500 focus:outline-none"
          >
            <option value="all">🍽️ All</option>
            <option value="veg">🟢 Veg Only</option>
            <option value="nonveg">🔴 Non-Veg Only</option>
            <option value="vegan">🟣 Vegan Only</option>
          </select>
        </div>
      </div>

      <div className="px-4 pt-4 pb-32">
        {error && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>
        )}

        {/* Contact / customer details - Only show if kitchen is live */}
        {isLive && (
          <div className="mb-6 bg-white border border-gray-200 rounded-xl p-5 shadow-theme-xs">
          <label className="block text-sm font-semibold text-gray-700">Contact Number</label>
          <div className="flex gap-3 mt-2">
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Your phone number"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden"
            />
            <button
              onClick={handleContactLookup}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold rounded-lg transition-colors"
            >
              Find Me
            </button>
          </div>

          {lookupDone && (
            <div className="mt-4 flex flex-col gap-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name *" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden" />
              {/* Feature 5: email is optional */}
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden" />
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address (optional)" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden" />
              <div>
                {/* Feature 6: "for exclusive offers" text */}
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Date of Birth
                  <span className="ml-2 text-brand-500 font-normal italic">🎁 for exclusive offers</span>
                  <span className="ml-1 text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative z-10 w-full">
                  <DatePicker
                    selected={dob}
                    onChange={(date: Date | null) => setDob(date)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Date of Birth (optional)"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden"
                    showMonthDropdown showYearDropdown dropdownMode="select"
                  />
                </div>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Cooking Requests (e.g. Extra spicy, allergy notes...)"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden"
                rows={2}
              />
            </div>
          )}
        </div>
        )}

        {/* ── Menu — nested, multi-open accordion: category → subcategory → items ── */}
        {menuItems.length === 0 ? (
          <p className="text-sm text-gray-400 italic py-8 text-center">No menu items available.</p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100 bg-white border border-gray-200 rounded-xl shadow-theme-xs overflow-hidden">
            {/* Best Selling — flat, no subcategory nesting so popularity order stays intact */}
            {filteredBestSelling.length > 0 && (
              <div>
                <CategoryHeader
                  label="🔥 Best Selling"
                  count={filteredBestSelling.length}
                  isOpen={openCategories.has("Best Selling")}
                  onClick={() => toggleCategory("Best Selling")}
                />
                {openCategories.has("Best Selling") && (
                  <div className="px-4 pb-4">{renderItemsList(filteredBestSelling)}</div>
                )}
              </div>
            )}

            {userCategories.map((cat) => {
              const items = getCategoryItems(cat);
              const subGroups = groupBySubcategory(items);
              const subKeys = Object.keys(subGroups);
              const isOpen = openCategories.has(cat);

              return (
                <div key={cat}>
                  <CategoryHeader
                    label={cat}
                    count={items.length}
                    isOpen={isOpen}
                    onClick={() => toggleCategory(cat)}
                  />
                  {isOpen && (
                    <div className="px-4 pb-4">
                      {subKeys.length <= 1 ? (
                        renderItemsList(items)
                      ) : (
                        <div className="flex flex-col divide-y divide-gray-50 border-l-2 border-gray-100 pl-2">
                          {Object.entries(subGroups).map(([sub, subItems]) => {
                            const subKey = `${cat}::${sub || "__none__"}`;
                            const subOpen = openSubcats.has(subKey);
                            return (
                              <div key={subKey}>
                                <SubcategoryHeader
                                  label={sub || "Other"}
                                  count={subItems.length}
                                  isOpen={subOpen}
                                  onClick={() => toggleSubcat(subKey)}
                                />
                                {subOpen && (
                                  <div className="pl-3 pb-3">{renderItemsList(subItems)}</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky cart bar - Only show if kitchen is live */}
      {isLive && cartLines.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50">
          <div className="max-w-md mx-auto p-4">
            {/* Itemized cart lines — needed now that add-ons can make the
                same dish show up as multiple distinct lines */}
            <div className="mb-3 max-h-32 overflow-y-auto flex flex-col gap-1">
              {cartLines.map((line) => (
                <div key={line.key} className="flex justify-between items-start text-xs text-gray-600">
                  <span className="min-w-0">
                    {line.name} × {line.quantity}
                    {line.addons.length > 0 && (
                      <span className="block text-[11px] text-gray-400 truncate">
                        + {line.addons.map((a) => a.name).join(", ")}
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    ₹{(line.unitPrice * line.quantity).toFixed(2)}
                    <button
                      onClick={() => removeLineCompletely(line.key)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </span>
                </div>
              ))}
            </div>

            {/* Feature 12: Coupon code input */}
            <div className="mb-3">
              {couponApplied ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <div>
                    <span className="text-xs font-bold text-green-700">✓ Coupon Applied: {couponCode}</span>
                    <span className="ml-2 text-xs text-green-600">({couponDiscount}% off — saved ₹{couponDiscountAmount.toFixed(2)})</span>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-xs text-red-500 hover:text-red-700 font-semibold ml-2">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Have a coupon code?"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none uppercase"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
            </div>

            <div className="flex justify-between mb-1 text-sm text-gray-600">
              <span>Subtotal ({cartLines.reduce((s, l) => s + l.quantity, 0)} items)</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {couponApplied && couponDiscountAmount > 0 && (
              <div className="flex justify-between mb-1 text-sm text-green-600 font-medium">
                <span>Discount ({couponDiscount}% off)</span>
                <span>−₹{couponDiscountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between mb-3 font-bold text-gray-800">
              <span>Total Amount</span>
              <span className="text-brand-500">₹{total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleSubmitOrder}
              disabled={submitting}
              className="w-full rounded-xl bg-brand-500 py-3.5 text-base font-bold text-white shadow-theme-md hover:bg-brand-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? "Placing order…" : "Place Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Diet type indicator
const DietDot = ({ type }: { type?: string }) => {
  if (type === 'veg') return <span className="inline-block w-3 h-3 rounded-sm border-2 border-green-600 flex-shrink-0" style={{ background: 'transparent' }}><span className="block w-1.5 h-1.5 rounded-full bg-green-600 m-auto mt-px" /></span>;
  if (type === 'nonveg') return <span className="inline-block w-3 h-3 rounded-sm border-2 border-red-600 flex-shrink-0"><span className="block w-1.5 h-1.5 rounded-full bg-red-600 m-auto mt-px" /></span>;
  if (type === 'vegan') return <span className="inline-block w-3 h-3 rounded-sm border-2 border-purple-600 flex-shrink-0"><span className="block w-1.5 h-1.5 rounded-full bg-purple-600 m-auto mt-px" /></span>;
  return null;
};

// ── Accordion headers ────────────────────────────────────────────────────────
// Top-level category row. Shows the item count and a +/− toggle, matching
// the multi-open behavior of the reference design (several categories, and
// several subcategories within them, can be expanded at once).
const CategoryHeader: React.FC<{
  label: string;
  count: number;
  isOpen: boolean;
  onClick: () => void;
}> = ({ label, count, isOpen, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between py-3.5 px-4 text-left"
  >
    <span className="font-bold text-gray-800">{label}</span>
    <span className="flex items-center gap-3">
      <span className="text-sm font-semibold text-gray-400">{count}</span>
      <span
        className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold transition-colors ${
          isOpen ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-500"
        }`}
      >
        {isOpen ? "−" : "+"}
      </span>
    </span>
  </button>
);

// Nested subcategory row, indented under its open parent category.
const SubcategoryHeader: React.FC<{
  label: string;
  count: number;
  isOpen: boolean;
  onClick: () => void;
}> = ({ label, count, isOpen, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between py-2.5 pl-3 pr-2 text-left"
  >
    <span className="text-sm font-semibold text-gray-600">{label}</span>
    <span className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-400">{count}</span>
      <span
        className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${
          isOpen ? "bg-brand-50 text-brand-500" : "bg-gray-50 text-gray-400"
        }`}
      >
        {isOpen ? "−" : "+"}
      </span>
    </span>
  </button>
);

// ── MenuItemCard ──────────────────────────────────────────────────────────────
function MenuItemCard({
  item,
  totalQty,
  isPickerOpen,
  pendingAddonIds,
  onAddClick,
  onIncrement,
  onDecrement,
  onToggleAddon,
  onConfirmAddon,
  onCancelAddon,
  onZoom,
  isLive,
}: {
  item: MenuItem;
  totalQty: number;
  isPickerOpen: boolean;
  pendingAddonIds: Set<string>;
  onAddClick: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onToggleAddon: (addonId: string) => void;
  onConfirmAddon: () => void;
  onCancelAddon: () => void;
  onZoom: (urls: string[]) => void;
  isLive?: boolean;
}) {
  const hasAddons = item.addons.length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-theme-xs transition-transform hover:scale-[1.01]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Feature 7: clicking image opens zoom modal */}
          {item.image_urls && item.image_urls.length > 0 ? (
            <div
              className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 cursor-zoom-in relative group"
              onClick={() => onZoom(item.image_urls!)}
            >
              <img src={item.image_urls[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
              </div>
              {item.image_urls.length > 1 && (
                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded-sm">
                  1/{item.image_urls.length}
                </div>
              )}
            </div>
          ) : item.image_url ? (
            <div
              className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 cursor-zoom-in relative group"
              onClick={() => onZoom([item.image_url!])}
            >
              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
              </div>
            </div>
          ) : null}
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <DietDot type={item.diet_type} />
              <p className="font-semibold text-gray-800 flex items-center gap-1">
                {item.name}
                {item.spice_level ? (
                  <span className="text-xs" title={`Spice level: ${item.spice_level}`}>
                    {'🌶️'.repeat(item.spice_level)}
                  </span>
                ) : null}
              </p>
            </div>
            {item.quantity_info && (
              <p className="text-xs text-gray-500 mb-0.5">{item.quantity_info}</p>
            )}
            <p className="text-sm font-medium text-brand-500 mt-0.5">₹{item.price.toFixed(2)}</p>
            {hasAddons && (
              <p className="text-xs text-gray-400 mt-0.5">
                {item.addons.length} add-on{item.addons.length !== 1 ? "s" : ""} available
              </p>
            )}
          </div>
        </div>
        
        {/* Only show add/increment controls if kitchen is live */}
        {isLive && (
          <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1 border border-gray-100 shrink-0">
            {!hasAddons && totalQty > 0 ? (
              <>
                <button onClick={onDecrement} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-600 shadow-xs hover:bg-gray-50 transition-colors">−</button>
                <span className="w-6 text-center font-semibold text-gray-800">{totalQty}</span>
                <button onClick={onIncrement} className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-500 text-white shadow-xs hover:bg-brand-600 transition-colors">+</button>
              </>
            ) : (
              <button onClick={onAddClick} className="px-4 py-1.5 rounded-full bg-brand-50 text-brand-600 font-medium text-sm hover:bg-brand-100 transition-colors">
                {totalQty > 0 ? `+ (${totalQty})` : "Add"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add-on picker — only rendered for the item currently being configured */}
      {isPickerOpen && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-700 mb-2">Choose add-ons</p>
          <div className="flex flex-col gap-2">
            {item.addons.map((addon) => (
              <label key={addon.id} className="flex justify-between items-center text-sm cursor-pointer">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={pendingAddonIds.has(addon.id)}
                    onChange={() => onToggleAddon(addon.id)}
                  />
                  {addon.name}
                </span>
                <span className="text-gray-500">+₹{addon.price}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={onCancelAddon} className="flex-1 rounded-lg bg-gray-100 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200">
              Cancel
            </button>
            <button onClick={onConfirmAddon} className="flex-1 rounded-lg bg-brand-500 py-2 text-sm font-semibold text-white hover:bg-brand-600">
              Add to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}