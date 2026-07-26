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
  BellRing
} from "lucide-react";

export default function Docs() {
  return (
    <>
      <PageMeta
        title="Walkthrough & Docs | Dashboard"
        description="Complete walkthrough of your Master Dashboard."
      />
      <PageBreadcrumb pageTitle="System Walkthrough" />

      <div className="mx-auto max-w-5xl space-y-8">

        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-brand-500 p-8 text-white shadow-theme-lg">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl font-bold mb-4">Welcome to Your Master Dashboard</h1>
            <p className="text-brand-100 text-lg leading-relaxed">
              This system is designed to automate your restaurant operations—from digital QR ordering to live kitchen management and automated inventory tracking. Follow this walkthrough to master your dashboard in minutes.
            </p>
          </div>
          <ChefHat className="absolute -bottom-10 -right-10 h-64 w-64 text-brand-600 opacity-50" />
        </div>

        {/* Walkthrough Steps */}
        <div className="grid gap-8">

          {/* STEP 1: Overview */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:p-8">
            <div className="flex items-start gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-500/10">
                <LayoutDashboard size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">1. The Overview Dashboard</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  When you log in, you land on the Overview Dashboard. This is your command center for daily operations.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                    <h4 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-2">
                      <BellRing size={16} className="text-warning-500" /> Live Order Status
                    </h4>
                    <p className="text-sm text-gray-500">Track Placed, Preparing, and Delivered orders in real-time. This is constantly updating.</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                    <h4 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-2">
                      <ArrowRight size={16} className="text-success-500" /> Inventory Alerts
                    </h4>
                    <p className="text-sm text-gray-500">Instantly see if any ingredients are running critically low based on your menu items.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* STEP 2: Menu & Inventory */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:p-8">
            <div className="flex items-start gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-500/10">
                <UtensilsCrossed size={28} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">2. Setting Up Your Menu & Inventory</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Go to the <strong>Menu Management</strong> tab to add your dishes. Our system links dishes directly to your raw inventory so stock deducts automatically!
                </p>

                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50/50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/10">
                    <PlusCircle className="text-orange-500 mt-1" size={20} />
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Step A: Add Raw Ingredients (Inventory)</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Before adding a dish, add ingredients (e.g., Flour, Cheese) in the Inventory tab. This allows the system to warn you when you run out!</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50/50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/10">
                    <ImagePlus className="text-orange-500 mt-1" size={20} />
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Step B: Create a Dish & Upload an Image</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Click "+ Add New Dish". Enter the price, select the ingredients it uses, and <strong>upload a beautiful picture</strong> from your computer/phone. This picture automatically shows up on your QR Menu!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* STEP 3: QR Codes */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:p-8">
            <div className="flex items-start gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-500 dark:bg-purple-500/10">
                <QrCode size={28} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">3. Generating QR Codes</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Go to the <strong>QR Code</strong> tab. You can generate a unique QR code for every single table in your restaurant.
                </p>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-300">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Print these codes and stick them on your tables.</li>
                    <li>Customers scan them using their phone camera (no app needed!).</li>
                    <li>They will see your digital menu (with the pictures you uploaded) and can place orders directly to the kitchen.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* STEP 4: Live Kitchen Orders */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:p-8">
            <div className="flex items-start gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-500/10">
                <ChefHat size={28} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">4. Live Kitchen Orders</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  When a customer places an order via the QR code, it instantly pops up in your <strong>Orders</strong> tab with a loud alert tone!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl p-4 shadow-xs text-center">
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-full text-xs font-bold mb-2">1. PLACED</span>
                    <p className="text-xs text-gray-500">Order arrives. Click <strong>Accept</strong> to send it to the kitchen and print the invoice.</p>
                  </div>
                  <div className="bg-white border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl p-4 shadow-xs text-center">
                    <span className="inline-block px-3 py-1 bg-warning-100 text-warning-700 dark:bg-warning-500/20 dark:text-warning-400 rounded-full text-xs font-bold mb-2">2. PREPARING</span>
                    <p className="text-xs text-gray-500">Food is being cooked. Click <strong>Mark Ready</strong> when it is done.</p>
                  </div>
                  <div className="bg-white border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl p-4 shadow-xs text-center">
                    <span className="inline-block px-3 py-1 bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-400 rounded-full text-xs font-bold mb-2">3. READY</span>
                    <p className="text-xs text-gray-500">Waiter takes it to the table. Click <strong>Deliver</strong> to close the order.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* STEP 5: Customers & Finance */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:p-8">
            <div className="flex items-start gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-500 dark:bg-green-500/10">
                <Banknote size={28} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">5. Customers & Finance</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Users className="text-gray-400 mt-1" size={20} />
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">Customer Database</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Go to the Customers tab to see a history of everyone who has ordered. <em>(Note: You can clean up anonymous QR scans using the "Clean Up QR Auth Users" button in the corner).</em></p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Banknote className="text-gray-400 mt-1" size={20} />
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">Finance & Expenses</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">In the Finance tab, log your daily expenses (rent, electricity, salaries) to see your true net profit calculated automatically against your sales.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
