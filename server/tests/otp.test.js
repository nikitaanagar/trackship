const request = require('supertest');
const mongoose = require('mongoose');
const server = require('../server');
const User = require('../models/User');

const TEST_MONGO_URI = 'mongodb://127.0.0.1:27017/trackship_test';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_MONGO_URI);
  }
});

beforeEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
  await new Promise((resolve) => server.close(resolve));
});

describe('OTP Verification API', () => {
  
  // Test POST /api/auth/verify-otp with correct OTP
  it('should verify user and return JWT when OTP matches and is not expired', async () => {
    const userEmail = 'verifytest@trackship.com';
    const otpCode = '123456';
    
    // Create an unverified user with valid OTP
    await User.create({
      name: 'Verify Test',
      email: userEmail,
      password: 'password123',
      phone: '1234567890',
      role: 'customer',
      isVerified: false,
      otp: otpCode,
      otpExpiry: new Date(Date.now() + 5 * 60 * 1000) // valid for 5 min
    });

    const res = await request(server)
      .post('/api/auth/verify-otp')
      .send({ email: userEmail, otp: otpCode });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.isVerified).toBe(true);
  });

  // Test POST /api/auth/verify-otp with wrong OTP
  it('should return 400 when OTP is incorrect', async () => {
    const userEmail = 'verifytest2@trackship.com';
    
    await User.create({
      name: 'Verify Test 2',
      email: userEmail,
      password: 'password123',
      isVerified: false,
      otp: '111111',
      otpExpiry: new Date(Date.now() + 5 * 60 * 1000)
    });

    const res = await request(server)
      .post('/api/auth/verify-otp')
      .send({ email: userEmail, otp: '222222' }); // wrong OTP

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid');
  });

  // Test POST /api/auth/verify-otp with expired OTP
  it('should return 400 when OTP is expired', async () => {
    const userEmail = 'verifytest3@trackship.com';
    const otpCode = '333333';
    
    await User.create({
      name: 'Verify Test 3',
      email: userEmail,
      password: 'password123',
      isVerified: false,
      otp: otpCode,
      otpExpiry: new Date(Date.now() - 1000) // expired 1s ago
    });

    const res = await request(server)
      .post('/api/auth/verify-otp')
      .send({ email: userEmail, otp: otpCode });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('expired');
  });
});
