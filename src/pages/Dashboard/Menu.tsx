import React, { useEffect, useMemo, useRef, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { supabase } from "../../config/supabase";
import { useKitchen, MenuIngredient, MenuAddon } from "../../context/KitchenContext";
import { Trash2 } from "lucide-react";

interface IngredientRow {
  inventoryId: string;
  quantity: number;
  unit?: string;
}

interface AddonRow {
  id?: string;
  name: string;
  price: number;
}

function IngredientEditor({
  ingredients,
  inventory,
  onAdd,
  onUpdate,
  onRemove,
  addInventoryItem,
}: {
  ingredients: IngredientRow[];
  inventory: any[];
  onAdd: () => void;
  onUpdate: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
  addInventoryItem: (item: { name: string; quantity: number; unit: string; category: string }) => Promise<string | undefined>;
}) {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickName, setQuickName] = useState("");
  const [quickUnit, setQuickUnit] = useState("kg");
  const [quickQty, setQuickQty] = useState("10");
  const [quickCategory] = useState("Raw Material");

  const handleQuickCreate = async () => {
    if (!quickName.trim()) return;
    const newId = await addInventoryItem({
      name: quickName.trim(),
      quantity: parseFloat(quickQty) || 0,
      unit: quickUnit,
      category: quickCategory,
    });
    if (newId) {
      onAdd();
      setTimeout(() => {
        onUpdate(ingredients.length, "inventoryId", newId);
      }, 50);
    }
    setQuickName("");
    setShowQuickAdd(false);
  };

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ingredients</label>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="text-xs text-brand-500 hover:text-brand-600 font-semibold bg-brand-50 dark:bg-brand-500/10 px-2.5 py-1 rounded-md border border-brand-200 dark:border-brand-500/30"
          >
            {showQuickAdd ? "Cancel Quick Add" : "+ Create New Stock Item"}
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="text-sm text-brand-500 hover:text-brand-600 font-medium"
          >
            + Add Ingredient
          </button>
        </div>
      </div>

      {showQuickAdd && (
        <div className="mb-4 p-3 bg-brand-50/50 dark:bg-brand-500/5 rounded-xl border border-brand-200 dark:border-brand-500/20 space-y-2">
          <p className="text-xs font-bold text-brand-700 dark:text-brand-300">Quick Create Inventory Ingredient</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input
              type="text"
              placeholder="Ingredient Name (e.g. Cheese)"
              value={quickName}
              onChange={(e) => setQuickName(e.target.value)}
              className="sm:col-span-2 rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <input
              type="number"
              placeholder="Stock Qty"
              value={quickQty}
              onChange={(e) => setQuickQty(e.target.value)}
              className="rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <select
              value={quickUnit}
              onChange={(e) => setQuickUnit(e.target.value)}
              className="rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="kg">kg</option>
              <option value="g">gram</option>
              <option value="bottles">bottles</option>
              <option value="pcs">pcs</option>
              <option value="L">L</option>
              <option value="ml">ml</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleQuickCreate}
              className="px-3 py-1 bg-brand-500 text-white rounded text-xs font-bold hover:bg-brand-600"
            >
              Save & Add to Dish
            </button>
          </div>
        </div>
      )}

      {ingredients.map((ing, index) => (
        <div key={index} className="flex flex-wrap gap-2 items-center mb-2 w-full min-w-0">
          <select
            value={ing.inventoryId}
            onChange={(e) => onUpdate(index, "inventoryId", e.target.value)}
            className="min-w-0 flex-1 basis-32 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            {inventory.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.unit})
              </option>
            ))}
          </select>
          <div className="relative flex items-center shrink-0">
            <input
              type="number"
              value={ing.quantity || ""}
              onChange={(e) => onUpdate(index, "quantity", e.target.value)}
              className="w-16 rounded-lg rounded-r-none border border-gray-300 px-2 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              min="0"
              step="0.01"
              placeholder="Qty"
            />
            <select
              value={ing.unit || inventory.find((i) => i.id === ing.inventoryId)?.unit || "kg"}
              onChange={(e) => onUpdate(index, "unit", e.target.value)}
              className="w-20 rounded-lg rounded-l-none border border-l-0 border-gray-300 px-1.5 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:text-white/90 bg-gray-50 dark:bg-gray-800"
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
            className="text-red-500 hover:text-red-700 text-sm shrink-0"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

