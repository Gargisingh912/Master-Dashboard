import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { supabase } from "../../config/supabase";

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
  const [dob, setDob] = useState("");
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
      setDob(data.dob || "");
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
            dob: dob || null,
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
            customer_dob: dob || null,
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
    return <div style={{ padding: 40, textAlign: "center" }}>Loading menu...</div>;
  }

  if (submittedOrder) {
    return (
      <div style={{ maxWidth: 420, margin: "0 auto", padding: 32, textAlign: "center" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Order Placed!</h1>
        <p style={{ fontSize: 40, fontWeight: 900, margin: "16px 0" }}>#{submittedOrder.order_number}</p>
        <p style={{ color: "#555", marginBottom: 16 }}>
          Total: ₹{submittedOrder.total.toFixed(2)} — pay when you receive your order.
        </p>
        <p style={{ fontSize: 12, color: "#888" }}>
          📸 Please take a screenshot of this screen as your receipt.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Order Menu</h1>

      {error && <p style={{ color: "red", marginBottom: 12 }}>{error}</p>}

      <div style={{ marginBottom: 20, border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 600 }}>Contact Number</label>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Your phone number"
            style={inputStyle}
          />
          <button onClick={handleContactLookup} style={secondaryBtn}>
            Find Me
          </button>
        </div>

        {lookupDone && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" style={inputStyle} />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" style={inputStyle} />
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address (optional)" style={inputStyle} />
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} style={inputStyle} />
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {menuItems.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "1px solid #eee",
              borderRadius: 10,
              padding: "10px 14px",
            }}
          >
            <div>
              <p style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</p>
              <p style={{ fontSize: 12, color: "#888" }}>₹{item.price.toFixed(2)}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {cart[item.id] && (
                <>
                  <button onClick={() => removeFromCart(item.id)} style={qtyBtn}>−</button>
                  <span>{cart[item.id].quantity}</span>
                </>
              )}
              <button onClick={() => addToCart(item)} style={qtyBtn}>+</button>
            </div>
          </div>
        ))}
      </div>

      {cartLines.length > 0 && (
        <div style={{ position: "sticky", bottom: 0, background: "#fff", borderTop: "1px solid #eee", padding: "12px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontWeight: 700 }}>
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <button onClick={handleSubmitOrder} disabled={submitting} style={{ ...primaryBtn, width: "100%" }}>
            {submitting ? "Placing order..." : "Place Order"}
          </button>
        </div>
      )}
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 13,
  flex: 1,
};

const primaryBtn: React.CSSProperties = {
  background: "#111",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 16px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryBtn: React.CSSProperties = {
  ...primaryBtn,
  background: "#eee",
  color: "#111",
};

const qtyBtn: React.CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: "50%",
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
  fontSize: 14,
};

export default OrderPage;