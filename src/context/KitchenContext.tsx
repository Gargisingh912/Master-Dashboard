import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../config/supabase";

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface MenuIngredient {
  inventoryId: string;
  quantity: number;
  unit?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  ingredients: MenuIngredient[];
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
}

export interface Order {
  id: string; // Updated to string for UUID
  customer: {
    name: string;
    contact?: string;
    email?: string;
    dob?: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: string;
  date: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface KitchenContextType {
  inventory: InventoryItem[];
  menu: MenuItem[];
  orders: Order[];
  expenses: Expense[];
  addInventoryItem: (item: Omit<InventoryItem, "id">) => Promise<void>;
  updateInventoryQuantity: (id: string, quantity: number) => Promise<void>;
  addMenuItem: (item: Omit<MenuItem, "id">) => Promise<void>;
  addOrder: (customerName: string, items: OrderItem[], discount: number, contact?: string, email?: string, dob?: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, "id" | "date">) => Promise<void>;
  monthlyGoal: number;
  setMonthlyGoal: (goal: number) => void;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const KitchenContext = createContext<KitchenContextType | undefined>(undefined);

// Using a fallback organization UUID for testing if none is fetched.
const FALLBACK_ORG_ID = "00000000-0000-0000-0000-000000000000";

export const KitchenProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(20000);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string>(FALLBACK_ORG_ID);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Attempt to get the first organization available
      const { data: orgData, error: orgError } = await supabase.from('organizations').select('id').limit(1);
      let currentOrgId = FALLBACK_ORG_ID;
      
      if (orgError) {
        console.error("Error fetching organizations:", orgError);
      } else if (orgData && orgData.length > 0) {
        currentOrgId = orgData[0].id;
        setOrgId(currentOrgId);
      } else {
        console.warn("No organization found. Using fallback ORG_ID.");
      }

      // Fetch Inventory
      const { data: invData } = await supabase.from('inventory_items').select('*').eq('organization_id', currentOrgId);
      const fetchedInventory = (invData || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: 'pcs' // fallback since schema doesn't have unit
      }));
      setInventory(fetchedInventory);