function AddonEditor({
  addons,
  onAdd,
  onUpdate,
  onRemove,
}: {
  addons: AddonRow[];
  onAdd: () => void;
  onUpdate: (index: number, field: "name" | "price", value: string) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="w-full min-w-0">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Add-ons <span className="text-gray-400 font-normal">(optional — e.g. Coke, Fries)</span>
        </label>
        <button
          type="button"
          onClick={onAdd}
          className="text-sm text-brand-500 hover:text-brand-600 font-medium"
        >
          + Add Add-on
        </button>
      </div>

      {addons.map((addon, index) => (
        <div key={index} className="flex gap-2 items-center mb-2 w-full min-w-0">
          <input
            type="text"
            value={addon.name}
            onChange={(e) => onUpdate(index, "name", e.target.value)}
            placeholder="Add-on name (e.g. Coke)"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />
          <input
            type="number"
            value={addon.price || ""}
            onChange={(e) => onUpdate(index, "price", e.target.value)}
            placeholder="Price"
            min="0"
            step="0.01"
            className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700 text-sm shrink-0"
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
  const { menu, inventory, addMenuItem, addInventoryItem, updateMenuItem, deleteMenuItem, setMenuItemAvailability, categories, updateCategoryRanks } = useKitchen();

  // ── add-form state ──────────────────────────────────────────────────────────
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newDishName, setNewDishName] = useState("");
  const [newDishPrice, setNewDishPrice] = useState("");
  const [newDishCategory, setNewDishCategory] = useState("");
  const [newDishSubcategory, setNewDishSubcategory] = useState("");
  const [newDishImageUrls, setNewDishImageUrls] = useState<string[]>([]);
  const [newDishDietType, setNewDishDietType] = useState<'veg' | 'nonveg' | 'vegan' | ''>("");
  const [newDishQuantityInfo, setNewDishQuantityInfo] = useState("");
  const [newDishSpiceLevel, setNewDishSpiceLevel] = useState(0);
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);
  const [addons, setAddons] = useState<AddonRow[]>([]);

  // ── edit state ──────────────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editSubcategory, setEditSubcategory] = useState("");
  const [editImageUrls, setEditImageUrls] = useState<string[]>([]);
  const [editDietType, setEditDietType] = useState<'veg' | 'nonveg' | 'vegan' | ''>("");
  const [editQuantityInfo, setEditQuantityInfo] = useState("");
  const [editSpiceLevel, setEditSpiceLevel] = useState(0);
  const [editIngredients, setEditIngredients] = useState<IngredientRow[]>([]);
  const [editAddons, setEditAddons] = useState<AddonRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `dishes/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('menu-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('menu-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(data.publicUrl);
      }

      if (isEdit) {
        setEditImageUrls(prev => [...prev, ...uploadedUrls]);
      } else {
        setNewDishImageUrls(prev => [...prev, ...uploadedUrls]);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Make sure the bucket 'menu-images' exists and is public.");
    } finally {
      setIsUploading(false);
    }
  };

  // ── filter state ────────────────────────────────────────────────────────────
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [activeSubFilter, setActiveSubFilter] = useState<string>("All");

  // ── auto-disable tracking ───────────────────────────────────────────────────
  const autoDisabledRef = useRef<Set<string>>(new Set());
  const LOW_STOCK_MULTIPLIER = 5;

  // ── derived lists ───────────────────────────────────────────────────────────
  const existingCategories = useMemo(() => {
    const cats = new Set<string>();
    menu.forEach((m) => { if (m.category) cats.add(m.category); });
    
    const arr = Array.from(cats);
    arr.sort((a, b) => {
      const rankA = categories.find(c => c.name === a)?.rank ?? 9999;
      const rankB = categories.find(c => c.name === b)?.rank ?? 9999;
      return rankA - rankB;
    });
    return arr;
  }, [menu, categories]);

  const categorySubcategoryMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    menu.forEach((m) => {
      if (!m.category || !m.subcategory) return;
      if (!map[m.category]) map[m.category] = [];
      if (!map[m.category].includes(m.subcategory)) map[m.category].push(m.subcategory);
    });
    return map;
  }, [menu]);

  const filterTabs = ["All", ...existingCategories];

  const subFilterTabs = useMemo(() => {
    if (activeFilter === "All" || activeFilter === "Uncategorized") return [];
    const subs = categorySubcategoryMap[activeFilter] || [];
    return subs.length > 1 ? ["All", ...subs] : [];
  }, [activeFilter, categorySubcategoryMap]);

  const handleCategoryFilterChange = (tab: string) => {
    setActiveFilter(tab);
    setActiveSubFilter("All");
  };

  const filteredMenu = useMemo(() => {
    let items = menu;
    if (activeFilter !== "All") {
      items = items.filter((m) =>
        activeFilter === "Uncategorized" ? !m.category : m.category === activeFilter
      );
      if (activeSubFilter !== "All") {
        items = items.filter((m) => m.subcategory === activeSubFilter);
      }
    }
    
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }, [menu, activeFilter, activeSubFilter]);

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

  // ── add-form ingredient handlers ────────────────────────────────────────────
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

  // ── add-form addon handlers ─────────────────────────────────────────────────
  const handleAddAddon = () => setAddons([...addons, { name: "", price: 0 }]);
  const handleUpdateAddon = (index: number, field: "name" | "price", value: string) => {
    const updated = [...addons];
    if (field === "name") updated[index].name = value;
    else updated[index].price = parseFloat(value) || 0;
    setAddons(updated);
  };
  const handleRemoveAddon = (index: number) => setAddons(addons.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName || !newDishPrice) return;

    addMenuItem({
      name: newDishName,
      price: parseFloat(newDishPrice),
      category: newDishCategory.trim() || undefined,
      subcategory: newDishSubcategory.trim() || undefined,
      image_url: newDishImageUrls[0] || undefined, // First image as main thumbnail
      image_urls: newDishImageUrls,
      diet_type: newDishDietType || undefined,
      quantity_info: newDishQuantityInfo.trim() || undefined,
      spice_level: newDishSpiceLevel,
      ingredients,
      addons: addons.filter(a => a.name.trim() !== "") as MenuAddon[],
    });

    setNewDishName("");
    setNewDishPrice("");
    setNewDishCategory("");
    setNewDishSubcategory("");
    setNewDishImageUrls([]);
    setNewDishDietType("");
    setNewDishQuantityInfo("");
    setNewDishSpiceLevel(0);
    setIngredients([]);
    setAddons([]);
    setShowAddForm(false);
  };

  // ── edit handlers ───────────────────────────────────────────────────────────
  const startEditing = (item: typeof menu[number]) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(String(item.price));
    setEditCategory(item.category ?? "");
    setEditSubcategory(item.subcategory ?? "");
    setEditImageUrls(item.image_urls ?? []);
    setEditDietType((item.diet_type as any) ?? "");
    setEditQuantityInfo(item.quantity_info ?? "");
    setEditSpiceLevel(item.spice_level ?? 0);
    setEditIngredients(item.ingredients.map((ing) => ({ ...ing })));
    setEditAddons(item.addons.map((a) => ({ ...a })));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditPrice("");
    setEditCategory("");
    setEditSubcategory("");
    setEditImageUrls([]);
    setEditDietType("");
    setEditQuantityInfo("");
    setEditSpiceLevel(0);
    setEditIngredients([]);
    setEditAddons([]);
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

  const handleEditAddAddon = () => setEditAddons([...editAddons, { name: "", price: 0 }]);
  const handleEditUpdateAddon = (index: number, field: "name" | "price", value: string) => {
    const updated = [...editAddons];
    if (field === "name") updated[index].name = value;
    else updated[index].price = parseFloat(value) || 0;
    setEditAddons(updated);
  };
  const handleEditRemoveAddon = (index: number) => setEditAddons(editAddons.filter((_, i) => i !== index));

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const cats = [...existingCategories];
    if (direction === 'up' && index > 0) {
      [cats[index - 1], cats[index]] = [cats[index], cats[index - 1]];
    } else if (direction === 'down' && index < cats.length - 1) {
      [cats[index + 1], cats[index]] = [cats[index], cats[index + 1]];
    } else {
      return;
    }
    updateCategoryRanks(cats);
  };

  const handleEditDietTypeChange = (value: 'veg' | 'nonveg' | 'vegan' | '') => {
    setEditDietType(value);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName || !editPrice) return;

    updateMenuItem(id, {
      name: editName,
      price: parseFloat(editPrice),
      category: editCategory.trim() || undefined,
      subcategory: editSubcategory.trim() || undefined,
      image_url: editImageUrls[0] || undefined,
      image_urls: editImageUrls,
      diet_type: editDietType || undefined,
      quantity_info: editQuantityInfo.trim() || undefined,
      spice_level: editSpiceLevel,
      ingredients: editIngredients,
      addons: editAddons.filter(a => a.name.trim() !== "") as MenuAddon[],
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

  let subcategoryInputCounter = 0;
  const SubcategoryInput = ({
    value,
    onChange,
    scopedCategory,
  }: {
    value: string;
    onChange: (v: string) => void;
    scopedCategory: string;
  }) => {
    const listId = `subcategory-suggestions-${subcategoryInputCounter++}`;
    const trimmedCategory = scopedCategory.trim();
    const suggestions = trimmedCategory
      ? categorySubcategoryMap[trimmedCategory] || []
      : Array.from(new Set(Object.values(categorySubcategoryMap).flat()));

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Subcategory <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          list={listId}
          placeholder="e.g. Hakka Noodles, Schezwan"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />
        <datalist id={listId}>
          {suggestions.map((sub) => (
            <option key={sub} value={sub} />
          ))}
        </datalist>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageMeta title="Menu | Master Dashboard" description="Manage your restaurant menu, dishes, categories and add-ons" />
      <div className="flex flex-col lg:flex-row gap-8">
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Menu Items</h2>
          <div className="flex items-center gap-3">
            {existingCategories.length > 1 && (
              <button
                onClick={() => setShowCategoryManager(!showCategoryManager)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                {showCategoryManager ? "Close Sort" : "Sort Categories"}
              </button>
            )}
            <button
              onClick={() => {
                if (editingId) cancelEditing();
                setShowAddForm(!showAddForm);
              }}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-brand-600 justify-center transition-colors"
            >
              {showAddForm ? "Cancel" : "Add New Dish"}
            </button>
          </div>
        </div>

        {/* ── Category Manager ── */}
        {showCategoryManager && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">Sort Categories</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Use the up and down arrows to change the order categories appear on the menu.</p>
            <div className="space-y-2">
              {existingCategories.map((cat, idx) => (
                <div key={cat} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-white/10">
                  <span className="font-medium text-gray-800 dark:text-white/90">{cat}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => moveCategory(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-white/10 hover:bg-gray-100 disabled:opacity-50"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveCategory(idx, 'down')}
                      disabled={idx === existingCategories.length - 1}
                      className="p-1 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-white/10 hover:bg-gray-100 disabled:opacity-50"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Add form ── */}
        {showAddForm && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">Add New Dish</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <SubcategoryInput
                  value={newDishSubcategory}
                  onChange={setNewDishSubcategory}
                  scopedCategory={newDishCategory}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Diet Type</label>
                  <select
                    value={newDishDietType}
                    onChange={(e) => setNewDishDietType(e.target.value as any)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option value="">Not specified</option>
                    <option value="veg">🟢 Veg</option>
                    <option value="nonveg">🔴 Non-Veg</option>
                    <option value="vegan">🟣 Vegan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Serves 2, 200g"
                    value={newDishQuantityInfo}
                    onChange={(e) => setNewDishQuantityInfo(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Spice Level</label>
                  <select
                    value={newDishSpiceLevel}
                    onChange={(e) => setNewDishSpiceLevel(parseInt(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option value="0">None</option>
                    <option value="1">🌶️ Mild</option>
                    <option value="2">🌶️🌶️ Medium</option>
                    <option value="3">🌶️🌶️🌶️ Hot</option>
                  </select>
                </div>
                <div className="md:col-span-2 lg:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dish Images</label>
                  <div className="flex items-center gap-3">
                    {newDishImageUrls.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {newDishImageUrls.map((url, i) => (
                          <div key={i} className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-gray-100 group">
                            <img src={url} alt="Preview" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setNewDishImageUrls(prev => prev.filter((_, idx) => idx !== i))}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, false)}
                        disabled={isUploading}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-500/10 dark:file:text-brand-400 disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <IngredientEditor
                ingredients={ingredients}
                inventory={inventory}
                onAdd={handleAddIngredient}
                onUpdate={handleUpdateIngredient}
                onRemove={handleRemoveIngredient}
                addInventoryItem={addInventoryItem}
              />

              <AddonEditor
                addons={addons}
                onAdd={handleAddAddon}
                onUpdate={handleUpdateAddon}
                onRemove={handleRemoveAddon}
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

        {/* ── Category filter tabs (tier 1) ── */}
        {filterTabs.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleCategoryFilterChange(tab)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${activeFilter === tab
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/[0.05] dark:text-gray-400 dark:hover:bg-white/[0.08]"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* ── Subcategory filter tabs (tier 2) — only shown once a category
             with more than one distinct subcategory is selected ── */}
        {subFilterTabs.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 pl-2 scrollbar-hide">
            {subFilterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubFilter(tab)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${activeSubFilter === tab
                  ? "bg-brand-50 text-brand-600 border-brand-300 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/40"
                  : "bg-transparent text-gray-500 border-gray-200 hover:bg-gray-50 dark:text-gray-400 dark:border-white/10 dark:hover:bg-white/[0.05]"
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
              <div
                key={item.id}
                className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03] min-w-0 overflow-hidden"
              >
                {isEditing ? (
                  <div className="space-y-4 w-full min-w-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      <SubcategoryInput
                        value={editSubcategory}
                        onChange={setEditSubcategory}
                        scopedCategory={editCategory}
                      />
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Diet Type</label>
                        <select
                          value={editDietType}
                          onChange={(e) => handleEditDietTypeChange(e.target.value as any)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        >
                          <option value="">Not specified</option>
                          <option value="veg">🟢 Veg</option>
                          <option value="nonveg">🔴 Non-Veg</option>
                          <option value="vegan">🟣 Vegan</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <input
                          type="text"
                          placeholder="e.g. Serves 2, 200g"
                          value={editQuantityInfo}
                          onChange={(e) => setEditQuantityInfo(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Spice Level</label>
                        <select
                          value={editSpiceLevel}
                          onChange={(e) => setEditSpiceLevel(parseInt(e.target.value))}
                          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        >
                          <option value="0">None</option>
                          <option value="1">🌶️ Mild</option>
                          <option value="2">🌶️🌶️ Medium</option>
                          <option value="3">🌶️🌶️🌶️ Hot</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Dish Images</label>
                        <div className="flex items-center gap-3">
                          {editImageUrls.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {editImageUrls.map((url, i) => (
                                <div key={i} className="relative h-9 w-9 shrink-0 overflow-hidden rounded bg-gray-100 group">
                                  <img src={url} alt="Preview" className="h-full w-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => setEditImageUrls(prev => prev.filter((_, idx) => idx !== i))}
                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-[1px] opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, true)}
                            disabled={isUploading}
                            className="min-w-0 flex-1 text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-500/10 dark:file:text-brand-400 disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>

                    <IngredientEditor
                      ingredients={editIngredients}
                      inventory={inventory}
                      onAdd={handleEditAddIngredient}
                      onUpdate={handleEditUpdateIngredient}
                      onRemove={handleEditRemoveIngredient}
                      addInventoryItem={addInventoryItem}
                    />

                    <AddonEditor
                      addons={editAddons}
                      onAdd={handleEditAddAddon}
                      onUpdate={handleEditUpdateAddon}
                      onRemove={handleEditRemoveAddon}
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
                    {item.image_url && (
                      <div className="h-32 w-full mb-4 overflow-hidden rounded-lg bg-gray-100">
                        <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2 mb-1">
                          {item.diet_type === 'veg' && <span className="inline-block w-3 h-3 rounded-full bg-green-500 ring-1 ring-green-300 shrink-0" title="Veg" />}
                          {item.diet_type === 'nonveg' && <span className="inline-block w-3 h-3 rounded-full bg-red-500 ring-1 ring-red-300 shrink-0" title="Non-Veg" />}
                          {item.diet_type === 'vegan' && <span className="inline-block w-3 h-3 rounded-full bg-purple-500 ring-1 ring-purple-300 shrink-0" title="Vegan" />}
                          <h3 className={`text-lg font-semibold truncate ${!makeable ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-white/90"}`}>
                            {item.name}
                          </h3>
                        </div>
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
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.isAvailable ? "bg-success-500" : "bg-gray-300 dark:bg-gray-700"
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
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.isAvailable ? "translate-x-6" : "translate-x-1"
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

                    {/* Category + subcategory badges */}
                    {(item.category || item.subcategory) && (
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {item.category && (
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${getCategoryColour(item.category)}`}>
                            {item.category}
                          </span>
                        )}
                        {item.subcategory && (
                          <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400">
                            {item.subcategory}
                          </span>
                        )}
                      </div>
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
                    <div className="mb-3">
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

                    {/* Add-ons */}
                    {item.addons.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Add-ons</h4>
                        <ul className="space-y-1">
                          {item.addons.map((a) => (
                            <li key={a.id} className="text-sm flex justify-between text-gray-700 dark:text-gray-300">
                              <span>{a.name}</span>
                              <span className="text-gray-500">₹{a.price}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}