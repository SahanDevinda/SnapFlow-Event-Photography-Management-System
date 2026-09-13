export function formatCurrency(amount) {
  if (amount == null) return 'LKR 0';
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function statusBadgeClass(status) {
  const map = {
    PENDING: 'badge-pending',
    CONFIRMED: 'badge-confirmed',
    ASSIGNED: 'badge-assigned',
    IN_PROGRESS: 'badge-progress',
    COMPLETED: 'badge-completed',
    CANCELLED: 'badge-cancelled',
    VERIFIED: 'badge-verified',
    REJECTED: 'badge-rejected',
    APPROVED: 'badge-verified',
  };
  return map[status] || 'badge bg-dark-100 text-dark-600';
}

export function getDashboardPath(role) {
  const map = {
    CUSTOMER: '/customer',
    CUSTOMER_RELATIONS_OFFICER: '/cro',
    OPERATIONS_MANAGER: '/ops',
    PHOTOGRAPHER: '/photographer',
    FINANCE_EXECUTIVE: '/finance',
    COMPANY_DIRECTOR: '/admin',
  };
  return map[role] || '/';
}

export function getErrorMessage(err) {
  return err?.response?.data?.message
    || err?.response?.data?.error
    || err?.message
    || 'Something went wrong';
}
