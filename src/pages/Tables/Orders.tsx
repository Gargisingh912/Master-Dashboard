import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import OrdersTable from "../../components/tables/BasicTables/OrdersTable";
import { Plus } from "lucide-react";
import CreateOrderModal from "../../components/ecommerce/CreateOrderModal";

export default function Orders() {
  const [showOrderForm, setShowOrderForm] = useState(false);

  return (
    <>
      <PageMeta title="Orders Management | Kitchen Dashboard" description="Manage orders for the kitchen" />
      <div className="space-y-6">
        <OrdersTable />

        {/* ── Floating 'Order' button ── */}
        <button
          type="button"
          onClick={() => setShowOrderForm(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-brand-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-brand-600 hover:shadow-xl transition-all"
        >
          <Plus size={18} />
          Order
        </button>

        {/* ── Create Order Modal ── */}
        <CreateOrderModal
          isOpen={showOrderForm}
          onClose={() => setShowOrderForm(false)}
        />
      </div>
    </>
  );
}