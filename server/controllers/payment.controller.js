const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const { generateQRCode } = require('../services/qr.service');
const { sendBookingConfirmedEmail } = require('../services/email.service');
const { createNotification } = require('../services/notification.service');

const isMock = !process.env.RAZORPAY_KEY_ID || 
                 process.env.RAZORPAY_KEY_ID.startsWith('mock') || 
                 !process.env.RAZORPAY_KEY_SECRET || 
                 process.env.RAZORPAY_KEY_SECRET.startsWith('mock');

let razorpay = null;
if (!isMock) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// @desc    Create Razorpay Order
// @route   POST /api/payment/order
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const amount = booking.payment.amount; // In Rupees

    if (isMock) {
      const mockOrderId = 'order_mock_' + Math.random().toString(36).substring(2, 12);
      booking.payment.razorpayOrderId = mockOrderId;
      await booking.save();

      return res.status(200).json({
        success: true,
        message: 'Mock Razorpay Order created',
        data: {
          id: mockOrderId,
          amount: amount * 100, // In Paise
          currency: 'INR',
          isMock: true,
          key: 'mock_razorpay_key_id'
        }
      });
    }

    // Call Real Razorpay API
    const options = {
      amount: amount * 100, // In Paise
      currency: 'INR',
      receipt: bookingId.toString()
    };

    const order = await razorpay.orders.create(options);
    
    booking.payment.razorpayOrderId = order.id;
    await booking.save();

    res.status(200).json({
      success: true,
      data: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        isMock: false,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay Signature & Confirm Booking
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res, next) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!bookingId || !razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({ success: false, message: 'Missing payment params' });
    }

    const booking = await Booking.findById(bookingId).populate('sender', 'name email phone');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (isMock) {
      console.log('[Payment Controller] Mock verification succeeded');
    } else {
      // Verify Real Signature
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
      const generatedSignature = hmac.digest('hex');

      if (generatedSignature !== razorpaySignature) {
        booking.payment.status = 'failed';
        await booking.save();
        return res.status(400).json({ success: false, message: 'Invalid payment signature verification failed' });
      }
    }

    // Generate QR Code URL (since booking is confirmed)
    const qrCodeUrl = await generateQRCode(booking.trackingId);

    // Update booking status to confirmed & paid
    booking.status = 'confirmed';
    booking.payment.status = 'paid';
    booking.payment.transactionId = razorpayPaymentId;
    booking.payment.razorpayPaymentId = razorpayPaymentId;
    booking.payment.paidAt = new Date();
    booking.qrCode = qrCodeUrl;

    // Add status logs
    booking.statusLogs.push({
      stage: 'confirmed',
      message: 'Payment completed successfully. Booking scheduled for pickup.',
      location: booking.statusLogs[0]?.location || 'Main Dispatch Center',
      updatedBy: req.user._id
    });

    await booking.save();

    // Notify Customer
    await createNotification({
      userId: booking.sender._id,
      title: 'Payment Completed',
      message: `Your payment of ₹${booking.payment.amount} for Tracking ID ${booking.trackingId} was successful.`,
      type: 'payment',
      bookingId: booking._id
    });

    // Send Booking Confirmation Email
    await sendBookingConfirmedEmail(booking.sender.email, booking);

    res.status(200).json({
      success: true,
      message: 'Payment verified and booking confirmed successfully!',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  verifyPayment
};
