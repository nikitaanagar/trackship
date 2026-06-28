const Booking = require('../models/Booking');
const { generateQRCode } = require('../services/qr.service');
const { uploadToCloudinary } = require('../config/cloudinary');
const { sendBookingConfirmedEmail } = require('../services/email.service');
const { createNotification } = require('../services/notification.service');

// Helper to generate custom Tracking ID (TRK-YYYYMMDD-XXXXXX)
const generateTrackingId = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TRK-${date}-${randomChars}`;
};

// Helper to calculate price: base ₹50 + ₹10/kg + ₹5/100km flat rate
const calculatePriceAndDistance = (weight, pickupPincode, recipientPincode) => {
  const p1 = parseInt(pickupPincode) || 110001;
  const p2 = parseInt(recipientPincode) || 400001;
  const diff = Math.abs(p1 - p2);
  // Pseudo-distance calculation (range: 50 to 1500 km)
  const distance = Math.max(50, Math.min(1500, (diff % 1450) + 50));
  
  const basePrice = 50;
  const weightPrice = 10 * weight;
  const distancePrice = 5 * (distance / 100);
  const totalAmount = Math.round(basePrice + weightPrice + distancePrice);
  
  return { amount: totalAmount, distance };
};

// @desc    Create a new parcel booking
// @route   POST /api/booking/create
// @access  Private (Customer)
const createBooking = async (req, res, next) => {
  try {
    const {
      recipientName, recipientPhone, recipientEmail,
      recipientStreet, recipientCity, recipientState, recipientPincode,
      description, weight, length, width, height, category,
      pickupStreet, pickupCity, pickupState, pickupPincode,
      paymentMethod
    } = req.body;

    // Validation checks
    if (!recipientName || !recipientPhone || !recipientEmail ||
        !recipientStreet || !recipientCity || !recipientState || !recipientPincode ||
        !description || !weight || !category ||
        !pickupStreet || !pickupCity || !pickupState || !pickupPincode ||
        !paymentMethod) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    const numericWeight = parseFloat(weight);
    if (isNaN(numericWeight) || numericWeight <= 0) {
      return res.status(400).json({ success: false, message: 'Weight must be a positive number' });
    }

    const trackingId = generateTrackingId();
    
    // Upload image to Cloudinary if a file was uploaded
    let imageUrl = 'https://picsum.photos/seed/parcel/400/300';
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'trackship_parcels');
      imageUrl = uploadResult.secure_url;
    }

    const isOnline = paymentMethod === 'online';

    // Calculate Price
    const { amount } = calculatePriceAndDistance(numericWeight, pickupPincode, recipientPincode);

    // Set Estimated Delivery (3-5 days from now)
    const estimatedDelivery = new Date(Date.now() + (3 + Math.floor(Math.random() * 3)) * 24 * 60 * 60 * 1000);

    // Generate QR Code URL immediately for POD
    let qrCodeUrl = null;
    if (!isOnline) {
      qrCodeUrl = await generateQRCode(trackingId);
    }

    const booking = await Booking.create({
      trackingId,
      sender: req.user._id,
      recipient: {
        name: recipientName,
        phone: recipientPhone,
        email: recipientEmail,
        address: {
          street: recipientStreet,
          city: recipientCity,
          state: recipientState,
          pincode: recipientPincode
        }
      },
      parcel: {
        description,
        weight: numericWeight,
        dimensions: {
          length: parseFloat(length) || 0,
          width: parseFloat(width) || 0,
          height: parseFloat(height) || 0
        },
        category,
        image: imageUrl
      },
      pickupAddress: {
        street: pickupStreet,
        city: pickupCity,
        state: pickupState,
        pincode: pickupPincode
      },
      status: isOnline ? 'pending' : 'confirmed',
      statusLogs: [
        {
          stage: isOnline ? 'pending' : 'confirmed',
          message: isOnline 
            ? 'Booking created. Awaiting online payment completion.' 
            : 'Booking confirmed. Scheduled for pickup, payment pending delivery.',
          location: `${pickupCity}, ${pickupState}`,
          updatedBy: req.user._id
        }
      ],
      payment: {
        amount,
        method: paymentMethod,
        status: 'pending',
        transactionId: null,
        paidAt: null
      },
      qrCode: qrCodeUrl,
      estimatedDelivery
    });

    // Notify customer and email only for Pay on Delivery immediately
    if (!isOnline) {
      await createNotification({
        userId: req.user._id,
        title: 'Booking Confirmed',
        message: `Your booking for tracking ID ${trackingId} is confirmed. Amount: ₹${amount} (Pay on Delivery).`,
        type: 'booking',
        bookingId: booking._id
      });

      await sendBookingConfirmedEmail(req.user.email, booking);
    }

    res.status(201).json({
      success: true,
      message: isOnline 
        ? 'Booking initiated. Please complete payment.' 
        : 'Parcel booked successfully (Pay on Delivery)!',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings created by logged in customer
// @route   GET /api/booking/my-bookings
// @access  Private (Customer)
const getMyBookings = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    let query = { sender: req.user._id };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { trackingId: { $regex: search, $options: 'i' } },
        { 'recipient.name': { $regex: search, $options: 'i' } }
      ];
    }

    const skipIndex = (parseInt(page) - 1) * parseInt(limit);
    
    const count = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(parseInt(limit))
      .populate('assignedAgent', 'name phone avatar');

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Track a parcel by Tracking ID
// @route   GET /api/booking/track/:trackingId
// @access  Public (Or Private)
const trackParcel = async (req, res, next) => {
  try {
    const { trackingId } = req.params;

    const booking = await Booking.findOne({ trackingId })
      .populate('assignedAgent', 'name phone avatar');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Invalid Tracking ID. Shipment not found.' });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking details by ID
// @route   GET /api/booking/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('sender', 'name email phone')
      .populate('assignedAgent', 'name phone avatar');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Authorization: User must be either the sender, the assigned agent, or an admin
    const isAdmin = req.user.role === 'admin';
    const isSender = booking.sender._id.toString() === req.user._id.toString();
    const isAgent = booking.assignedAgent && booking.assignedAgent._id.toString() === req.user._id.toString();

    if (!isAdmin && !isSender && !isAgent) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking
// @route   DELETE /api/booking/:id/cancel
// @access  Private (Customer/Admin)
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && booking.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    // Can only cancel pending or confirmed
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot cancel booking. Current status is '${booking.status}'` 
      });
    }

    booking.status = 'cancelled';
    booking.statusLogs.push({
      stage: 'cancelled',
      message: 'Booking cancelled by user.',
      location: booking.statusLogs[booking.statusLogs.length - 1]?.location || 'Customer Location',
      updatedBy: req.user._id
    });
    
    await booking.save();

    // Create Notification
    await createNotification({
      userId: booking.sender,
      title: 'Booking Cancelled',
      message: `Your booking ${booking.trackingId} has been cancelled successfully.`,
      type: 'booking',
      bookingId: booking._id
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  trackParcel,
  getBookingById,
  cancelBooking
};
