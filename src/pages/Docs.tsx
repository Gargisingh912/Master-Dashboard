import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ChefHat,
  Banknote,
  QrCode,
  Users,
  ArrowRight,
  PlusCircle,
  ImagePlus,
  BellRing,
  Tag,
  Volume2,
  VolumeX,
  Leaf,
  ZoomIn,
  StickyNote,
  Bell,
  BarChart2,
  Filter,
  ShoppingCart,
  Sparkles,
} from "lucide-react";

// ── Reusable sub-components ─────────────────────────────────────────────────

function StepCard({
  number,
  icon,
  iconBg,
  title,
  children,
}: {
  number: number;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:p-8">
      <div className="flex items-start gap-5">
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            {number}. {title}
          </h2>
          {children}
        </div>
      </div>
    </section>
  );
}

function FeaturePill({ label, color = "brand" }: { label: string; color?: string }) {
  const map: Record<string, string> = {
    brand: "bg-brand-50 text-brand-600 border-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-900/40",
    green: "bg-green-50 text-green-700 border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-900/30",
    orange: "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-900/30",
    purple: "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-900/30",
    red: "bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-900/30",
  };
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${map[color] || map.brand}`}>
      {label}
    </span>
  );
}

function InfoBox({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
      <div className="mt-0.5 shrink-0 text-gray-400 dark:text-gray-500">{icon}</div>
      <div>
        <h4 className="font-semibold text-gray-800 dark:text-white mb-1">{title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{children}</p>
      </div>
    </div>
  );
}

function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 flex gap-3 rounded-xl border border-brand-100 bg-brand-50/60 p-4 dark:border-brand-900/40 dark:bg-brand-500/5">
      <Sparkles size={18} className="mt-0.5 shrink-0 text-brand-500" />
      <p className="text-sm text-brand-700 dark:text-brand-300">{children}</p>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function Docs() {
  return (
    <>
      <PageMeta
        title="Walkthrough & Docs | Dashboard"
        description="Complete walkthrough of your Master Dashboard — all features explained."
      />
      <PageBreadcrumb pageTitle="System Walkthrough" />

      <div className="mx-auto max-w-5xl space-y-8">

        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-8 text-white shadow-theme-lg">
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <FeaturePill label="Updated" color="green" />
              <span className="text-brand-200 text-xs font-medium">All latest features included</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">Welcome to Your Master Dashboard</h1>
            <p className="text-brand-100 text-lg leading-relaxed">
              This system automates your entire restaurant — from digital QR ordering to live kitchen management, smart notifications, discount coupons, and automated inventory tracking. Follow this guide to master every feature.
            </p>
          </div>
          <ChefHat className="absolute -bottom-10 -right-10 h-64 w-64 text-brand-600 opacity-40" />
        </div>

        {/* Quick Nav */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Quick Navigation</p>
          <div className="flex flex-wrap gap-2">
            {[
              "1. Dashboard Overview", "2. Menu & Inventory", "3. QR Codes",
              "4. Live Orders & Alerts", "5. Order Notes", "6. Silent Mode",
              "7. Diet Labeling", "8. Diet Filter (QR)", "9. Image Zoom (QR)",
              "10. Coupon Codes", "11. QR Coupon Input", "12. Customers & Finance",
            ].map((item, i) => (
              <span key={i} className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-400 font-medium">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-8">

          {/* ── STEP 1: Overview ── */}
          <StepCard number={1} icon={<LayoutDashboard size={28} />} iconBg="bg-blue-50 text-blue-500 dark:bg-blue-500/10" title="The Overview Dashboard">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              When you log in, you land on the <strong>Overview Dashboard</strong> — your daily command center.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoBox icon={<BellRing size={18} />} title="Live Order Status — Today Only">
                The KPI cards at the top show <strong>only today's</strong> order counts for Placed, Preparing, and Delivered statuses. Numbers reset every midnight so you always see fresh data.
              </InfoBox>
              <InfoBox icon={<ArrowRight size={18} />} title="Inventory Alerts">
                Instantly see if any ingredients are running critically low based on your linked menu items — with a clear warning before you run out.
              </InfoBox>
            </div>
            <TipBox>The "Live Order Status" KPI filters by the current calendar day, so it never includes yesterday's backlog.</TipBox>
          </StepCard>

          {/* ── STEP 2: Menu & Inventory ── */}
          <StepCard number={2} icon={<UtensilsCrossed size={28} />} iconBg="bg-orange-50 text-orange-500 dark:bg-orange-500/10" title="Setting Up Your Menu & Inventory">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Go to the <strong>Menu Management</strong> tab to add your dishes. Link each dish to raw inventory items so stock deducts automatically when an order is delivered!
            </p>
            <div className="flex flex-col gap-4">
              <InfoBox icon={<PlusCircle size={18} />} title="Step A: Add Raw Ingredients (Inventory)">
                Before adding a dish, add your ingredients (e.g., Flour, Cheese) in the <strong>Inventory</strong> tab. The system will warn you when stock runs low.
              </InfoBox>
              <InfoBox icon={<ImagePlus size={18} />} title="Step B: Create a Dish & Upload an Image">
                Click <strong>"+ Add New Dish"</strong>, enter the price, select the ingredients it uses, and upload a photo. This picture automatically appears on your live QR menu!
              </InfoBox>
              <InfoBox icon={<Leaf size={18} />} title="Step C: Set Diet Type (New!)">
                When adding or editing a dish, you can now select its <strong>Diet Type</strong>:
                <span className="mx-1 inline-block w-3 h-3 rounded-full bg-green-500" title="Veg" /> <strong>Veg</strong>,
                <span className="mx-1 inline-block w-3 h-3 rounded-full bg-red-500" title="Non-Veg" /> <strong>Non-Veg</strong>, or
                <span className="mx-1 inline-block w-3 h-3 rounded-full bg-purple-500" title="Vegan" /> <strong>Vegan</strong>.
                A colored indicator dot appears on each menu card and on the customer-facing QR menu.
              </InfoBox>
            </div>
          </StepCard>

          {/* ── STEP 3: QR Codes ── */}
          <StepCard number={3} icon={<QrCode size={28} />} iconBg="bg-purple-50 text-purple-500 dark:bg-purple-500/10" title="Generating QR Codes">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Go to the <strong>QR Code</strong> tab to generate a unique QR code for every table in your restaurant.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-300">
              <ul className="list-disc pl-5 space-y-2">
                <li>Print these codes and place them on your tables.</li>
                <li>Customers scan them with their phone camera — <strong>no app needed!</strong></li>
                <li>They see your digital menu (with photos), and can place orders directly to the kitchen.</li>
                <li>QR orders are linked to your organization — so they appear in your Orders tab instantly.</li>
              </ul>
            </div>
            <TipBox>You can share the QR link directly via WhatsApp or print it as a table tent. Customers on any device can order seamlessly.</TipBox>
          </StepCard>

          {/* ── STEP 4: Live Orders & Alerts ── */}
          <StepCard number={4} icon={<ChefHat size={28} />} iconBg="bg-red-50 text-red-500 dark:bg-red-500/10" title="Live Kitchen Orders & Alerts">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              When a customer places an order via QR or the dashboard, it instantly pops up in your <strong>Orders</strong> tab with a loud alert tone that rings for <strong>up to 5 minutes</strong> until you action it.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {[
                { status: "1. PLACED", color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200", desc: "Order arrives. Click Accept to start cooking, or Decline to reject." },
                { status: "2. PREPARING", color: "bg-warning-100 text-warning-700 dark:bg-warning-500/20 dark:text-warning-400", desc: "Food is being cooked. Click Mark Ready when done." },
                { status: "3. DELIVERED", color: "bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-400", desc: "Waiter delivers to the table. Click Deliver to close the order." },
              ].map((s) => (
                <div key={s.status} className="bg-white border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl p-4 shadow-xs text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${s.color}`}>{s.status}</span>
                  <p className="text-xs text-gray-500">{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <InfoBox icon={<Bell size={18} />} title="Notification Click → Orders Tab (New!)">
                When you click the <strong>notification bell</strong> in the header and there are pending orders, you are taken directly to the Orders tab to accept or decline immediately — no extra navigation needed.
              </InfoBox>
              <InfoBox icon={<BellRing size={18} />} title="5-Minute Alert Tone (New!)">
                The alarm sound plays continuously (with short pauses) for up to <strong>5 minutes</strong> until someone accepts or declines the order. You will never miss a new order again.
              </InfoBox>
            </div>
          </StepCard>

          {/* ── STEP 5: Order Notes ── */}
          <StepCard number={5} icon={<StickyNote size={28} />} iconBg="bg-amber-50 text-amber-500 dark:bg-amber-500/10" title="Cooking Requests & Notes">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Customers can now leave <strong>special cooking instructions</strong> when placing an order — things like "Extra spicy", "No onions", or allergy notes.
            </p>
            <div className="flex flex-col gap-3">
              <InfoBox icon={<StickyNote size={16} />} title="Notes in Orders Table">
                A dedicated <strong>Notes column</strong> has been added to the Orders table so kitchen staff can immediately see any requests without opening each order individually.
              </InfoBox>
              <InfoBox icon={<ArrowRight size={16} />} title="Notes in Invoice">
                When you view an order's invoice, the cooking notes appear highlighted in an <strong>amber box</strong> — clearly visible so nothing gets missed.
              </InfoBox>
            </div>
            <TipBox>On the QR ordering page, customers see a "Cooking Requests" text area at the bottom of the order form. On the live dashboard, the field appears in the Add Order drawer.</TipBox>
          </StepCard>

          {/* ── STEP 6: Silent Mode ── */}
          <StepCard number={6} icon={<VolumeX size={28} />} iconBg="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300" title="Silent Notification Mode">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Need to silence the kitchen during a quiet period? Use the <strong>Silent Mode toggle</strong> next to the theme button in the top header.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoBox icon={<Volume2 size={16} />} title="Normal Mode (Default)">
                The alarm tone plays through your device speakers for up to 5 minutes on every new order. Ideal for a busy kitchen.
              </InfoBox>
              <InfoBox icon={<VolumeX size={16} />} title="Silent Mode (Muted Audio)">
                Audio is completely muted — but the phone/tablet will still <strong>vibrate</strong> for every new order. A red <strong>!</strong> badge appears on the toggle so you know it's active. Notifications still appear on-screen.
              </InfoBox>
            </div>
            <TipBox>Silent mode is perfect during restaurant closing hours or when you have a quiet event, but still want to be alerted by vibration.</TipBox>
          </StepCard>

          {/* ── STEP 7: Diet Labeling ── */}
          <StepCard number={7} icon={<Leaf size={28} />} iconBg="bg-green-50 text-green-600 dark:bg-green-500/10" title="Veg / Non-Veg / Vegan Labeling">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You can now mark each menu item with a <strong>diet type</strong> in Menu Management. This displays a colored dot on every item card in the dashboard and on the QR customer menu.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { dot: "bg-green-500", label: "Veg", desc: "Purely vegetarian. Shown with a green dot — standard for Indian restaurant menus." },
                { dot: "bg-red-500", label: "Non-Veg", desc: "Contains meat or seafood. Shown with a red dot so customers can identify instantly." },
                { dot: "bg-purple-500", label: "Vegan", desc: "No animal products at all. Shown with a purple dot for vegan-conscious customers." },
              ].map((d) => (
                <div key={d.label} className="rounded-xl border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-block w-4 h-4 rounded-full ${d.dot} ring-2 ring-offset-1 ring-white dark:ring-gray-900`} />
                    <span className="font-semibold text-gray-800 dark:text-white">{d.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{d.desc}</p>
                </div>
              ))}
            </div>
          </StepCard>

          {/* ── STEP 8: Diet Filter on QR ── */}
          <StepCard number={8} icon={<Filter size={28} />} iconBg="bg-teal-50 text-teal-600 dark:bg-teal-500/10" title="Diet Filter on QR Menu (Customer-Facing)">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              On the customer QR ordering page, a <strong>filter dropdown</strong> at the top lets customers instantly filter the menu to show only Veg, Non-Veg, or Vegan items.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-300">
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>🍽️ All</strong> — shows every available item (default).</li>
                <li><strong>🟢 Veg Only</strong> — filters to show only vegetarian items.</li>
                <li><strong>🔴 Non-Veg Only</strong> — shows only non-vegetarian items.</li>
                <li><strong>🟣 Vegan Only</strong> — shows only items labeled as vegan.</li>
              </ul>
            </div>
            <TipBox>The filter works across all category tabs simultaneously — switch category, the diet filter stays applied.</TipBox>
          </StepCard>

          {/* ── STEP 9: Image Zoom on QR ── */}
          <StepCard number={9} icon={<ZoomIn size={28} />} iconBg="bg-sky-50 text-sky-500 dark:bg-sky-500/10" title="Image Zoom on QR Menu">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Customers can now <strong>tap any food image</strong> on the QR ordering page to see a full-screen zoomed view of the dish.
            </p>
            <div className="flex flex-col gap-3">
              <InfoBox icon={<ZoomIn size={16} />} title="How It Works">
                Tapping a dish image opens a <strong>fullscreen modal</strong> with the photo. A close button (✕) in the corner or tapping outside the image closes it. On mobile, users can pinch-to-zoom inside the modal.
              </InfoBox>
              <InfoBox icon={<ImagePlus size={16} />} title="Why It Matters">
                High-quality dish photos are one of the best ways to drive upsells. Customers who can clearly see a dish are far more likely to order it — so upload great photos in Menu Management!
              </InfoBox>
            </div>
          </StepCard>

          {/* ── STEP 10: Discount Coupons ── */}
          <StepCard number={10} icon={<Tag size={28} />} iconBg="bg-pink-50 text-pink-500 dark:bg-pink-500/10" title="Discount Coupons">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Go to the <strong>Discount Coupons</strong> tab (previously "Team") to create and manage percentage-based discount codes for your customers.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <InfoBox icon={<PlusCircle size={16} />} title="Creating a Coupon">
                Set a unique <strong>coupon code</strong> (e.g., SAVE20), a discount percentage, an optional usage limit, and optional start/end dates. Activate or deactivate any coupon at any time.
              </InfoBox>
              <InfoBox icon={<BarChart2 size={16} />} title="Tracking Usage">
                Each coupon card shows a <strong>usage progress bar</strong> — how many times it has been used vs. the maximum limit. Exhausted or expired coupons are clearly labelled.
              </InfoBox>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50 p-5 text-sm text-gray-600 dark:text-gray-400">
              <p className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Coupon Status Types</p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-success-200 bg-success-50 px-3 py-1 text-xs font-semibold text-success-700 dark:bg-success-500/10 dark:text-success-400">✓ Active</span>
                <span className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-400">Inactive (manually disabled)</span>
                <span className="rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">Expired (past valid date)</span>
                <span className="rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">Exhausted (max uses reached)</span>
              </div>
            </div>
            <TipBox>You can copy any coupon code to the clipboard with one click, and share it with customers via WhatsApp or SMS.</TipBox>
          </StepCard>

          {/* ── STEP 11: QR Coupon Input ── */}
          <StepCard number={11} icon={<ShoppingCart size={28} />} iconBg="bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10" title="Coupon Code Input on QR Ordering">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Customers using the QR ordering page can enter a <strong>coupon code</strong> at checkout to apply a discount before placing their order.
            </p>
            <div className="flex flex-col gap-3 mb-4">
              <InfoBox icon={<Tag size={16} />} title="How Customers Apply It">
                At the bottom of the screen (in the sticky cart bar), a coupon code input field appears once they add items. They type their code and tap <strong>Apply</strong>. If the code is valid, the discount is shown instantly.
              </InfoBox>
              <InfoBox icon={<BarChart2 size={16} />} title="Live Discount Calculation">
                The cart total updates in real-time to show the original subtotal, the coupon discount amount (e.g., <em>−₹40.00</em>), and the final price. The invoice also reflects the applied coupon code and savings.
              </InfoBox>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50 p-5 text-sm text-gray-600 dark:text-gray-400">
              <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Validation Checks</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Invalid or non-existent code → shown as an error.</li>
                <li>Inactive coupon → "This coupon is no longer active."</li>
                <li>Usage limit reached → "This coupon has reached its usage limit."</li>
                <li>Not yet started → "This coupon is not yet active."</li>
                <li>Expired → "This coupon has expired."</li>
              </ul>
            </div>
          </StepCard>

          {/* ── STEP 12: Customers & Finance ── */}
          <StepCard number={12} icon={<Banknote size={28} />} iconBg="bg-green-50 text-green-500 dark:bg-green-500/10" title="Customers & Finance">
            <div className="space-y-4">
              <InfoBox icon={<Users size={18} />} title="Customer Database">
                The <strong>Customers</strong> tab shows a history of everyone who has ordered — name, contact, email, date of birth, and address. The system auto-fills returning customer details on QR orders.
                <em className="block mt-1 text-gray-400">(Tip: Use "Clean Up QR Auth Users" button to remove stale anonymous sessions.)</em>
              </InfoBox>
              <InfoBox icon={<Banknote size={18} />} title="Finance & Expenses">
                In the <strong>Finance</strong> tab, log daily expenses (rent, electricity, salaries) to see your <strong>true net profit</strong> calculated automatically against your sales revenue.
              </InfoBox>
              <InfoBox icon={<ArrowRight size={18} />} title="Optional Email & DOB on Orders">
                Both the <strong>live order drawer</strong> and the <strong>QR order form</strong> now treat email and date of birth as <strong>optional fields</strong>. DOB is marked with 🎁 <em>"for exclusive offers"</em> to encourage customers to provide it without making it mandatory.
              </InfoBox>
            </div>
          </StepCard>

        </div>

        {/* Footer note */}
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-6 text-center">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Have questions or need a feature? Contact your system administrator or reach out via the <strong>Support</strong> tab.
          </p>
        </div>

      </div>
    </>
  );
}
