import API from './api';

export const loginUser = async (credentials) => {
  return API.post('/auth/login', credentials);
};

export const signupUser = async (userData) => {
  return API.post('/auth/signup', userData);
};

export const verifyOTP = async (otpData) => {
  return API.post('/auth/verify-otp', otpData);
};

export const resendOTP = async (emailData) => {
  return API.post('/auth/resend-otp', emailData);
};

export const forgotPassword = async (emailData) => {
  return API.post('/auth/forgot-password', emailData);
};

export const resetPassword = async (resetData) => {
  return API.post('/auth/reset-password', resetData);
};

export const getMe = async () => {
  return API.get('/auth/me');
};
