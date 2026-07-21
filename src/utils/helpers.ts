import { APP_CONFIG } from "../config/config";

/**
 * Format currency value
 */
export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${APP_CONFIG.defaultCurrency}0.00`;
  }
  return `${APP_CONFIG.defaultCurrency}${amount.toFixed(2)}`;
};

/**
 * Generate unique slug from restaurant name
 */
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
};

/**
 * Generate random order number
 */
export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${APP_CONFIG.orderPrefix}${timestamp}${random}`;
};

/**
 * Generate temporary password
 */
export const generateTempPassword = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

/**
 * Calculate order totals
 */
export const calculateOrderTotals = (items: any[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.item_total, 0);
  const tax = subtotal * APP_CONFIG.taxRate;
  const total = subtotal + tax;

  return { subtotal, tax, total };
};

/**
 * Format date and time
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

/**
 * Validate email
 */
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validate phone number (Indian format)
 */
export const isValidPhone = (phone: string): boolean => {
  const re = /^[6-9]\d{9}$/;
  return re.test(phone.replace(/[\s\-()]/g, ""));
};

/**
 * Hash password using SHA-256
 * Works on both HTTP and HTTPS (mobile and desktop)
 */
export const hashPassword = async (password: string): Promise<string> => {
  // Use crypto-js for consistent hashing across all platforms
  const CryptoJS = (await import("crypto-js")).default;
  return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Get status color class
 */
export const getStatusColor = (status: string): string => {
  const statusConfig =
    APP_CONFIG.orderStatuses[status as keyof typeof APP_CONFIG.orderStatuses];
  return statusConfig?.color || "neutral";
};

/**
 * Calculate item price with size and addons
 */
export const calculateItemPrice = (
  basePrice: number,
  selectedSize?: { price: number },
  selectedAddons?: { price: number }[]
): number => {
  let price = selectedSize ? selectedSize.price : basePrice;
  if (selectedAddons && selectedAddons.length > 0) {
    price += selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  }
  return price;
};

/**
 * Download file
 */
export const downloadFile = (url: string, filename: string) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Play notification sound using Web Audio API
 * Loud, 5-second repeating alarm designed for busy kitchens
 */
export const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;

    // 3 rapid bursts, repeated 3 times over ~5 seconds
    const burstPattern = [
      // Round 1
      { freq: 880, start: 0.0, dur: 0.15 },   // A5
      { freq: 1100, start: 0.18, dur: 0.15 },  // C#6
      { freq: 880, start: 0.36, dur: 0.15 },   // A5
      // Pause
      // Round 2
      { freq: 880, start: 1.2, dur: 0.15 },
      { freq: 1100, start: 1.38, dur: 0.15 },
      { freq: 880, start: 1.56, dur: 0.15 },
      // Pause
      // Round 3
      { freq: 880, start: 2.4, dur: 0.15 },
      { freq: 1100, start: 2.58, dur: 0.15 },
      { freq: 880, start: 2.76, dur: 0.15 },
      // Pause
      // Round 4 — higher urgency
      { freq: 1100, start: 3.6, dur: 0.12 },
      { freq: 1320, start: 3.75, dur: 0.12 },
      { freq: 1100, start: 3.9, dur: 0.12 },
      { freq: 1320, start: 4.05, dur: 0.12 },
      { freq: 1100, start: 4.2, dur: 0.12 },
      { freq: 1320, start: 4.35, dur: 0.3 },
    ];

    burstPattern.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "square"; // harsher, cuts through kitchen noise
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.8, now + start); // loud
      gain.gain.exponentialRampToValueAtTime(0.01, now + start + dur);
      osc.start(now + start);
      osc.stop(now + start + dur);
    });

    setTimeout(() => ctx.close(), 6000);
  } catch {
    // Ignore — AudioContext not available
  }
};

/**
 * Play sound (alias for playNotificationSound)
 */
export const playSound = (
  _type: "notification" | "success" | "error" = "notification"
) => {
  playNotificationSound();
};

/**
 * Compress a UUID to a shorter 22-character Base62 string
 */
export const uuidToBase62 = (uuid: string): string => {
  if (!uuid) return "";
  const hex = uuid.replace(/-/g, "");
  let num = BigInt("0x" + hex);
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let base62 = "";
  while (num > 0n) {
    base62 = chars[Number(num % 62n)] + base62;
    num = num / 62n;
  }
  return base62.padStart(22, "0");
};

/**
 * Decompress a 22-character Base62 string back to a UUID
 */
export const base62ToUuid = (base62: string): string => {
  if (!base62 || base62.length !== 22) return base62;
  try {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let num = 0n;
    for (let i = 0; i < base62.length; i++) {
      const charIndex = chars.indexOf(base62[i]);
      if (charIndex === -1) return base62;
      num = num * 62n + BigInt(charIndex);
    }
    const hex = num.toString(16).padStart(32, "0");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  } catch {
    return base62;
  }
};

/**
 * Compute best-selling menu item IDs using the same logic as the
 * "Highest Selling Dishes" KPI on the dashboard Overview:
 *   - Consider only orders placed in the last 30 days
 *   - Aggregate total quantity sold per menuItemId
 *   - Return up to top-5 IDs sorted by quantity descending
 *   - No minimum threshold — any item sold in the window qualifies
 */
export const getBestSellingIds = (
  orders: Array<{ date: string; items: Array<{ menuItemId: string; quantity: number }> }>,
  topN = 5
): string[] => {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // last 30 days

  const counts: Record<string, number> = {};

  orders.forEach((order) => {
    if (!order.date) return;
    const orderDate = new Date(order.date);
    if (orderDate < cutoff) return; // outside 30-day window
    order.items.forEach((item) => {
      counts[item.menuItemId] = (counts[item.menuItemId] || 0) + item.quantity;
    });
  });

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN)
    .map(([id]) => id);
};
