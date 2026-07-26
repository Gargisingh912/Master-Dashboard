import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface OrderDraftContextType {
  contact: string;
  setContact: (val: string) => void;
  customerName: string;
  setCustomerName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  dob: Date | null;
  setDob: (val: Date | null) => void;
  notes: string;
  setNotes: (val: string) => void;
  discount: number;
  setDiscount: (val: number) => void;
  cart: Record<string, number>;
  setCart: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  clearDraft: () => void;
}

const STORAGE_KEY = "master_dashboard_order_draft";

const OrderDraftContext = createContext<OrderDraftContextType | undefined>(undefined);

export const OrderDraftProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contact, setContact] = useState<string>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).contact || "" : "";
    } catch {
      return "";
    }
  });

  const [customerName, setCustomerName] = useState<string>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).customerName || "" : "";
    } catch {
      return "";
    }
  });

  const [email, setEmail] = useState<string>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).email || "" : "";
    } catch {
      return "";
    }
  });

  const [dob, setDob] = useState<Date | null>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      const str = saved ? JSON.parse(saved).dob : null;
      return str ? new Date(str) : null;
    } catch {
      return null;
    }
  });

  const [notes, setNotes] = useState<string>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).notes || "" : "";
    } catch {
      return "";
    }
  });

  const [discount, setDiscount] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).discount || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [cart, setCart] = useState<Record<string, number>>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).cart || {} : {};
    } catch {
      return {};
    }
  });

  const [activeCategory, setActiveCategory] = useState<string>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).activeCategory || "Best Selling" : "Best Selling";
    } catch {
      return "Best Selling";
    }
  });

  // Save to sessionStorage on state changes
  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          contact,
          customerName,
          email,
          dob: dob ? dob.toISOString() : null,
          notes,
          discount,
          cart,
          activeCategory,
        })
      );
    } catch (e) {
      console.error("Failed to save order draft:", e);
    }
  }, [contact, customerName, email, dob, notes, discount, cart, activeCategory]);

  const clearDraft = () => {
    setContact("");
    setCustomerName("");
    setEmail("");
    setDob(null);
    setNotes("");
    setDiscount(0);
    setCart({});
    setActiveCategory("Best Selling");
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return (
    <OrderDraftContext.Provider
      value={{
        contact,
        setContact,
        customerName,
        setCustomerName,
        email,
        setEmail,
        dob,
        setDob,
        notes,
        setNotes,
        discount,
        setDiscount,
        cart,
        setCart,
        activeCategory,
        setActiveCategory,
        clearDraft,
      }}
    >
      {children}
    </OrderDraftContext.Provider>
  );
};

export const useOrderDraft = () => {
  const context = useContext(OrderDraftContext);
  if (!context) {
    throw new Error("useOrderDraft must be used within an OrderDraftProvider");
  }
  return context;
};
