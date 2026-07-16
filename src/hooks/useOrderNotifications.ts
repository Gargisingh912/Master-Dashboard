import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../config/supabase";
import { playNotificationSound } from "../utils/helpers";

export interface PendingOrder {
  id: string;
  order_number: number;
  customer_name: string;
  total: number;
  created_at: string;
  items: { name: string; quantity: number }[];
}

export function useOrderNotifications(organizationId: string | null) {
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchOrderDetails = useCallback(
    async (orderId: string): Promise<PendingOrder | null> => {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, total, created_at, status")
        .eq("id", orderId)
        .single();

      if (orderError || !order || order.status !== "Placed") return null;

      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("quantity, menu_items(name)")
        .eq("order_id", orderId);

      if (itemsError) {
        console.error("Failed to load order items:", itemsError);
      }

      return {
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        total: order.total,
        created_at: order.created_at,
        items: (items || []).map((i: any) => ({
          name: i.menu_items?.name || "Item",
          quantity: i.quantity,
        })),
      };
    },
    []
  );

  const loadInitialPending = useCallback(async () => {
    if (!organizationId) return;

    const { data, error } = await supabase
      .from("orders")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("status", "Placed")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load pending orders:", error);
      return;
    }

    const details = await Promise.all(
      (data || []).map((o) => fetchOrderDetails(o.id))
    );
    setPendingOrders(details.filter((d): d is PendingOrder => d !== null));
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
            setPendingOrders((prev) => [newOrder, ...prev]);
            playNotificationSound();
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
        (payload) => {
          const updated = payload.new as { id: string; status: string };
          if (updated.status !== "Placed") {
            setPendingOrders((prev) => prev.filter((o) => o.id !== updated.id));
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

  return { pendingOrders, acceptOrder };
}