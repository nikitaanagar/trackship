import API from './api';

export const createBooking = async (formData) => {
  return API.post('/booking/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const getMyBookings = async (params) => {
  return API.get('/booking/my-bookings', { params });
};

export const trackParcel = async (trackingId) => {
  return API.get(`/booking/track/${trackingId}`);
};

export const getBookingById = async (id) => {
  return API.get(`/booking/${id}`);
};

export const cancelBooking = async (id) => {
  return API.delete(`/booking/${id}/cancel`);
};
