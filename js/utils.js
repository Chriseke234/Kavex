/**
 * Kavex Utility Functions
 */

// Format Currency
export const formatCurrency = (amount, currency = 'NGN') => {
  const locale = currency === 'NGN' ? 'en-NG' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Format Date
export const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
};

// Toast Notifications
export const showToast = (message, type = 'info') => {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon"></span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  // Auto-remove after 3s
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// Error Handler Wrapper for Supabase Calls
export const handleSupabaseError = (error, customMessage = 'An unexpected error occurred') => {
  if (error) {
    console.error(error);
    showToast(error.message || customMessage, 'error');
    return true;
  }
  return false;
};

// LocalStorage Helper for Cart/Session
export const storage = {
  set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  get: (key) => {
    const value = localStorage.getItem(key);
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  },
  remove: (key) => localStorage.removeItem(key),
};
