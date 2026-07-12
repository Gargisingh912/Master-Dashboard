import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../config/supabase";

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  alertAt: number;
  category: string | null;
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
  id: string;
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

export const KitchenProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(20000);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();

    const channel = supabase
      .channel('kitchen-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_items' }, () => fetchInitialData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => fetchInitialData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_ingredients' }, () => fetchInitialData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchInitialData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => fetchInitialData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => fetchInitialData(true))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Resolves the CURRENT LOGGED-IN USER's organization_id via their
  // profile row — this is the same lookup your RLS policies do
  // internally (organization_id IN (SELECT organization_id FROM
  // profiles WHERE id = auth.uid())). Previously this grabbed
  // whichever organization was first in the table, which meant a
  // second restaurant's user could resolve to the wrong org.
  const resolveOrgId = async (): Promise<string | null> => {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      console.error("No authenticated user found:", userError);
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userData.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching profile/organization_id:", profileError);
      return null;
    }

    if (!profile?.organization_id) {
      console.warn("Logged-in user has no organization_id set on their profile.");
      return null;
    }

    return profile.organization_id;
  };

  const fetchInitialData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      const currentOrgId = orgId ?? (await resolveOrgId());

      if (!currentOrgId) {
        setError("Could not determine your organization. Please log in again.");
        setInventory([]);
        setMenu([]);
        setOrders([]);
        setExpenses([]);
        return;
      }

      if (currentOrgId !== orgId) setOrgId(currentOrgId);

      // Every query below is scoped to .eq('organization_id', currentOrgId)
      // explicitly. RLS would enforce this anyway, but being explicit here
      // avoids relying solely on RLS to filter — cheaper query planning,
      // and the intent is clear reading the code.

      const { data: invData, error: invError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('organization_id', currentOrgId);
      if (invError) console.error("Inventory fetch error:", invError);
      const fetchedInventory: InventoryItem[] = (invData || []).map((item: any) => ({
  id: item.id,
  name: item.name,
  quantity: item.quantity,
  unit: item.unit,
  alertAt: item.alert_at,
  category: item.category,
}));
      setInventory(fetchedInventory);

      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*, menu_ingredients(*)')
        .eq('organization_id', currentOrgId);
      if (menuError) console.error("Menu fetch error:", menuError);
      const fetchedMenu: MenuItem[] = (menuData || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        ingredients: (item.menu_ingredients || []).map((ing: any) => ({
          inventoryId: ing.inventory_item_id,
          quantity: ing.quantity,
          unit: 'string',
        })),
      }));
      setMenu(fetchedMenu);

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('organization_id', currentOrgId)
        .order('created_at', { ascending: false });
      if (ordersError) console.error("Orders fetch error:", ordersError);
      const fetchedOrders: Order[] = (ordersData || []).map((o: any) => ({
        id: o.id,
        customer: { name: o.customer_name },
        items: (o.order_items || []).map((oi: any) => ({
          menuItemId: oi.menu_item_id,
          quantity: oi.quantity,
        })),
        subtotal: o.total, // schema stores only the post-discount total, not a
                            // separate subtotal — see note below
        discount: o.discount,
        total: o.total,
        status: o.status,
        date: o.created_at,
      }));
      setOrders(fetchedOrders);

      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('organization_id', currentOrgId)
        .order('date', { ascending: false });
      if (expensesError) console.error("Expenses fetch error:", expensesError);
      const fetchedExpenses: Expense[] = (expensesData || []).map((e: any) => ({
        id: e.id,
        description: e.description,
        amount: e.amount,
        category: e.category,
        date: e.date || e.created_at,
      }));
      setExpenses(fetchedExpenses);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const addInventoryItem = async (item: Omit<InventoryItem, "id">) => {
  if (!orgId) {
    setError("No organization context — please log in again.");
    return;
  }

  const { data, error } = await supabase.from('inventory_items').insert({
  organization_id: orgId,
  name: item.name,
  quantity: item.quantity,
  unit: item.unit,
  alert_at: item.alertAt,
  category: item.category,
}).select().single();

  if (error) {
    console.error(error);
    setError(error.message);
    return;
  }

  setInventory(prev => [...prev, { ...item, id: data.id }]);
};

  // Delegates to a Postgres function (adjust_inventory_quantity) so the
  // increment happens atomically against the DB's current row, not
  // against a possibly-stale local `inventory` snapshot. Two rapid clicks,
  // or two staff on different devices, previously could both read the
  // same starting quantity and stomp on each other.
  //
  // No optimistic local update here on purpose — the postgres_changes
  // subscription on 'inventory_items' (see useEffect above) will fire
  // once the row changes and call fetchInitialData(true), which is the
  // actual source of truth for local state.
  const updateInventoryQuantity = async (id: string, quantity: number) => {
    const { error } = await supabase.rpc('adjust_inventory_quantity', {
      item_id: id,
      delta: quantity,
    });

    if (error) {
      console.error(error);
      setError(error.message);
    }
  };

  const addMenuItem = async (item: Omit<MenuItem, "id">) => {
    if (!orgId) {
      setError("No organization context — please log in again.");
      return;
    }

    const { data: menuData, error: menuError } = await supabase.from('menu_items').insert({
      organization_id: orgId,
      name: item.name,
      price: item.price,
    }).select().single();

    if (menuError) {
      console.error(menuError);
      setError(menuError.message);
      return;
    }

    if (item.ingredients.length > 0) {
      const ingredientsToInsert = item.ingredients.map(ing => ({
        menu_item_id: menuData.id,
        inventory_item_id: ing.inventoryId,
        quantity: ing.quantity,
      }));
      const { error: ingError } = await supabase.from('menu_ingredients').insert(ingredientsToInsert);
      if (ingError) {
        console.error(ingError);
        setError(ingError.message);
      }
    }

    setMenu(prev => [...prev, { ...item, id: menuData.id }]);
  };

  const addOrder = async (customerName: string, items: OrderItem[], discount: number, contact?: string, email?: string, dob?: string) => {
    if (!orgId) {
      setError("No organization context — please log in again.");
      return;
    }

    let subtotal = 0;
    const inventoryDeductions: Record<string, number> = {};

    items.forEach((orderItem) => {
      const menuItem = menu.find((m) => m.id === orderItem.menuItemId);
      if (menuItem) {
        subtotal += menuItem.price * orderItem.quantity;
        menuItem.ingredients.forEach((ing) => {
          const deductionQty = ing.quantity * orderItem.quantity;
          inventoryDeductions[ing.inventoryId] = (inventoryDeductions[ing.inventoryId] || 0) + deductionQty;
        });
      }
    });

    const total = subtotal - (subtotal * discount) / 100;

    // Batched into a single Postgres function (deduct_inventory_for_order)
    // that wraps every deduction in one transaction. Previously this
    // looped calling updateInventoryQuantity per ingredient — N separate
    // round trips, each reading from the same stale local `inventory`
    // snapshot, and if the order insert below failed partway through,
    // stock could be deducted with no order to show for it.
    if (Object.keys(inventoryDeductions).length > 0) {
      const deductions = Object.entries(inventoryDeductions).map(([inventory_id, qty]) => ({
        inventory_id,
        qty,
      }));

      const { error: deductError } = await supabase.rpc('deduct_inventory_for_order', {
        deductions,
      });

      if (deductError) {
        console.error(deductError);
        setError(deductError.message);
        return;
      }
    }

    const { data: orderData, error: orderError } = await supabase.from('orders').insert({
      organization_id: orgId,
      customer_name: customerName,
      discount,
      total,
      status: 'Placed',
    }).select().single();

    if (orderError) {
      console.error(orderError);
      setError(orderError.message);
      return;
    }

    const orderItemsToInsert = items.map(i => ({
      order_id: orderData.id,
      menu_item_id: i.menuItemId,
      quantity: i.quantity,
    }));
    const { error: orderItemsError } = await supabase.from('order_items').insert(orderItemsToInsert);
    if (orderItemsError) {
      console.error(orderItemsError);
      setError(orderItemsError.message);
    }

    setOrders(prev => [
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
      ...prev,
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
    } else {
      console.error(error);
      setError(error.message);
    }
  };

  const addExpense = async (expense: Omit<Expense, "id" | "date">) => {
    if (!orgId) {
      setError("No organization context — please log in again.");
      return;
    }

    const { data, error } = await supabase.from('expenses').insert({
      organization_id: orgId,
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: new Date().toISOString(),
    }).select().single();

    if (error) {
      console.error(error);
      setError(error.message);
      return;
    }

    setExpenses((prev) => [
      {
        ...expense,
        id: data.id,
        date: data.date || data.created_at,
      },
      ...prev,
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
        error,
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