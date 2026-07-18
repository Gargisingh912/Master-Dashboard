import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { supabase } from "../../config/supabase";
import { base62ToUuid, generateOrderNumber } from "../../utils/helpers";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
interface MenuItem {
  id: string;
  name: string;
  price: number;
}

interface CartLine {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
}

const OrderPage: React.FC = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [contact, setContact] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState<Date | null>(null);
  const [lookupDone, setLookupDone] = useState(false);

  // "id" = the real uuid primary key. "order_id" = the human-readable text
  // code from generateOrderNumber() (e.g. "ORD140361460") — this is what
  // shows on the customer page and dashboard, matching your actual table.
  const [submittedOrder, setSubmittedOrder] = useState<{ id: string; order_id: string; total: number; created_at: string; status: string } | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);

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
        // Auto-decline if time runs out
        supabase.from("orders").update({ status: "Declined" }).eq("id", submittedOrder.id).then(() => {
          setSubmittedOrder(prev => prev ? { ...prev, status: "Declined" } : null);
        });
      }
    }, 1000);

    const channel = supabase
      .channel(`customer-order-${submittedOrder.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${submittedOrder.id}`,
        },
        (payload) => {
          const updated = payload.new as { status: string };
          setSubmittedOrder(prev => prev ? { ...prev, status: updated.status } : null);
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [submittedOrder]);

  const handleEditOrder = async () => {
    if (!submittedOrder) return;

    // Set the order to declined temporarily, but keep the ID so we can reuse it
    await supabase.from("orders").update({ status: "Declined" }).eq("id", submittedOrder.id);

    setEditingOrderId(submittedOrder.id);
    setSubmittedOrder(null);
  };

  useEffect(() => {
    if (!organizationId) return;
    const actualOrgId = base62ToUuid(organizationId);

    supabase
      .from("menu_items")
      .select("id, name, price")
      .eq("organization_id", actualOrgId)
      .eq("is_available", true)
      .then(({ data, error }) => {
        if (error) console.error("Failed to load menu:", error);
        setMenuItems(data || []);
        setLoading(false);
      });
  }, [organizationId]);

  const handleContactLookup = async () => {
    if (!contact.trim() || !organizationId) return;
    const actualOrgId = base62ToUuid(organizationId);
    const { data, error } = await supabase
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
      if (data.dob) {
        setDob(new Date(data.dob));
      } else {
        setDob(null);
      }
    }
    setLookupDone(true);
  };

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev[item.id];
      return {
        ...prev,
        [item.id]: {
          menu_item_id: item.id,
          name: item.name,
          price: item.price,
          quantity: (existing?.quantity || 0) + 1,
        },
      };
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: { ...existing, quantity: existing.quantity - 1 } };
    });
  };

  const cartLines = Object.values(cart);
  const total = cartLines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  const handleSubmitOrder = async () => {
    setError("");

    if (!name.trim() || !contact.trim()) {
      setError("Please enter your name and contact number.");
      return;
    }
    if (contact.trim().length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (cartLines.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);

    try {
      const actualOrgId = base62ToUuid(organizationId || "");
      // Upsert customer record
      const { error: customerError } = await supabase
        .from("customers")
        .upsert(
          {
            organization_id: actualOrgId,
            contact_number: contact.trim(),
            name: name.trim(),
            email: email.trim() || "no-email@provided.com",
            address: address.trim() || null,
            dob: dob ? dob.toISOString().split('T')[0] : null,
          },
          { onConflict: "organization_id,contact_number" }
        );

      if (customerError) throw customerError;

      let orderPk = editingOrderId; // uuid primary key
      let orderCode: string;        // human-readable order_id text column
      let orderCreatedAt: string;

      if (editingOrderId) {
        // Update existing order — keep its original order_id code, don't regenerate
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .update({
            total,
            status: "Placed",
            created_at: new Date().toISOString() // reset timer
          })
          .eq("id", editingOrderId)
          .select("id, order_id, created_at")
          .single();

        if (orderError) throw orderError;
        orderCode = order.order_id;
        orderCreatedAt = order.created_at;

        // Delete old items
        await supabase.from("order_items").delete().eq("order_id", editingOrderId);

      } else {
        // Create the order
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert([
            {
              organization_id: actualOrgId,
              order_id: generateOrderNumber(),
              customer_name: name.trim(),
              customer_contact: contact.trim(),
              customer_email: email.trim() || null,
              customer_dob: dob ? dob.toISOString().split('T')[0] : null,
              discount: 0,
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
      }

      // Create order_items rows
      const itemsPayload = cartLines.map((line) => ({
        order_id: orderPk,
        menu_item_id: line.menu_item_id,
        quantity: line.quantity,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(itemsPayload);
      if (itemsError) throw itemsError;

      setSubmittedOrder({
        id: orderPk!,
        order_id: orderCode,
        total,
        created_at: orderCreatedAt,
        status: "Placed"
      });
      setEditingOrderId(null);
    } catch (err: any) {
      console.error("Order submission failed:", err);
      // TEMP DEBUG — remove after diagnosing the RLS/org mismatch
      const debugOrgId = base62ToUuid(organizationId || "");
      setError(
        `${err.message || "Failed to place order."} [debug: param=${organizationId} decoded=${debugOrgId}]`
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading menu...</div>;
  }

  if (submittedOrder) {
    if (submittedOrder.status === "Declined" || submittedOrder.status === "Missed") {
      return (
        <div className="max-w-md mx-auto p-8 text-center bg-white rounded-xl shadow-theme-sm mt-10 border border-red-200">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
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
                {cartLines.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-50">
                    <td className="py-2 text-gray-800">{item.name}</td>
                    <td className="py-2 text-center text-gray-600">{item.quantity}</td>
                    <td className="py-2 text-right text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 mb-6">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal:</span>
              <span>₹{submittedOrder.total.toFixed(2)}</span>
            </div>
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Waiting for Kitchen...</h1>

        <div className="my-8 relative w-32 h-32 mx-auto">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-gray-100" strokeWidth="2"></circle>
            <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-brand-500 transition-all duration-1000 ease-linear" strokeWidth="2" strokeDasharray="100" strokeDashoffset={100 - (timeLeft / 60) * 100} strokeLinecap="round"></circle>
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

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Order Menu</h1>

      {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

      <div className="mb-6 bg-white border border-gray-200 rounded-xl p-5 shadow-theme-xs">
        <label className="block text-sm font-semibold text-gray-700">Contact Number</label>
        <div className="flex gap-3 mt-2">
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Your phone number"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden"
          />
          <button onClick={handleContactLookup} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold rounded-lg transition-colors">
            Find Me
          </button>
        </div>

        {lookupDone && (
          <div className="mt-4 flex flex-col gap-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden" />
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address (optional)" className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden" />
            <div className="relative z-10 w-full">
              <DatePicker
                selected={dob}
                onChange={(date: Date | null) => setDob(date)}
                dateFormat="yyyy-MM-dd"
                placeholderText="Date of Birth"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 mb-24">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center bg-white border border-gray-200 rounded-xl p-4 shadow-theme-xs transition-transform hover:scale-[1.01]"
          >
            <div>
              <p className="font-semibold text-gray-800">{item.name}</p>
              <p className="text-sm font-medium text-brand-500 mt-1">₹{item.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1 border border-gray-100">
              {cart[item.id] ? (
                <>
                  <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-600 shadow-xs hover:bg-gray-50 transition-colors">−</button>
                  <span className="w-6 text-center font-semibold text-gray-800">{cart[item.id].quantity}</span>
                  <button onClick={() => addToCart(item)} className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-500 text-white shadow-xs hover:bg-brand-600 transition-colors">+</button>
                </>
              ) : (
                <button onClick={() => addToCart(item)} className="px-4 py-1.5 rounded-full bg-brand-50 text-brand-600 font-medium text-sm hover:bg-brand-100 transition-colors">Add</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {cartLines.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 z-50">
          <div className="max-w-md mx-auto">
            <div className="flex justify-between mb-3 font-bold text-gray-800">
              <span>Total Amount</span>
              <span className="text-brand-500">₹{total.toFixed(2)}</span>
            </div>
            <button onClick={handleSubmitOrder} disabled={submitting} className="w-full rounded-xl bg-brand-500 py-3.5 text-base font-bold text-white shadow-theme-md hover:bg-brand-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all">
              {submitting ? "Placing order..." : "Place Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};



export default OrderPage;