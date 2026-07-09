import React, { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { useKitchen } from "../../context/KitchenContext";
import FinanceChart from "../../components/charts/bar/FinanceChart";

export default function Finance() {
  const { orders, expenses, addExpense, monthlyGoal, setMonthlyGoal } = useKitchen();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Ingredients");

  const totalIncome = orders.reduce((acc, order) => {
    const amount = typeof order.total === 'number' ? order.total : parseFloat(String(order.total).replace(/[^0-9.]/g, '')) || 0;
    return acc + amount;
  }, 0);

  const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0);
  const netRevenue = totalIncome - totalExpenses;

  // Calculate Friends and Family Discount (100% discount orders)
  const fnfDiscount = orders
    .filter((o) => o.discount === 100)
    .reduce((acc, order) => acc + (order.subtotal || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    addExpense({
      description,
      amount: parseFloat(amount),
      category,
    });

    setDescription("");
    setAmount("");
    setCategory("Ingredients");
    setShowAddForm(false);
  };

  return (
    <>
      <PageMeta title="Finance | Kitchen Dashboard" description="Track revenue and expenses" />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Finance Overview</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            {showAddForm ? "Cancel" : "Add Expense"}
          </button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Income</h3>
            <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-white/90">₹{totalIncome.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</h3>
            <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-white/90">₹{totalExpenses.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Revenue</h3>
            <p className={`mt-2 text-3xl font-bold ${netRevenue >= 0 ? "text-green-500" : "text-red-500"}`}>
              {netRevenue < 0 ? "-" : ""}₹{Math.abs(netRevenue).toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03] border-l-4 border-l-brand-500">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Friends & Family Discount</h3>
            <p className="mt-2 text-3xl font-bold text-brand-500">₹{fnfDiscount.toFixed(2)}</p>
          </div>
        </div>

        {/* Monthly Goal Settings */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Monthly Target Goal</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Set your revenue goal for this month. This connects to the Overview KPI.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400 font-medium">₹</span>
              <input
                type="number"
                value={monthlyGoal}
                onChange={(e) => setMonthlyGoal(parseFloat(e.target.value) || 0)}
                className="w-32 rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
          </div>
        </div>

        {/* Add Expense Form */}
        {showAddForm && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">Add New Expense</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option value="Ingredients">Ingredients</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Salaries">Salaries</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-medium text-white hover:bg-brand-600"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Income vs Expense Chart */}
        <FinanceChart />

        {/* Expenses List */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="p-6 border-b border-gray-100 dark:border-white/[0.05]">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Recent Expenses</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                  <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Date</th>
                  <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Description</th>
                  <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Category</th>
                  <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No expenses recorded yet.
                    </td>
                  </tr>
                ) : (
                  [...expenses].reverse().map((expense) => (
                    <tr key={expense.id}>
                      <td className="px-6 py-4 text-gray-800 dark:text-white/90">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-800 dark:text-white/90">
                        {expense.description}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-white/[0.05] dark:text-gray-300">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800 dark:text-white/90">
                        ₹{expense.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
