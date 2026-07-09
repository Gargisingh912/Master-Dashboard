import { useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useKitchen } from "../../../context/KitchenContext";

export default function FinanceChart() {
  const { orders, expenses } = useKitchen();

  const chartData = useMemo(() => {
    const monthlyIncome = new Array(12).fill(0);
    const monthlyExpense = new Array(12).fill(0);

    orders.forEach((order) => {
      if (order.date) {
        const month = new Date(order.date).getMonth(); // 0-11
        const amount = typeof order.total === 'number' ? order.total : parseFloat(String(order.total).replace(/[^0-9.]/g, '')) || 0;
        monthlyIncome[month] += amount;
      }
    });

    expenses.forEach((expense) => {
      if (expense.date) {
        const month = new Date(expense.date).getMonth();
        monthlyExpense[month] += expense.amount;
      }
    });

    return {
      income: monthlyIncome,
      expense: monthlyExpense,
    };
  }, [orders, expenses]);

  const options: ApexOptions = {
    colors: ["#465fff", "#f44336"], // Blue for Income, Red for Expense
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "line",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    stroke: {
      show: true,
      curve: "smooth",
      width: 3,
    },
    markers: {
      size: 4,
      colors: ["#fff"],
      strokeColors: ["#465fff", "#f44336"],
      strokeWidth: 2,
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: "Amount (₹)",
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `₹${val.toFixed(2)}`,
      },
    },
  };

  const series = [
    {
      name: "Income",
      data: chartData.income.map(v => Number(v.toFixed(2))),
    },
    {
      name: "Expense",
      data: chartData.expense.map(v => Number(v.toFixed(2))),
    },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03] mb-6">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white/90 mb-4">
        Income vs Expense Over Months
      </h3>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div id="financeChart" className="min-w-[600px]">
          <Chart options={options} series={series} type="line" height={350} />
        </div>
      </div>
    </div>
  );
}
