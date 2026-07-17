import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";

export default function Docs() {
  return (
    <>
      <PageMeta
        title="Documentation | Dashboard"
        description="User Instruction Manual for Master Dashboard."
      />
      <PageBreadcrumb pageTitle="Documentation" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Welcome to Your Dashboard!</h2>
          <p className="text-gray-500 dark:text-gray-400">
            This quick instruction manual will help you navigate and make the most out of your restaurant management system.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Dashboard Module */}
          <div className="flex flex-col rounded-xl bg-gray-50 p-6 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 hover:shadow-sm transition-shadow">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">Dashboard</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Get an instant overview of your restaurant's performance. View today's sales, active orders, and quickly jump to different modules.
            </p>
          </div>

          {/* Menu Module */}
          <div className="flex flex-col rounded-xl bg-gray-50 p-6 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 hover:shadow-sm transition-shadow">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">Menu & Items</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage your digital menu. Add new items, update prices, and upload mouth-watering photos. Changes instantly sync with your QR menus.
            </p>
          </div>

          {/* Orders Module */}
          <div className="flex flex-col rounded-xl bg-gray-50 p-6 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 hover:shadow-sm transition-shadow">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">Live Orders</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track incoming customer orders in real-time. Change order statuses (Preparing, Ready, Served) to keep the kitchen and customers in sync.
            </p>
          </div>

          {/* Finance Module */}
          <div className="flex flex-col rounded-xl bg-gray-50 p-6 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 hover:shadow-sm transition-shadow">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">Finance</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Keep an eye on the bottom line. Review your revenue history, manage recorded expenses, and check out top-selling items to optimize your menu.
            </p>
          </div>

          {/* QR Code Module */}
          <div className="flex flex-col rounded-xl bg-gray-50 p-6 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 hover:shadow-sm transition-shadow">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">QR Code</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Download and print custom QR codes for your tables. Customers simply scan the code with their phones to view your menu and place orders instantly.
            </p>
          </div>

          {/* Settings Module */}
          <div className="flex flex-col rounded-xl bg-gray-50 p-6 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 hover:shadow-sm transition-shadow">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">Team & Settings</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Invite staff members to your dashboard. Control permissions so everyone only sees what they need to manage operations smoothly.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-brand-50 p-6 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20">
          <h3 className="mb-3 text-lg font-semibold text-brand-600 dark:text-brand-400">Getting Help</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            If you ever get stuck or need additional assistance, check out our full support portal or utilize the "Talk to your Data!!" assistant to get immediate context on your performance.
          </p>
        </div>
      </div>
    </>
  );
}
