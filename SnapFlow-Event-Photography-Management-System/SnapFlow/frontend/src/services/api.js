import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('snapflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('snapflow_token');
      localStorage.removeItem('snapflow_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// Packages
export const packageApi = {
  getActive: () => api.get('/packages'),
  getAll: () => api.get('/packages/all'),
  getById: (id) => api.get(`/packages/${id}`),
  create: (data) => api.post('/packages', data),
  update: (id, data) => api.put(`/packages/${id}`, data),
  deactivate: (id) => api.delete(`/packages/${id}`),
};

// Add-ons
export const addOnApi = {
  getActive: () => api.get('/addons'),
  getAll: () => api.get('/addons/all'),
  getById: (id) => api.get(`/addons/${id}`),
  create: (data) => api.post('/addons', data),
  update: (id, data) => api.put(`/addons/${id}`, data),
  deactivate: (id) => api.delete(`/addons/${id}`),
};

// Bookings
export const bookingApi = {
  create: (data) => api.post('/bookings', data),
  getMy: () => api.get('/bookings/my'),
  getAll: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  getByRef: (ref) => api.get(`/bookings/ref/${ref}`),
  getByStatus: (status) => api.get(`/bookings/status/${status}`),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
};

// Assignments
export const assignmentApi = {
  assign: (data) => api.post('/assignments', data),
  reassign: (id, photographerId) => api.put(`/assignments/${id}/reassign`, { photographerId }),
  updateProgress: (id, data) => api.patch(`/assignments/${id}/progress`, data),
  getMy: () => api.get('/assignments/my'),
  getByBooking: (bookingId) => api.get(`/assignments/booking/${bookingId}`),
  getPhotographers: () => api.get('/assignments/photographers'),
};

// Change Requests
export const changeRequestApi = {
  create: (data) => api.post('/change-requests', data),
  review: (id, data) => api.put(`/change-requests/${id}/review`, data),
  getPending: () => api.get('/change-requests/pending'),
  getMy: () => api.get('/change-requests/my'),
  getByBooking: (bookingId) => api.get(`/change-requests/booking/${bookingId}`),
};

// Payments
export const paymentApi = {
  record: (data) => api.post('/payments', data),
  verify: (id, approved, notes) => api.put(`/payments/${id}/verify`, { approved, notes }),
  getPending: () => api.get('/payments/pending'),
  getByBooking: (bookingId) => api.get(`/payments/booking/${bookingId}`),
  getAll: () => api.get('/payments'),
};

// Galleries
export const galleryApi = {
  create: (data) => api.post('/galleries', data),
  addPhoto: (id, data) => api.post(`/galleries/${id}/photos`, data),
  publish: (id) => api.put(`/galleries/${id}/publish`),
  getById: (id) => api.get(`/galleries/${id}`),
  getByBooking: (bookingId) => api.get(`/galleries/booking/${bookingId}`),
  getByCode: (code) => api.get(`/galleries/access/${code}`),
};

// Dashboard
export const dashboardApi = {
  summary: () => api.get('/dashboard/summary'),
};

// Users
export const userApi = {
  me: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  getAll: () => api.get('/users'),
  getCustomers: () => api.get('/users/customers'),
  getPhotographers: () => api.get('/users/photographers'),
  getById: (id) => api.get(`/users/${id}`),
  toggleActive: (id) => api.patch(`/users/${id}/toggle-active`),
};

// Notifications
export const notificationApi = {
  getAll: () => api.get('/notifications'),
  getUnread: () => api.get('/notifications/unread'),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

// Equipment
export const equipmentApi = {
  getAll: () => api.get('/equipment'),
  getAvailable: () => api.get('/equipment/available'),
  create: (data) => api.post('/equipment', data),
  updateStatus: (id, status) => api.patch(`/equipment/${id}/status`, { status }),
  allocate: (data) => api.post('/equipment/allocate', data),
  returnEquipment: (id) => api.put(`/equipment/allocations/${id}/return`),
  getByBooking: (bookingId) => api.get(`/equipment/allocations/booking/${bookingId}`),
};

// Activity Logs
export const activityLogApi = {
  getRecent: () => api.get('/activity-logs'),
};

