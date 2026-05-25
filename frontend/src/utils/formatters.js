/** Format price in Indian Rupees */
export const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

/** Calculate discount percentage */
export const discountPercent = (original, price) => {
  if (!original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
};

/** Format date */
export const formatDate = (date, opts = {}) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', ...opts });

/** Truncate text */
export const truncate = (str, len = 60) =>
  str && str.length > len ? str.slice(0, len) + '…' : str;

/** Order status display config */
export const ORDER_STATUS = {
  pending:    { label: 'Pending',    color: 'warning', icon: '🕐' },
  confirmed:  { label: 'Confirmed',  color: 'info',    icon: '✅' },
  processing: { label: 'Processing', color: 'info',    icon: '⚙️' },
  shipped:    { label: 'Shipped',    color: 'primary', icon: '🚚' },
  delivered:  { label: 'Delivered',  color: 'success', icon: '📦' },
  cancelled:  { label: 'Cancelled',  color: 'danger',  icon: '❌' },
};

/** Generate star array for rating display */
export const getStars = (rating) => {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return { full, half, empty };
};
