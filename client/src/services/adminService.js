import API from './api';

export const getDashboardStats = async () => {
  return API.get('/admin/dashboard-stats');
};

export const getBookings = async (params) => {
  return API.get('/admin/bookings', { params });
};

export const assignAgent = async (id, agentId) => {
  return API.put(`/admin/bookings/${id}/assign-agent`, { agentId });
};

export const getUsers = async (params) => {
  return API.get('/admin/users', { params });
};

export const updateUserRole = async (id, role) => {
  return API.put(`/admin/users/${id}/role`, { role });
};

export const toggleUserStatus = async (id, isActive) => {
  return API.put(`/admin/users/${id}/status`, { isActive });
};

export const getReports = async (params) => {
  return API.get('/admin/reports', { params });
};
