import React, { useEffect, useRef, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { useKitchen, MenuIngredient } from "../../context/KitchenContext";

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

import { Trash2 } from "lucide-react";

export default function Menu() {
  const { menu, inventory, addMenuItem, updateMenuItem, deleteMenuItem, setMenuItemAvailability } = useKitchen();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newDishName, setNewDishName] = useState("");
  const [newDishPrice, setNewDishPrice] = useState("");
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editIngredients, setEditIngredients] = useState<IngredientRow[]>([]);

  // Tracks which items we've already auto-disabled, so repeated renders
  // don't keep re-firing the same update call once it's already off.
  const autoDisabledRef = useRef<Set<string>>(new Set());

  // Low-stock threshold: an ingredient is "low" once stock drops below
// 5x what a single dish requires. Below that, the dish is auto-marked
// unavailable so it can't be sold without enough buffer stock.
const LOW_STOCK_MULTIPLIER = 5;

const hasSufficientStock = (item: { ingredients: MenuIngredient[] }) => {
  if (item.ingredients.length === 0) return true; // no recipe defined — no constraint
  return item.ingredients.every((ing) => {
    const invItem = inventory.find((i) => i.id === ing.inventoryId);
    if (!invItem) return false; // referenced ingredient no longer exists
    return invItem.quantity >= ing.quantity * LOW_STOCK_MULTIPLIER;
  });
};

  // Auto-disable availability when stock can't support 2x, so the
  // persisted is_available reflects reality. Manual re-enable is still
  // allowed afterward — see handleToggleAvailability below.
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

  const handleAddIngredient = () => {
    if (inventory.length > 0) {
      setIngredients([...ingredients, { inventoryId: inventory[0].id, quantity: 1, unit: inventory[0].unit || "kg" }]);
    }
  };

  const handleUpdateIngredient = (index: number, field: string, value: string) => {
    const updated = [...ingredients];
    if (field === "inventoryId") {
      updated[index].inventoryId = value;
      // We intentionally do NOT reset updated[index].unit here so that if the user already selected "gram", it stays "gram".
    } else if (field === "quantity") {
      updated[index].quantity = parseFloat(value) || 0;
    } else if (field === "unit") {
      updated[index].unit = value;
    }
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
      ingredients: ingredients,
    });

    setNewDishName("");
    setNewDishPrice("");
    setIngredients([]);
    setShowAddForm(false);
  };

  // --- Edit flow ---

  const startEditing = (item: typeof menu[number]) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(String(item.price));
    setEditIngredients(item.ingredients.map((ing) => ({ ...ing })));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditPrice("");
    setEditIngredients([]);
  };

  const handleEditAddIngredient = () => {
    if (inventory.length > 0) {
      setEditIngredients([...editIngredients, { inventoryId: inventory[0].id, quantity: 1, unit: inventory[0].unit || "kg" }]);
    }
  };

  const handleEditUpdateIngredient = (index: number, field: string, value: string) => {
    const updated = [...editIngredients];
    if (field === "inventoryId") {
      updated[index].inventoryId = value;
      // We intentionally do NOT reset updated[index].unit here so that if the user already selected "gram", it stays "gram".
    } else if (field === "quantity") {
      updated[index].quantity = parseFloat(value) || 0;
    } else if (field === "unit") {
      updated[index].unit = value;
    }
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
      ingredients: editIngredients,
    });

    cancelEditing();
  };

  // Manual toggle always allowed — the owner can override the automatic
  // low-stock disable (e.g. restock arriving shortly), and can also
  // manually turn an item off regardless of stock levels.
  const handleToggleAvailability = (item: typeof menu[number]) => {
    setMenuItemAvailability(item.id, !item.isAvailable);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this dish?")) {
      deleteMenuItem(id);
    }
  };

  return (
    <>
      <PageMeta title="Menu Management | Kitchen Dashboard" description="Manage dishes and ingredients" />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Menu Items</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            {showAddForm ? "Cancel" : "Add New Dish"}
          </button>
        </div>

        {showAddForm && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">Add New Dish</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menu.map((item) => {
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
                    <div className="flex justify-between items-start mb-4">
                      <div>
  <h3 className={`text-lg font-semibold ${!makeable ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-white/90"}`}>
    {item.name}
  </h3>
  <span className="font-medium text-brand-500">₹{item.price}</span>
</div>

                      <div className="flex items-center gap-3">
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
                              ? "Marked unavailable due to low stock — click to override and turn on anyway"
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
                          className="text-red-500 hover:text-red-700 ml-2"
                          title="Delete Dish"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {!makeable && (
  <div className="mb-3 flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:bg-red-900/10 dark:text-red-400">
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className="shrink-0">
      <path fillRule="evenodd" clipRule="evenodd" d="M8.257 3.099c.765-1.36 2.72-1.36 3.486 0l6.516 11.598c.75 1.334-.213 2.987-1.743 2.987H3.484c-1.53 0-2.493-1.653-1.743-2.987L8.257 3.1zM10 7a1 1 0 011 1v3a1 1 0 11-2 0V8a1 1 0 011-1zm0 7a1 1 0 100 2 1 1 0 000-2z" />
    </svg>
    <span>Low stock — restock {item.name} soon</span>
  </div>
)}
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Ingredients</h4>
                      <ul className="space-y-1">
                        {item.ingredients.map((ing, idx) => {
                          const invItem = inventory.find((i) => i.id === ing.inventoryId);
                          const isLowStock = invItem && invItem.quantity < ing.quantity * 5; // LOW_STOCK_MULTIPLIER
                          return (
                            <li key={idx} className={`text-sm flex justify-between ${isLowStock ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                              <span>{invItem?.name || "Unknown"}</span>
                              <span className={isLowStock ? 'text-red-500 dark:text-red-400' : 'text-gray-500'}>
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