import API from './api';

export const createRazorpayOrder = async (bookingId) => {
  return API.post('/payment/order', { bookingId });
};

export const verifyRazorpayPayment = async (paymentDetails) => {
  return API.post('/payment/verify', paymentDetails);
};
