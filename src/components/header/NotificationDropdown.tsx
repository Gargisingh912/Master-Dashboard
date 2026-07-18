import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useOrderNotifications } from "../../hooks/useOrderNotifications";
import { formatCurrency, formatTime } from "../../utils/helpers";

const CountdownTimer = ({ createdAt, onExpire }: { createdAt: string; onExpire?: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    const startTime = new Date(createdAt).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, 60 - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0 && onExpire) {
        onExpire();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt, onExpire]);

  return (
    <span className={`text-xs font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-orange-500'}`}>
      {timeLeft}s
    </span>
  );
};

interface NotificationDropdownProps {
  organizationId: string | null;
}

export default function NotificationDropdown({ organizationId }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { pendingOrders, missedOrders, acceptOrder, declineOrder } = useOrderNotifications(organizationId);

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
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${!notifying ? "hidden" : "flex"
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

        <ul className="flex flex-col h-auto gap-2 overflow-y-auto custom-scrollbar pb-4">
          {pendingOrders.length === 0 && missedOrders.length === 0 && (
            <li className="py-8 text-sm text-center text-gray-400">
              No new orders right now.
            </li>
          )}

          {pendingOrders.map((order) => (
            <li key={order.id}>
              <DropdownItem
                onItemClick={() => { }}
                className="flex flex-col gap-2 rounded-lg border border-orange-200 p-3 dark:border-orange-900/50 bg-orange-50/80 dark:bg-orange-500/10 shadow-theme-xs"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-gray-800 dark:text-white/90">
                    Order #{order.order_ID}
                  </span>
                  <div className="flex items-center gap-2">
                    <CountdownTimer createdAt={order.created_at} />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(order.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {order.customer_name}
                  </span>
                  {order.customer_contact && (
                    <span className="text-xs text-gray-500">{order.customer_contact}</span>
                  )}
                </div>

                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                </span>

                <div className="flex items-center justify-between w-full mt-2">
                  <span className="font-bold text-gray-800 dark:text-white/90">
                    {formatCurrency(order.total)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        declineOrder(order.id);
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Decline
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAccept(order.id);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-theme-xs"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              </DropdownItem>
            </li>
          ))}

          {missedOrders.length > 0 && (
            <>
              <li className="pt-2 pb-1 border-t border-gray-100 dark:border-gray-800 mt-2">
                <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">Missed / Declined</span>
              </li>
              {missedOrders.map((order) => (
                <li key={order.id}>
                  <DropdownItem
                    onItemClick={() => { }}
                    className="flex flex-col gap-2 rounded-lg border border-red-100 p-3 dark:border-red-900/30 bg-red-50/50 dark:bg-red-500/5"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        Order #{order.order_ID}
                      </span>
                      <span className="text-xs text-red-500 font-medium">Declined</span>
                    </div>

                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {order.customer_name}
                    </span>

                    <div className="flex items-center justify-between w-full mt-1">
                      <span className="font-medium text-gray-600 dark:text-gray-400">
                        {formatCurrency(order.total)}
                      </span>
                      {order.customer_contact ? (
                        <a
                          href={`https://wa.me/91${order.customer_contact}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 shadow-theme-xs flex items-center gap-1"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                          WhatsApp
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No contact info</span>
                      )}
                    </div>
                  </DropdownItem>
                </li>
              ))}
            </>
          )}
        </ul>
      </Dropdown>
    </div>
  );
}