      // Fetch Menu & Ingredients
      const { data: menuData } = await supabase.from('menu_items').select('*, menu_ingredients(*)').eq('organization_id', currentOrgId);
      const fetchedMenu = (menuData || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        ingredients: (item.menu_ingredients || []).map((ing: any) => ({
          inventoryId: ing.inventory_item_id,
          quantity: ing.quantity,
          unit: 'pcs' // fallback
        }))
      }));
      setMenu(fetchedMenu);

      // Fetch Orders & Order Items
      const { data: ordersData } = await supabase.from('orders').select('*, order_items(*)').eq('organization_id', currentOrgId);
      const fetchedOrders = (ordersData || []).map((o: any) => ({
        id: o.id,
        customer: { name: o.customer_name },
        items: (o.order_items || []).map((oi: any) => ({
          menuItemId: oi.menu_item_id,
          quantity: oi.quantity
        })),
        subtotal: o.total, // fallback since subtotal isn't saved directly
        discount: o.discount,
        total: o.total,
        status: o.status,
        date: o.created_at
      }));
      setOrders(fetchedOrders);

      // Fetch Expenses
      const { data: expensesData } = await supabase.from('expenses').select('*').eq('organization_id', currentOrgId);
      const fetchedExpenses = (expensesData || []).map((e: any) => ({
        id: e.id,
        description: e.description,
        amount: e.amount,
        category: e.category,
        date: e.date || e.created_at
      }));
      setExpenses(fetchedExpenses);

    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const addInventoryItem = async (item: Omit<InventoryItem, "id">) => {
    const { data, error } = await supabase.from('inventory_items').insert({
      organization_id: orgId,
      name: item.name,
      quantity: item.quantity
    }).select().single();

    if (error) {
      console.error(error);
      return;
    }

    setInventory(prev => [...prev, { ...item, id: data.id }]);
  };

  const updateInventoryQuantity = async (id: string, quantity: number) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    const newQuantity = item.quantity + quantity;
    const { error } = await supabase.from('inventory_items').update({ quantity: newQuantity }).eq('id', id);

    if (!error) {
      setInventory(prev =>
        prev.map(i => i.id === id ? { ...i, quantity: newQuantity } : i)
      );
    }
  };

  const addMenuItem = async (item: Omit<MenuItem, "id">) => {
    // Insert menu item
    const { data: menuData, error: menuError } = await supabase.from('menu_items').insert({
      organization_id: orgId,
      name: item.name,
      price: item.price
    }).select().single();

    if (menuError) {
      console.error(menuError);
      return;
    }

    // Insert ingredients
    if (item.ingredients.length > 0) {
      const ingredientsToInsert = item.ingredients.map(ing => ({
        menu_item_id: menuData.id,
        inventory_item_id: ing.inventoryId,
        quantity: ing.quantity
      }));
      const { error: ingError } = await supabase.from('menu_ingredients').insert(ingredientsToInsert);
      if (ingError) console.error(ingError);
    }

    setMenu(prev => [...prev, { ...item, id: menuData.id }]);
  };

  const addOrder = async (customerName: string, items: OrderItem[], discount: number, contact?: string, email?: string, dob?: string) => {
    let subtotal = 0;
    const inventoryDeductions: Record<string, number> = {};

    items.forEach((orderItem) => {
      const menuItem = menu.find((m) => m.id === orderItem.menuItemId);
      if (menuItem) {
        subtotal += menuItem.price * orderItem.quantity;
        menuItem.ingredients.forEach((ing) => {
          let deductionQty = ing.quantity * orderItem.quantity;
          if (!inventoryDeductions[ing.inventoryId]) inventoryDeductions[ing.inventoryId] = 0;
          inventoryDeductions[ing.inventoryId] += deductionQty;
        });
      }
    });

    const total = subtotal - (subtotal * discount) / 100;

    // Deduct inventory in DB
    for (const [invId, qtyToDeduct] of Object.entries(inventoryDeductions)) {
      await updateInventoryQuantity(invId, -qtyToDeduct);
    }

    // Create Order in DB
    const { data: orderData, error: orderError } = await supabase.from('orders').insert({
      organization_id: orgId,
      customer_name: customerName,
      discount,
      total,
      status: 'Placed'
    }).select().single();

    if (orderError) {
      console.error(orderError);
      return;
    }

    // Create Order Items in DB
    const orderItemsToInsert = items.map(i => ({
      order_id: orderData.id,
      menu_item_id: i.menuItemId,
      quantity: i.quantity
    }));
    await supabase.from('order_items').insert(orderItemsToInsert);

    setOrders(prev => [
      ...prev,
      {
        id: orderData.id,
        customer: { name: customerName, contact, email, dob },
        items,
        subtotal,
        discount,
        total,
        status: "Placed",
        date: orderData.created_at || new Date().toISOString(),
      },
    ]);
  };

  const updateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (!error) {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, status } : order
        )
      );
    }
  };

  const addExpense = async (expense: Omit<Expense, "id" | "date">) => {
    const { data, error } = await supabase.from('expenses').insert({
      organization_id: orgId,
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: new Date().toISOString()
    }).select().single();

    if (error) {
      console.error(error);
      return;
    }

    setExpenses((prev) => [
      ...prev,
      {
        ...expense,
        id: data.id,
        date: data.date || data.created_at,
      },
    ]);
  };

  return (
    <KitchenContext.Provider
      value={{
        inventory,
        menu,
        orders,
        expenses,
        addInventoryItem,
        updateInventoryQuantity,
        addMenuItem,
        addOrder,
        addExpense,
        monthlyGoal,
        setMonthlyGoal,
        updateOrderStatus,
        loading,
        error
      }}
    >
      {children}
    </KitchenContext.Provider>
  );
};

export const useKitchen = () => {
  const context = useContext(KitchenContext);
  if (context === undefined) {
    throw new Error("useKitchen must be used within a KitchenProvider");
  }
  return context;
};
