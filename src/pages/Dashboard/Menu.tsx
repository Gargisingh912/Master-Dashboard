import React, { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { useKitchen } from "../../context/KitchenContext";

export default function Menu() {
  const { menu, inventory, addMenuItem } = useKitchen();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDishName, setNewDishName] = useState("");
  const [newDishPrice, setNewDishPrice] = useState("");
  const [ingredients, setIngredients] = useState<{ inventoryId: string; quantity: number; unit?: string }[]>([]);

  const handleAddIngredient = () => {
    if (inventory.length > 0) {
      setIngredients([...ingredients, { inventoryId: inventory[0].id, quantity: 1, unit: inventory[0].unit || "kg" }]);
    }
  };

  const handleUpdateIngredient = (index: number, field: string, value: string) => {
    const updated = [...ingredients];
    if (field === "inventoryId") {
      updated[index].inventoryId = value;
      updated[index].unit = inventory.find((i) => i.id === value)?.unit || "kg";
    } else if (field === "quantity") {
      updated[index].quantity = parseFloat(value) || 0;
    } else if (field === "unit") {
      updated[index].unit = value;
    }
    setIngredients(updated);
  };

  const handleRemoveIngredient = (index: number) => {
    const updated = ingredients.filter((_, i) => i !== index);
    setIngredients(updated);
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

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ingredients</label>
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="text-sm text-brand-500 hover:text-brand-600 font-medium"
                  >
                    + Add Ingredient
                  </button>
                </div>
                
                {ingredients.map((ing, index) => (
                  <div key={index} className="flex gap-4 items-center mb-2">
                    <select
                      value={ing.inventoryId}
                      onChange={(e) => handleUpdateIngredient(index, "inventoryId", e.target.value)}
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
                        onChange={(e) => handleUpdateIngredient(index, "quantity", e.target.value)}
                        className="w-24 rounded-lg rounded-r-none border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        min="0"
                        step="0.01"
                        placeholder="Qty"
                      />
                      <select
                        value={ing.unit || inventory.find((i) => i.id === ing.inventoryId)?.unit || "kg"}
                        onChange={(e) => handleUpdateIngredient(index, "unit", e.target.value)}
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
                      onClick={() => handleRemoveIngredient(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

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
          {menu.map((item) => (
            <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{item.name}</h3>
                <span className="font-medium text-brand-500">₹{item.price}</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Ingredients</h4>
                <ul className="space-y-1">
                  {item.ingredients.map((ing, idx) => {
                    const invItem = inventory.find((i) => i.id === ing.inventoryId);
                    return (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex justify-between">
                        <span>{invItem?.name || "Unknown"}</span>
                        <span className="text-gray-500">
                          {ing.quantity} {ing.unit || invItem?.unit || ""}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
