import API from './api';

export const getAssignedBookings = async () => {
  return API.get('/agent/assigned');
};

export const scanPickup = async (pickupData) => {
  return API.post('/agent/scan-pickup', pickupData);
};

export const updateStatus = async (bookingId, statusData) => {
  return API.put(`/agent/update-status/${bookingId}`, statusData);
};
