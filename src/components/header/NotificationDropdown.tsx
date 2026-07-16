import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useOrderNotifications } from "../../hooks/useOrderNotifications";
import { formatCurrency, formatTime } from "../../utils/helpers";

interface NotificationDropdownProps {
  organizationId: string | null;
}

export default function NotificationDropdown({ organizationId }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { pendingOrders, acceptOrder } = useOrderNotifications(organizationId);

  function toggleDropdown() {
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleAccept = async (orderId: string) => {
    await acceptOrder(orderId);
  };

  const notifying = pendingOrders.length > 0;

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
            !notifying ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        {notifying && (
          <span className="absolute -top-1 -right-1 z-20 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {pendingOrders.length}
          </span>
        )}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            New Orders {pendingOrders.length > 0 && `(${pendingOrders.length})`}
          </h5>
          <button
            onClick={toggleDropdown}
            className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <ul className="flex flex-col h-auto gap-2 overflow-y-auto custom-scrollbar">
          {pendingOrders.length === 0 && (
            <li className="py-8 text-sm text-center text-gray-400">
              No new orders right now.
            </li>
          )}

          {pendingOrders.map((order) => (
            <li key={order.id}>
              <DropdownItem
                onItemClick={() => {}}
                className="flex flex-col gap-2 rounded-lg border border-gray-100 p-3 dark:border-gray-800 bg-orange-50/50 dark:bg-white/5"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-gray-800 dark:text-white/90">
                    Order #{order.order_number}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(order.created_at)}
                  </span>
                </div>

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {order.customer_name}
                </span>

                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                </span>

                <div className="flex items-center justify-between w-full mt-1">
                  <span className="font-semibold text-gray-800 dark:text-white/90">
                    {formatCurrency(order.total)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAccept(order.id);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    Accept & Prepare
                  </button>
                </div>
              </DropdownItem>
            </li>
          ))}
        </ul>
      </Dropdown>
    </div>
  );
}