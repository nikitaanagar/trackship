import API from './api';

export const getNotifications = async () => {
  return API.get('/notifications');
};

export const markRead = async (id) => {
  return API.put(`/notifications/mark-read/${id}`);
};

export const markAllRead = async () => {
  return API.put('/notifications/mark-all-read');
};
