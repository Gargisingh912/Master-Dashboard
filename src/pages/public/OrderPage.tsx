import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { supabase } from "../../config/supabase";
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

  const [submittedOrder, setSubmittedOrder] = useState<{ order_number: number; total: number } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!organizationId) return;
    supabase
      .from("menu_items")
      .select("id, name, price")
      .eq("organization_id", organizationId)
      .eq("is_available", true)
      .then(({ data, error }) => {
        if (error) console.error("Failed to load menu:", error);
        setMenuItems(data || []);
        setLoading(false);
      });
  }, [organizationId]);

  const handleContactLookup = async () => {
    if (!contact.trim()) return;
    const { data, error } = await supabase
      .from("customers")
      .select("name, email, address, dob")
      .eq("organization_id", organizationId)
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
      // Upsert customer record
      const { error: customerError } = await supabase
        .from("customers")
        .upsert(
          {
            organization_id: organizationId,
            contact_number: contact.trim(),
            name: name.trim(),
            email: email.trim() || "no-email@provided.com",
            address: address.trim() || null,
            dob: dob ? dob.toISOString().split('T')[0] : null,
          },
          { onConflict: "organization_id,contact_number" }
        );

      if (customerError) throw customerError;

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            organization_id: organizationId,
            customer_name: name.trim(),
            customer_contact: contact.trim(),
            customer_email: email.trim() || null,
            customer_dob: dob ? dob.toISOString().split('T')[0] : null,
            discount: 0,
            total,
            status: "Placed",
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order_items rows
      const itemsPayload = cartLines.map((line) => ({
        order_id: order.id,
        menu_item_id: line.menu_item_id,
        quantity: line.quantity,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(itemsPayload);
      if (itemsError) throw itemsError;

      setSubmittedOrder({ order_number: order.order_number, total });
    } catch (err: any) {
      console.error("Order submission failed:", err);
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading menu...</div>;
  }

  if (submittedOrder) {
    return (
      <div className="max-w-md mx-auto p-8 text-center bg-white rounded-xl shadow-theme-sm mt-10 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Placed!</h1>
        <p className="text-4xl font-black text-brand-500 my-4">#{submittedOrder.order_number}</p>
        <p className="text-gray-600 mb-4">
          Total: ₹{submittedOrder.total.toFixed(2)} — pay when you receive your order.
        </p>
        <p className="text-xs text-gray-400">
          📸 Please take a screenshot of this screen as your receipt.
        </p>
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