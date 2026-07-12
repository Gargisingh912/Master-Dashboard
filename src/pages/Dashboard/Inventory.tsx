import React, { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { useKitchen } from "../../context/KitchenContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

export default function Inventory() {
  const { inventory, addInventoryItem, updateInventoryQuantity, loading, error } = useKitchen();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [newItemAlertAt, setNewItemAlertAt] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");

  // Tracks the "amount to add" input per row, keyed by item id
  const [addStockValues, setAddStockValues] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemQuantity) return;

    addInventoryItem({
      name: newItemName,
      quantity: parseFloat(newItemQuantity),
      unit: newItemUnit,
      alertAt: parseFloat(newItemAlertAt) || 5,
      category: newItemCategory || null,
    });

    setNewItemName("");
    setNewItemQuantity("");
    setNewItemUnit("");
    setNewItemAlertAt("");
    setNewItemCategory("");
    setShowAddForm(false);
  };

  const handleAddStockChange = (id: string, value: string) => {
    setAddStockValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddStockSubmit = (id: string) => {
    const raw = addStockValues[id];
    const amount = parseFloat(raw);
    if (!raw || isNaN(amount) || amount === 0) return;

    updateInventoryQuantity(id, amount);
    setAddStockValues((prev) => ({ ...prev, [id]: "" }));
  };

  return (
    <>
      <PageMeta title="Inventory Management | Kitchen Dashboard" description="Manage ingredient inventory" />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Inventory</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={loading}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showAddForm ? "Cancel" : "Add New Item"}
          </button>
        </div>

        {showAddForm && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">Add Inventory Item</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Name</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                <input
                  type="number"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
                <select
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="kg">kg</option>
                  <option value="g">gram</option>
                  <option value="bottles">bottles</option>
                  <option value="pcs">pcs</option>
                  <option value="L">L</option>
                  <option value="ml">ml</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alert At</label>
                <input
                  type="number"
                  value={newItemAlertAt}
                  onChange={(e) => setNewItemAlertAt(e.target.value)}
                  placeholder="5"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <input
                  type="text"
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  placeholder="e.g. Vegetables"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
              </div>
              <div className="md:col-span-3 lg:col-span-6 flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-medium text-white hover:bg-brand-600 h-10"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400">
            Failed to load inventory: {error}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    S.No.
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Category
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Stock Quantity
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Add Stock
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell className="px-5 py-4 sm:px-6">
                        <div className="h-4 w-6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6">
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6">
                        <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="h-8 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : !error && inventory.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-5 py-8" />
                    <TableCell className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                      No inventory items yet. Add one to get started.
                    </TableCell>
                    <TableCell className="px-5 py-8" />
                    <TableCell className="px-5 py-8" />
                    <TableCell className="px-5 py-8" />
                  </TableRow>
                ) : (
                  inventory.map((item, index) => {
                    const isLow = item.quantity <= item.alertAt;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start font-medium text-gray-800 dark:text-white/90">
                          {index + 1}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start font-medium text-gray-800 dark:text-white/90">
                          {item.name}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                          {item.category || "—"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          <span className={`font-medium ${isLow ? 'text-red-500' : 'text-green-500'}`}>
                            {item.quantity} {item.unit}
                          </span>
                          {isLow && (
                            <span className="ml-2 rounded-full bg-error/10 px-2 py-0.5 text-xs font-medium text-error">
                              Low Stock
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          <div className="flex gap-2 items-center">
                            <input
                              type="number"
                              value={addStockValues[item.id] ?? ""}
                              onChange={(e) => handleAddStockChange(item.id, e.target.value)}
                              placeholder={`Qty (${item.unit})`}
                              className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                            />
                            <button
                              onClick={() => handleAddStockSubmit(item.id)}
                              className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
                            >
                              Add
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}