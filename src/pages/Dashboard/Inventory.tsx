import React, { useState, useMemo } from "react";
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
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, loading, error } = useKitchen();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("g");
  const [newItemCategory, setNewItemCategory] = useState("");

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Edit state — single edit button handles name, unit, category AND quantity
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editQuantity, setEditQuantity] = useState("");

  const handleStartEdit = (item: typeof inventory[number]) => {
    setEditingItemId(item.id);
    setEditName(item.name);
    setEditUnit(item.unit);
    setEditCategory(item.category || "");
    setEditQuantity(String(item.quantity));
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
  };

  const handleSaveEdit = () => {
    if (!editingItemId || !editName.trim()) return;
    const qty = parseFloat(editQuantity);
    updateInventoryItem(editingItemId, {
      name: editName.trim(),
      unit: editUnit,
      category: editCategory.trim(),
      ...(!isNaN(qty) && qty >= 0 ? { quantity: qty } : {}),
    });
    setEditingItemId(null);
  };

  const filteredInventory = useMemo(() => {
    if (!searchQuery.trim()) return inventory;
    const q = searchQuery.trim().toLowerCase();
    return inventory.filter((item) => item.name.toLowerCase().includes(q));
  }, [inventory, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemQuantity) return;

    addInventoryItem({
      name: newItemName,
      quantity: parseFloat(newItemQuantity),
      unit: newItemUnit,
      category: newItemCategory,
    });

    setNewItemName("");
    setNewItemQuantity("");
    setNewItemUnit("");
    setNewItemCategory("");
    setShowAddForm(false);
  };

  const handleToggleSearch = () => {
    setShowSearch((prev) => {
      if (prev) setSearchQuery("");
      return !prev;
    });
  };

  return (
    <>
      <PageMeta title="Inventory Management | Kitchen Dashboard" description="Manage ingredient inventory" />
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-3">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Inventory</h2>

          <div className="flex items-center gap-3">
            {showSearch && (
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by item name..."
                className="w-56 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            )}

            <button
              onClick={handleToggleSearch}
              aria-label={showSearch ? "Search" : "Search item"}
              title={showSearch ? "Search" : "Search item"}
              className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
            >
              {showSearch ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M3.04175 8.37363C3.04175 5.87693 5.06798 3.85199 7.56468 3.85199C10.0614 3.85199 12.0876 5.87693 12.0876 8.37363C12.0876 10.8703 10.0614 12.8953 7.56468 12.8953C5.06798 12.8953 3.04175 10.8703 3.04175 8.37363ZM7.56468 2.35199C4.23961 2.35199 1.54175 5.04817 1.54175 8.37363C1.54175 11.6991 4.23961 14.3953 7.56468 14.3953C9.02901 14.3953 10.3696 13.8724 11.4143 13.0028L14.4697 16.0578C14.7626 16.3507 15.2375 16.3507 15.5304 16.0578C15.8233 15.7649 15.8233 15.2901 15.5304 14.9972L12.475 11.9422C13.3462 10.897 13.8697 9.55437 13.8697 8.37363C13.8697 5.04817 11.1898 2.35199 7.56468 2.35199Z" fill="currentColor" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              disabled={loading}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showAddForm ? "Cancel" : "Add New Item"}
            </button>
          </div>
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
                  <option value="L">L</option>
                  <option value="ml">ml</option>
                  <option value="pieces">pieces</option>
                </select>
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
                    Actions
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
                        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : !error && filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-5 py-8" />
                    <TableCell className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                      {searchQuery
                        ? `No items match "${searchQuery}".`
                        : "No inventory items yet. Add one to get started."}
                    </TableCell>
                    <TableCell className="px-5 py-8" />
                    <TableCell className="px-5 py-8" />
                    <TableCell className="px-5 py-8" />
                  </TableRow>
                ) : (
                  filteredInventory.map((item, index) => {
                    const isEditing = editingItemId === item.id;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start font-medium text-gray-800 dark:text-white/90">
                          {index + 1}
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start font-medium text-gray-800 dark:text-white/90">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-brand-500 focus:outline-hidden dark:bg-gray-800 dark:border-gray-700 dark:text-white/90"
                            />
                          ) : (
                            item.name
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editCategory}
                              onChange={(e) => setEditCategory(e.target.value)}
                              placeholder="Category"
                              className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-brand-500 focus:outline-hidden dark:bg-gray-800 dark:border-gray-700 dark:text-white/90"
                            />
                          ) : (
                            item.category || "—"
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={editQuantity}
                                onChange={(e) => setEditQuantity(e.target.value)}
                                min="0"
                                step="any"
                                className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:border-brand-500 focus:outline-hidden dark:bg-gray-800 dark:border-gray-700 dark:text-white/90"
                              />
                              <select
                                value={editUnit}
                                onChange={(e) => setEditUnit(e.target.value)}
                                className="rounded border border-gray-300 px-1.5 py-1 text-sm focus:border-brand-500 focus:outline-hidden dark:bg-gray-800 dark:border-gray-700 dark:text-white/90"
                              >
                                <option value="kg">kg</option>
                                <option value="g">gram</option>
                                <option value="bottles">bottles</option>
                                <option value="L">L</option>
                                <option value="ml">ml</option>
                                <option value="pieces">pieces</option>
                              </select>
                            </div>
                          ) : (
                            <>{item.quantity} {item.unit}</>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleSaveEdit}
                                className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleStartEdit(item)}
                                aria-label={`Edit ${item.name}`}
                                title="Edit item"
                                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm("Are you sure you want to delete this item?")) {
                                    deleteInventoryItem(item.id);
                                  }
                                }}
                                aria-label={`Delete ${item.name}`}
                                title="Delete item"
                                className="flex items-center justify-center w-8 h-8 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                                </svg>
                              </button>
                            </div>
                          )}
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