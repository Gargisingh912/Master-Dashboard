import React, { useState } from "react";
import { useKitchen, DiscountCoupon } from "../../context/KitchenContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Edit, Trash2, Plus, Check, X, Tag, Copy, ToggleLeft, ToggleRight } from "lucide-react";

const EMPTY_FORM = {
  code: "",
  discount_percent: 10,
  max_uses: "" as string | number,
  valid_from: new Date().toISOString(),
  valid_to: null as string | null,
  is_active: true,
};

export default function DiscountCoupons() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon, loading } = useKitchen();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [validFromDate, setValidFromDate] = useState<Date>(new Date());
  const [validToDate, setValidToDate] = useState<Date | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setValidFromDate(new Date());
    setValidToDate(null);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (coupon: DiscountCoupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      discount_percent: coupon.discount_percent,
      max_uses: coupon.max_uses ?? "",
      valid_from: coupon.valid_from,
      valid_to: coupon.valid_to,
      is_active: coupon.is_active,
    });
    setValidFromDate(new Date(coupon.valid_from));
    setValidToDate(coupon.valid_to ? new Date(coupon.valid_to) : null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: form.code.toUpperCase().trim(),
      discount_percent: Number(form.discount_percent),
      max_uses: form.max_uses === "" ? null : Number(form.max_uses),
      valid_from: validFromDate.toISOString(),
      valid_to: validToDate ? validToDate.toISOString() : null,
      is_active: form.is_active,
    };

    if (editingId) {
      await updateCoupon(editingId, payload);
    } else {
      await addCoupon(payload);
    }
    resetForm();
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => { });
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleToggleActive = async (coupon: DiscountCoupon) => {
    await updateCoupon(coupon.id, { is_active: !coupon.is_active });
  };

  const isExpired = (coupon: DiscountCoupon) =>
    !!coupon.valid_to && new Date(coupon.valid_to) < new Date();

  const isExhausted = (coupon: DiscountCoupon) =>
    coupon.max_uses !== null && coupon.used_count >= coupon.max_uses;

  const getStatusBadge = (coupon: DiscountCoupon) => {
    if (!coupon.is_active) return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">Inactive</span>;
    if (isExpired(coupon)) return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">Expired</span>;
    if (isExhausted(coupon)) return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">Exhausted</span>;
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400">Active</span>;
  };

  return (
    <div className="px-4 py-8 mx-auto max-w-screen-xl md:px-6 2xl:px-11">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Discount Coupons</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create and manage coupon codes for your customers.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 shadow-theme-sm transition-all"
          >
            <Plus size={18} />
            Add Coupon
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-theme-sm mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {editingId ? "Edit Coupon" : "New Coupon"}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X size={22} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Code */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Coupon Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="e.g. SAVE20"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 font-mono tracking-widest uppercase focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
              />
            </div>

            {/* Discount % */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                max={100}
                value={form.discount_percent}
                onChange={(e) => setForm({ ...form, discount_percent: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
              />
            </div>

            {/* Max Uses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Uses <span className="text-gray-400 font-normal">(leave blank = unlimited)</span>
              </label>
              <input
                type="number"
                min={1}
                value={form.max_uses}
                onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                placeholder="Unlimited"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
              />
            </div>

            {/* Valid From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valid From</label>
              <DatePicker
                selected={validFromDate}
                onChange={(d: Date | null) => d && setValidFromDate(d)}
                showTimeSelect
                dateFormat="yyyy-MM-dd HH:mm"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
              />
            </div>

            {/* Valid To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valid To <span className="text-gray-400 font-normal">(leave blank = no expiry)</span>
              </label>
              <DatePicker
                selected={validToDate}
                onChange={(d: Date | null) => setValidToDate(d)}
                showTimeSelect
                dateFormat="yyyy-MM-dd HH:mm"
                isClearable
                placeholderText="No expiry"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
              />
            </div>

            {/* Active toggle */}
            <div className="flex flex-col justify-end">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <button
                type="button"
                onClick={() => setForm({ ...form, is_active: !form.is_active })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium text-sm transition-all ${form.is_active
                  ? "bg-success-50 border-success-200 text-success-700 dark:bg-success-500/10 dark:border-success-800 dark:text-success-400"
                  : "bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700"
                  }`}
              >
                {form.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                {form.is_active ? "Active" : "Inactive"}
              </button>
            </div>

            {/* Actions */}
            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-theme-xs"
              >
                <Check size={16} />
                {editingId ? "Save Changes" : "Create Coupon"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Coupons", value: coupons.length, color: "brand" },
          { label: "Active", value: coupons.filter(c => c.is_active && !isExpired(c) && !isExhausted(c)).length, color: "success" },
          { label: "Expired / Exhausted", value: coupons.filter(c => isExpired(c) || isExhausted(c)).length, color: "error" },
          { label: "Total Uses", value: coupons.reduce((s, c) => s + c.used_count, 0), color: "warning" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-theme-xs">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">{stat.label}</span>
            <p className="text-2xl font-bold text-gray-800 dark:text-white/90 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Coupons list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-brand-50 dark:bg-brand-500/10 rounded-full flex items-center justify-center mb-4">
            <Tag size={28} className="text-brand-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">No coupons yet</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">Create your first discount coupon to delight customers.</p>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600">
            <Plus size={16} /> Add First Coupon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className={`relative bg-white dark:bg-gray-900 rounded-2xl border shadow-theme-xs overflow-hidden ${
                !coupon.is_active || isExpired(coupon) || isExhausted(coupon)
                  ? "border-gray-200 dark:border-gray-800 opacity-70"
                  : "border-brand-200 dark:border-brand-900/50"
              }`}
            >
              {/* Coupon ticket notches */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 z-10" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 rounded-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 z-10" />

              <div className="p-5">
                {/* Code + status */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-gray-800 dark:text-white/90 font-mono tracking-wider">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => handleCopy(coupon.code)}
                        className="text-gray-400 hover:text-brand-500 transition-colors"
                        title="Copy code"
                      >
                        {copied === coupon.code ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <div className="mt-1">{getStatusBadge(coupon)}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-brand-500">{coupon.discount_percent}%</span>
                    <p className="text-xs text-gray-400">discount</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-3" />

                {/* Meta info */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-300 block">Uses</span>
                    {coupon.max_uses === null ? (
                      <span>{coupon.used_count} / ∞</span>
                    ) : (
                      <span>{coupon.used_count} / {coupon.max_uses}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-300 block">Expires</span>
                    {coupon.valid_to ? (
                      <span>{new Date(coupon.valid_to).toLocaleDateString()}</span>
                    ) : (
                      <span>Never</span>
                    )}
                  </div>
                </div>

                {/* Usage bar */}
                {coupon.max_uses !== null && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-brand-500 transition-all"
                        style={{ width: `${Math.min(100, (coupon.used_count / coupon.max_uses) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => handleToggleActive(coupon)}
                    className={`text-xs font-medium flex items-center gap-1 transition-colors ${
                      coupon.is_active ? "text-success-600 hover:text-gray-500" : "text-gray-400 hover:text-success-600"
                    }`}
                    title={coupon.is_active ? "Deactivate" : "Activate"}
                  >
                    {coupon.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    {coupon.is_active ? "Active" : "Inactive"}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(coupon)}
                      className="p-1.5 text-gray-400 hover:text-brand-500 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                      title="Edit"
                    >
                      <Edit size={15} />
                    </button>
                    {confirmDelete === coupon.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { deleteCoupon(coupon.id); setConfirmDelete(null); }}
                          className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600"
                        >
                          Confirm
                        </button>
                        <button onClick={() => setConfirmDelete(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(coupon.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
