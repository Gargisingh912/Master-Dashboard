import { useState, useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useKitchen } from "../../context/KitchenContext";
import { TrendingUp, X, Maximize2, Target, DollarSign } from "lucide-react";

export default function FinanceKpiWidget() {
  const { orders, expenses, monthlyGoal } = useKitchen();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { targetSeries, revExpSeries, currentMonthRevenue, currentMonthExpense } = useMemo(() => {
    const monthlySales = new Array(12).fill(0);
    const monthlyExpensesArray = new Array(12).fill(0);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    let currentRev = 0;
    let currentExp = 0;

    orders.forEach((order: any) => {
      const orderDate = new Date(order.date);
      if (orderDate.getFullYear() === currentYear && order.status === "Completed") {
        const amt = typeof order.total === 'number' ? order.total : parseFloat(String(order.total).replace(/[^0-9.]/g, '')) || 0;
        monthlySales[orderDate.getMonth()] += amt;
        if (orderDate.getMonth() === currentMonth) currentRev += amt;
      }
    });

    expenses.forEach((expense: any) => {
      const expenseDate = new Date(expense.date);
      if (expenseDate.getFullYear() === currentYear) {
        monthlyExpensesArray[expenseDate.getMonth()] += expense.amount;
        if (expenseDate.getMonth() === currentMonth) currentExp += expense.amount;
      }
    });

    const monthlyRevenueArray = monthlySales.map((sales, index) => sales - monthlyExpensesArray[index]);
    const targetArray = new Array(12).fill(monthlyGoal);

    return {
      targetSeries: [
        { name: "Target", type: "area", data: targetArray }
      ],
      revExpSeries: [
        { name: "Revenue", type: "line", data: monthlyRevenueArray },
        { name: "Expense", type: "line", data: monthlyExpensesArray }
      ],
      currentMonthRevenue: currentRev,
      currentMonthExpense: currentExp
    };
  }, [orders, expenses, monthlyGoal]);

  const compactOptions: ApexOptions = {
    chart: { type: "line", toolbar: { show: false }, sparkline: { enabled: true } },
    colors: ["#10B981", "#EF4444"], // green for rev, red for exp
    stroke: { curve: "smooth", width: 2 },
    tooltip: { fixed: { enabled: false }, x: { show: false }, y: { title: { formatter: () => "" } }, marker: { show: false } }
  };

  const fullTargetOptions: ApexOptions = {
    chart: { type: "area", fontFamily: "Outfit, sans-serif", toolbar: { show: false } },
    colors: ["#6366F1"], // indigo for target
    stroke: { curve: "smooth", width: 2, dashArray: 4 },
    xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] },
    legend: { show: false },
    grid: { borderColor: "#f1f1f1", strokeDashArray: 4 },
    dataLabels: { enabled: false },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05, stops: [0, 90, 100] } },
  };

  const fullRevExpOptions: ApexOptions = {
    chart: { type: "line", fontFamily: "Outfit, sans-serif", toolbar: { show: false } },
    colors: ["#10B981", "#EF4444"], // green for rev, red for exp
    stroke: { curve: "smooth", width: 3 },
    xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] },
    legend: { position: "top", horizontalAlign: "right" },
    grid: { borderColor: "#f1f1f1", strokeDashArray: 4 },
    dataLabels: { enabled: false }
  };

  return (
    <>
      <div 
        onClick={() => setIsFullscreen(true)}
        className="col-span-12 xl:col-span-12 bento-glass p-6 cursor-pointer group"
      >
        <div className="absolute top-4 right-4 text-gray-400 group-hover:text-brand-500 transition-colors">
          <Maximize2 size={20} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 text-white rounded-2xl shadow-lg shadow-green-500/30">
              <TrendingUp size={24} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Financial Overview
              </h4>
              <div className="flex gap-4 mt-1">
                <span className="text-sm font-bold text-gray-800 dark:text-white/90">
                  Rev: <span className="text-green-500">₹{currentMonthRevenue.toLocaleString()}</span>
                </span>
                <span className="text-sm font-bold text-gray-800 dark:text-white/90">
                  Exp: <span className="text-red-500">₹{currentMonthExpense.toLocaleString()}</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end border-t sm:border-t-0 sm:border-l border-gray-200/50 dark:border-white/10 pt-3 sm:pt-0 sm:pl-6">
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Monthly Target</span>
            <span className="text-xl font-bold text-indigo-500 mt-0.5">₹{monthlyGoal.toLocaleString()}</span>
          </div>
        </div>

        <div className="h-24 w-full mt-6">
          <Chart options={compactOptions} series={revExpSeries} type="line" height="100%" />
        </div>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setIsFullscreen(false)}
          />
          
          <div className="relative z-10 w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-3xl border border-white/20 shadow-2xl rounded-[2.5rem] p-6 lg:p-10 animate-in fade-in zoom-in duration-300 custom-scrollbar">
            <button 
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-gray-100/50 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors z-20"
            >
              <X size={24} />
            </button>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Detailed Financials
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Track your monthly targets alongside actual revenue and expenses.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Target Chart */}
              <div className="w-full bg-white dark:bg-gray-800/80 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10">
                      <Target size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white/90">Monthly Target</h3>
                      <p className="text-xs text-gray-500">Baseline goal tracking</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-indigo-500">₹{monthlyGoal.toLocaleString()}</p>
                  </div>
                </div>
                <Chart options={fullTargetOptions} series={targetSeries} type="area" height={320} />
              </div>

              {/* Revenue & Expense Chart */}
              <div className="w-full bg-white dark:bg-gray-800/80 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-green-50 text-green-500 dark:bg-green-500/10">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white/90">Revenue vs Expense</h3>
                      <p className="text-xs text-gray-500">Monthly breakdown</p>
                    </div>
                  </div>
                </div>
                <Chart options={fullRevExpOptions} series={revExpSeries} type="line" height={320} />
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
