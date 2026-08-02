import PageMeta from "../../components/common/PageMeta";
import GreetingHeader from "./GreetingHeader";

import IncomingQrOrders from "../../components/ecommerce/Incomingqrorders";
import LiveOrdersKpiWidget from "../../components/ecommerce/LiveOrdersKpiWidget";
import QrKpiWidget from "../../components/ecommerce/QrKpiWidget";
import CouponKpiWidget from "../../components/ecommerce/CouponKpiWidget";
import InventoryKpiWidget from "../../components/ecommerce/InventoryKpiWidget";
import FinanceKpiWidget from "../../components/ecommerce/FinanceKpiWidget";
import HighestSellingDishes from "../../components/ecommerce/HighestSellingDishes";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Master-Dashboard"
        description="one stop solution for your data operations"
      />
      
      <GreetingHeader />

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 mb-20">
        
        {/* Alerts / Full width pop-ins */}
        <div className="lg:col-span-12">
          <IncomingQrOrders />
        </div>

        {/* Left Column (Hero & List) */}
        <div className="lg:col-span-8 flex flex-col gap-4 md:gap-6">
          <LiveOrdersKpiWidget />
          <HighestSellingDishes />
        </div>

        {/* Right Column (Charts & Secondary KPIs) */}
        <div className="lg:col-span-4 flex flex-col gap-4 md:gap-6">
          <FinanceKpiWidget />
          
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            <QrKpiWidget />
            <CouponKpiWidget />
          </div>
          
          <InventoryKpiWidget />
        </div>
        
      </div>
    </>
  );
}