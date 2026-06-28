const Booking = require('../models/Booking');
const { sendStatusUpdateEmail } = require('../services/email.service');
const { sendSMS } = require('../services/sms.service');
const { createNotification } = require('../services/notification.service');

// Helper to convert internal status name to readable text
const formatStatusText = (status) => {
  switch (status) {
    case 'picked_up': return 'Picked Up';
    case 'in_transit': return 'In Transit';
    case 'out_for_delivery': return 'Out For Delivery';
    case 'delivered': return 'Delivered';
    case 'failed': return 'Delivery Attempt Failed';
    case 'cancelled': return 'Cancelled';
    case 'confirmed': return 'Confirmed';
    default: return status;
  }
};

// @desc    Get all bookings assigned to the logged-in agent
// @route   GET /api/agent/assigned
// @access  Private (Agent)
const getAssignedBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ assignedAgent: req.user._id })
      .sort({ updatedAt: -1 })
      .populate('sender', 'name email phone');

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Scan QR code and confirm parcel pickup
// @route   POST /api/agent/scan-pickup
// @access  Private (Agent)
const scanPickup = async (req, res, next) => {
  try {
    const { trackingId, lat, lng, locationName } = req.body;

    if (!trackingId) {
      return res.status(400).json({ success: false, message: 'Tracking ID is required' });
    }

    const booking = await Booking.findOne({ trackingId }).populate('sender', 'name email phone');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Parcel booking not found' });
    }

    // Verify if agent is assigned to this booking (or allow admins to pickup too)
    if (req.user.role !== 'admin' && booking.assignedAgent && booking.assignedAgent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not the assigned agent for this parcel' });
    }

    // Can only pickup if status is 'confirmed' (or 'pending')
    if (booking.status !== 'confirmed' && booking.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Parcel cannot be picked up. Current status is '${booking.status}'` 
      });
    }

    // Update status to picked_up
    booking.status = 'picked_up';
    if (!booking.assignedAgent) {
      booking.assignedAgent = req.user._id; // auto-assign if not assigned
    }

    const coords = (lat && lng) ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined;
    const resolvedLoc = locationName || 'Agent Pickup Hub';

    booking.statusLogs.push({
      stage: 'picked_up',
      message: 'Parcel picked up by agent.',
      location: resolvedLoc,
      coordinates: coords,
      updatedBy: req.user._id
    });

    await booking.save();

    // Notify Customer
    const customer = booking.sender;
    const msg = `Your parcel ${booking.trackingId} has been picked up by Agent ${req.user.name}.`;
    await createNotification({
      userId: customer._id,
      title: 'Parcel Picked Up',
      message: msg,
      type: 'status_update',
      bookingId: booking._id
    });

    // Send email and SMS
    await sendStatusUpdateEmail(customer.email, booking, 'Picked Up', msg);
    if (customer.phone) {
      await sendSMS(customer.phone, msg);
    }

    res.status(200).json({
      success: true,
      message: 'Parcel pickup confirmed!',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery status and add custom status log
// @route   PUT /api/agent/update-status/:bookingId
// @access  Private (Agent)
const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { status, message, lat, lng, locationName } = req.body;

    const allowedStatuses = ['picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update option' });
    }

    const booking = await Booking.findById(bookingId).populate('sender', 'name email phone');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Parcel booking not found' });
    }

    // Verify agent is assigned
    if (req.user.role !== 'admin' && booking.assignedAgent && booking.assignedAgent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this parcel' });
    }

    // Update fields
    booking.status = status;
    
    if (status === 'delivered') {
      booking.deliveredAt = new Date();
      booking.payment.status = 'paid';
      if (!booking.payment.paidAt) booking.payment.paidAt = new Date();
      if (booking.payment.method === 'pod' && !booking.payment.transactionId) {
        booking.payment.transactionId = 'UPI-POD-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      }
    }

    const coords = (lat && lng) ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined;
    const resolvedLoc = locationName || `Hub: ${status}`;
    const statusMsg = message || `Parcel status updated to ${formatStatusText(status)}.`;

    booking.statusLogs.push({
      stage: status,
      message: statusMsg,
      location: resolvedLoc,
      coordinates: coords,
      updatedBy: req.user._id
    });

    await booking.save();

    // Notify customer
    const customer = booking.sender;
    await createNotification({
      userId: customer._id,
      title: `Status: ${formatStatusText(status)}`,
      message: `Your shipment ${booking.trackingId} status: ${statusMsg}`,
      type: 'status_update',
      bookingId: booking._id
    });

    // Send email/SMS
    await sendStatusUpdateEmail(customer.email, booking, formatStatusText(status), statusMsg);
    if (customer.phone) {
      await sendSMS(customer.phone, `Shipment update: ${booking.trackingId} is ${formatStatusText(status)}. ${statusMsg}`);
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully!',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssignedBookings,
  scanPickup,
  updateDeliveryStatus
};
