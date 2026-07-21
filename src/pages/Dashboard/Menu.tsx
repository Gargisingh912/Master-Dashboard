import React, { useEffect, useMemo, useRef, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { useKitchen, MenuIngredient } from "../../context/KitchenContext";
import { Trash2 } from "lucide-react";

interface IngredientRow {
  inventoryId: string;
  quantity: number;
  unit?: string;
}

function IngredientEditor({
  ingredients,
  inventory,
  onAdd,
  onUpdate,
  onRemove,
}: {
  ingredients: IngredientRow[];
  inventory: any[];
  onAdd: () => void;
  onUpdate: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ingredients</label>
        <button
          type="button"
          onClick={onAdd}
          className="text-sm text-brand-500 hover:text-brand-600 font-medium"
        >
          + Add Ingredient
        </button>
      </div>

      {ingredients.map((ing, index) => (
        <div key={index} className="flex gap-4 items-center mb-2">
          <select
            value={ing.inventoryId}
            onChange={(e) => onUpdate(index, "inventoryId", e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            {inventory.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.unit})
              </option>
            ))}
          </select>
          <div className="relative flex items-center">
            <input
              type="number"
              value={ing.quantity || ""}
              onChange={(e) => onUpdate(index, "quantity", e.target.value)}
              className="w-24 rounded-lg rounded-r-none border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              min="0"
              step="0.01"
              placeholder="Qty"
            />
            <select
              value={ing.unit || inventory.find((i) => i.id === ing.inventoryId)?.unit || "kg"}
              onChange={(e) => onUpdate(index, "unit", e.target.value)}
              className="w-28 rounded-lg rounded-l-none border border-l-0 border-gray-300 px-3 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:text-white/90 bg-gray-50 dark:bg-gray-800"
            >
              <option value="kg">kg</option>
              <option value="g">gram</option>
              <option value="bottles">bottles</option>
              <option value="pcs">pcs</option>
              <option value="L">L</option>
              <option value="ml">ml</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Pastel colours cycled by category name ───────────────────────────────────
const BADGE_COLOURS = [
  "bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300",
];

function useCategoryColour(categories: string[]) {
  const map = useMemo(() => {
    const m: Record<string, string> = {};
    categories.forEach((c, i) => {
      m[c] = BADGE_COLOURS[i % BADGE_COLOURS.length];
    });
    return m;
  }, [categories]);
  return (cat: string) => map[cat] ?? BADGE_COLOURS[0];
}

export default function Menu() {
  const { menu, inventory, addMenuItem, updateMenuItem, deleteMenuItem, setMenuItemAvailability } = useKitchen();

  // ── add-form state ──────────────────────────────────────────────────────────
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDishName, setNewDishName] = useState("");
  const [newDishPrice, setNewDishPrice] = useState("");
  const [newDishCategory, setNewDishCategory] = useState("");
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);

  // ── edit state ──────────────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editIngredients, setEditIngredients] = useState<IngredientRow[]>([]);

  // ── filter state ────────────────────────────────────────────────────────────
  const [activeFilter, setActiveFilter] = useState<string>("All");

  // ── auto-disable tracking ───────────────────────────────────────────────────
  const autoDisabledRef = useRef<Set<string>>(new Set());
  const LOW_STOCK_MULTIPLIER = 5;

  // ── derived lists ───────────────────────────────────────────────────────────
  const existingCategories = useMemo(() => {
    const cats = new Set<string>();
    menu.forEach((m) => { if (m.category) cats.add(m.category); });
    return Array.from(cats).sort();
  }, [menu]);

  const filterTabs = ["All", ...existingCategories];

  const filteredMenu = useMemo(() => {
    if (activeFilter === "All") return menu;
    return menu.filter((m) =>
      activeFilter === "Uncategorized"
        ? !m.category
        : m.category === activeFilter
    );
  }, [menu, activeFilter]);

  const getCategoryColour = useCategoryColour(existingCategories);

  // ── stock check ─────────────────────────────────────────────────────────────
  const hasSufficientStock = (item: { ingredients: MenuIngredient[] }) => {
    if (item.ingredients.length === 0) return true;
    return item.ingredients.every((ing) => {
      const invItem = inventory.find((i) => i.id === ing.inventoryId);
      if (!invItem) return false;
      return invItem.quantity >= ing.quantity * LOW_STOCK_MULTIPLIER;
    });
  };

  useEffect(() => {
    menu.forEach((item) => {
      const makeable = hasSufficientStock(item);
      if (item.isAvailable && !makeable && !autoDisabledRef.current.has(item.id)) {
        autoDisabledRef.current.add(item.id);
        setMenuItemAvailability(item.id, false);
      }
      if (makeable) {
        autoDisabledRef.current.delete(item.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventory, menu]);

  // ── add-form handlers ───────────────────────────────────────────────────────
  const handleAddIngredient = () => {
    if (inventory.length > 0) {
      setIngredients([...ingredients, { inventoryId: inventory[0].id, quantity: 1, unit: inventory[0].unit || "kg" }]);
    }
  };

  const handleUpdateIngredient = (index: number, field: string, value: string) => {
    const updated = [...ingredients];
    if (field === "inventoryId") updated[index].inventoryId = value;
    else if (field === "quantity") updated[index].quantity = parseFloat(value) || 0;
    else if (field === "unit") updated[index].unit = value;
    setIngredients(updated);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName || !newDishPrice) return;

    addMenuItem({
      name: newDishName,
      price: parseFloat(newDishPrice),
      category: newDishCategory.trim() || undefined,
      ingredients,
    });

    setNewDishName("");
    setNewDishPrice("");
    setNewDishCategory("");
    setIngredients([]);
    setShowAddForm(false);
  };

  // ── edit handlers ───────────────────────────────────────────────────────────
  const startEditing = (item: typeof menu[number]) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(String(item.price));
    setEditCategory(item.category ?? "");
    setEditIngredients(item.ingredients.map((ing) => ({ ...ing })));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditPrice("");
    setEditCategory("");
    setEditIngredients([]);
  };

  const handleEditAddIngredient = () => {
    if (inventory.length > 0) {
      setEditIngredients([...editIngredients, { inventoryId: inventory[0].id, quantity: 1, unit: inventory[0].unit || "kg" }]);
    }
  };

  const handleEditUpdateIngredient = (index: number, field: string, value: string) => {
    const updated = [...editIngredients];
    if (field === "inventoryId") updated[index].inventoryId = value;
    else if (field === "quantity") updated[index].quantity = parseFloat(value) || 0;
    else if (field === "unit") updated[index].unit = value;
    setEditIngredients(updated);
  };

  const handleEditRemoveIngredient = (index: number) => {
    setEditIngredients(editIngredients.filter((_, i) => i !== index));
  };

  const handleSaveEdit = (id: string) => {
    if (!editName || !editPrice) return;

    updateMenuItem(id, {
      name: editName,
      price: parseFloat(editPrice),
      category: editCategory.trim() || undefined,
      ingredients: editIngredients,
    });

    cancelEditing();
  };

  const handleToggleAvailability = (item: typeof menu[number]) => {
    setMenuItemAvailability(item.id, !item.isAvailable);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this dish?")) {
      deleteMenuItem(id);
    }
  };

  // ── category input (shared between add and edit forms) ──────────────────────
  const CategoryInput = ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Category <span className="text-gray-400 font-normal">(optional)</span>
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        list="category-suggestions"
        placeholder="e.g. Starters, Main Course, Drinks…"
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
      />
      <datalist id="category-suggestions">
        {existingCategories.map((cat) => (
          <option key={cat} value={cat} />
        ))}
      </datalist>
    </div>
  );

  return (
    <>
      <PageMeta title="Menu Management | Kitchen Dashboard" description="Manage dishes and ingredients" />
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Menu Items</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            {showAddForm ? "Cancel" : "Add New Dish"}
          </button>
        </div>

        {/* ── Add form ── */}
        {showAddForm && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">Add New Dish</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dish Name</label>
                  <input
                    type="text"
                    value={newDishName}
                    onChange={(e) => setNewDishName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={newDishPrice}
                    onChange={(e) => setNewDishPrice(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    required
                  />
                </div>
                <CategoryInput value={newDishCategory} onChange={setNewDishCategory} />
              </div>

              <IngredientEditor
                ingredients={ingredients}
                inventory={inventory}
                onAdd={handleAddIngredient}
                onUpdate={handleUpdateIngredient}
                onRemove={handleRemoveIngredient}
              />

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-medium text-white hover:bg-brand-600"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Category filter tabs ── */}
        {filterTabs.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeFilter === tab
                    ? "bg-brand-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/[0.05] dark:text-gray-400 dark:hover:bg-white/[0.08]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* ── Menu cards grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenu.map((item) => {
            const makeable = hasSufficientStock(item);
            const isEditing = editingId === item.id;

            return (
              <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Dish Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Category <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          list="category-suggestions"
                          placeholder="e.g. Starters, Main Course…"
                          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        />
                      </div>
                    </div>

                    <IngredientEditor
                      ingredients={editIngredients}
                      inventory={inventory}
                      onAdd={handleEditAddIngredient}
                      onUpdate={handleEditUpdateIngredient}
                      onRemove={handleEditRemoveIngredient}
                    />

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={cancelEditing}
                        className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="rounded-lg bg-brand-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0 pr-3">
                        <h3 className={`text-lg font-semibold truncate ${!makeable ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-white/90"}`}>
                          {item.name}
                        </h3>
                        <span className="font-medium text-brand-500">₹{item.price}</span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => startEditing(item)}
                          className="text-sm text-brand-500 hover:text-brand-600 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleAvailability(item)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            item.isAvailable ? "bg-success-500" : "bg-gray-300 dark:bg-gray-700"
                          }`}
                          title={
                            item.isAvailable
                              ? "Available — click to mark unavailable"
                              : !makeable
                              ? "Marked unavailable due to low stock — click to override"
                              : "Unavailable — click to mark available"
                          }
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              item.isAvailable ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-700 ml-1"
                          title="Delete Dish"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Category badge */}
                    {item.category && (
                      <span className={`inline-block mb-3 rounded-full px-2.5 py-0.5 text-xs font-semibold ${getCategoryColour(item.category)}`}>
                        {item.category}
                      </span>
                    )}

                    {/* Low-stock warning */}
                    {!makeable && (
                      <div className="mb-3 flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:bg-red-900/10 dark:text-red-400">
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className="shrink-0">
                          <path fillRule="evenodd" clipRule="evenodd" d="M8.257 3.099c.765-1.36 2.72-1.36 3.486 0l6.516 11.598c.75 1.334-.213 2.987-1.743 2.987H3.484c-1.53 0-2.493-1.653-1.743-2.987L8.257 3.1zM10 7a1 1 0 011 1v3a1 1 0 11-2 0V8a1 1 0 011-1zm0 7a1 1 0 100 2 1 1 0 000-2z" />
                        </svg>
                        <span>Low stock — restock {item.name} soon</span>
                      </div>
                    )}

                    {/* Ingredients */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Ingredients</h4>
                      <ul className="space-y-1">
                        {item.ingredients.map((ing, idx) => {
                          const invItem = inventory.find((i) => i.id === ing.inventoryId);
                          const isLowStock = invItem && invItem.quantity < ing.quantity * 5;
                          return (
                            <li key={idx} className={`text-sm flex justify-between ${isLowStock ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-700 dark:text-gray-300"}`}>
                              <span>{invItem?.name || "Unknown"}</span>
                              <span className={isLowStock ? "text-red-500 dark:text-red-400" : "text-gray-500"}>
                                {ing.quantity} {ing.unit || invItem?.unit || ""}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}