const request = require('supertest');
const mongoose = require('mongoose');
const server = require('../server');
const Booking = require('../models/Booking');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Mock external services to prevent network timeouts during testing
jest.mock('../services/email.service.js', () => ({
  sendBookingConfirmedEmail: jest.fn().mockResolvedValue({ messageId: 'mock-email-id' }),
  sendStatusUpdateEmail: jest.fn().mockResolvedValue({ messageId: 'mock-email-id' })
}));
jest.mock('../services/sms.service.js', () => ({
  sendSMS: jest.fn().mockResolvedValue(true)
}));
jest.mock('../services/qr.service.js', () => ({
  generateQRCode: jest.fn().mockResolvedValue('https://mock-qr-url.com/qr.png')
}));

const TEST_MONGO_URI = 'mongodb://127.0.0.1:27017/trackship_test';
let token;
let testUser;

beforeAll(async () => {
  // Connect Mongoose to testing DB if not connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_MONGO_URI);
  }
  
  // Clear any existing test users / bookings
  await User.deleteMany({});
  await Booking.deleteMany({});

  // Create a verified test customer
  testUser = await User.create({
    name: 'Test Customer',
    email: 'testcustomer@trackship.com',
    password: 'password123',
    phone: '9876543210',
    role: 'customer',
    isVerified: true
  });

  // Generate JWT Token
  token = jwt.sign(
    { id: testUser._id },
    process.env.JWT_SECRET || 'trackship_super_secret_jwt_key_123!',
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  // Clean up
  await User.deleteMany({});
  await Booking.deleteMany({});
  // Disconnect DB and close server
  await mongoose.connection.close();
  await new Promise((resolve) => server.close(resolve));
});

describe('Booking API Endpoints', () => {
  let createdTrackingId;

  // Test POST /api/booking/create with valid data
  it('should create booking and return 210/201 + trackingId when input is valid', async () => {
    const bookingData = {
      recipientName: 'Alice Recipient',
      recipientPhone: '9998887776',
      recipientEmail: 'alice@gmail.com',
      recipientStreet: '456 Delivery Ave',
      recipientCity: 'Mumbai',
      recipientState: 'Maharashtra',
      recipientPincode: '400001',
      description: 'Books and stationery',
      weight: 2.5,
      length: 30,
      width: 20,
      height: 10,
      category: 'documents',
      pickupStreet: '123 Sender St',
      pickupCity: 'Delhi',
      pickupState: 'Delhi',
      pickupPincode: '110001',
      paymentMethod: 'pod'
    };

    const res = await request(server)
      .post('/api/booking/create')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('trackingId');
    expect(res.body.data.trackingId).toMatch(/^TRK-/);
    createdTrackingId = res.body.data.trackingId;
  });

  // Test POST /api/booking/create with missing fields
  it('should return 400 when required fields are missing', async () => {
    const badBookingData = {
      recipientName: 'Alice Recipient',
      // missing phone, email, and address
      description: 'Books',
      weight: 1
    };

    const res = await request(server)
      .post('/api/booking/create')
      .set('Authorization', `Bearer ${token}`)
      .send(badBookingData);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Test GET /api/booking/track/:trackingId with valid ID
  it('should retrieve parcel tracking details for a valid trackingId', async () => {
    const res = await request(server)
      .get(`/api/booking/track/${createdTrackingId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.trackingId).toBe(createdTrackingId);
  });

  // Test GET /api/booking/track/:trackingId with invalid ID
  it('should return 404 when tracking a non-existent trackingId', async () => {
    const res = await request(server)
      .get('/api/booking/track/TRK-NONEXISTENT-99999');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
