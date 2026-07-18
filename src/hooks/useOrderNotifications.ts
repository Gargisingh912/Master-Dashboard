import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../config/supabase";
import { playNotificationSound } from "../utils/helpers";

export interface PendingOrder {
  id: string;
  order_ID: number;
  customer_name: string;
  customer_contact?: string;
  total: number;
  created_at: string;
  items: { name: string; quantity: number }[];
  status: string;
}

export function useOrderNotifications(organizationId: string | null) {
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchOrderDetails = useCallback(
    async (orderId: string): Promise<PendingOrder | null> => {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id, order_id, customer_name, customer_contact, total, created_at, status")
        .eq("id", orderId)
        .single();

      if (orderError || !order) return null;

      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("quantity, menu_items(name)")
        .eq("order_id", orderId);

      if (itemsError) {
        console.error("Failed to load order items:", itemsError);
      }

      return {
        id: order.id,
        order_ID: order.order_id,
        customer_name: order.customer_name,
        customer_contact: order.customer_contact,
        total: order.total,
        created_at: order.created_at,
        status: order.status,
        items: (items || []).map((i: any) => ({
          name: i.menu_items?.name || "Item",
          quantity: i.quantity,
        })),
      };
    },
    []
  );

  const [missedOrders, setMissedOrders] = useState<PendingOrder[]>([]);

  const loadInitialPending = useCallback(async () => {
    if (!organizationId) return;

    const { data, error } = await supabase
      .from("orders")
      .select("id")
      .eq("organization_id", organizationId)
      .in("status", ["Placed", "Declined", "Missed"])
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load orders:", error);
      return;
    }

    const details = await Promise.all(
      (data || []).map((o) => fetchOrderDetails(o.id))
    );
    const validDetails = details.filter((d): d is PendingOrder => d !== null);

    setPendingOrders(validDetails.filter(d => d.status === "Placed"));
    setMissedOrders(validDetails.filter(d => d.status === "Declined" || d.status === "Missed"));
  }, [organizationId, fetchOrderDetails]);

  useEffect(() => {
    if (!organizationId) return;

    loadInitialPending();

    const channel = supabase
      .channel(`orders-notifications-${organizationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `organization_id=eq.${organizationId}`,
        },
        async (payload) => {
          const newOrder = await fetchOrderDetails(payload.new.id as string);
          if (newOrder) {
            if (newOrder.status === "Placed") {
              setPendingOrders((prev) => [newOrder, ...prev]);
              playNotificationSound();
            } else if (newOrder.status === "Declined" || newOrder.status === "Missed") {
              setMissedOrders((prev) => [newOrder, ...prev]);
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `organization_id=eq.${organizationId}`,
        },
        async (payload) => {
          const updated = payload.new as { id: string; status: string };

          if (updated.status === "Placed") {
            const placedOrder = await fetchOrderDetails(updated.id);
            if (placedOrder) {
              setPendingOrders((prev) => {
                const exists = prev.some(o => o.id === placedOrder.id);
                if (exists) {
                  return prev.map(o => o.id === placedOrder.id ? placedOrder : o);
                }
                return [placedOrder, ...prev];
              });
              setMissedOrders((prev) => prev.filter((o) => o.id !== updated.id));
              playNotificationSound();
            }
          } else {
            setPendingOrders((prev) => prev.filter((o) => o.id !== updated.id));
          }

          if (updated.status === "Declined" || updated.status === "Missed") {
            const missedOrder = await fetchOrderDetails(updated.id);
            if (missedOrder) {
              setMissedOrders((prev) => {
                if (prev.some(o => o.id === missedOrder.id)) return prev;
                return [missedOrder, ...prev];
              });
            }
          } else {
            setMissedOrders((prev) => prev.filter((o) => o.id !== updated.id));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId, loadInitialPending, fetchOrderDetails]);

  const acceptOrder = useCallback(async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "Preparing" })
      .eq("id", orderId);

    if (error) {
      console.error("Failed to accept order:", error);
      return false;
    }

    setPendingOrders((prev) => prev.filter((o) => o.id !== orderId));
    return true;
  }, []);

  const declineOrder = useCallback(async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "Declined" })
      .eq("id", orderId);

    if (error) {
      console.error("Failed to decline order:", error);
      return false;
    }

    setPendingOrders((prev) => prev.filter((o) => o.id !== orderId));
    return true;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      pendingOrders.forEach(order => {
        const age = now - new Date(order.created_at).getTime();
        if (age > 60000) {
          declineOrder(order.id);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pendingOrders, declineOrder]);

  return { pendingOrders, missedOrders, acceptOrder, declineOrder };
}