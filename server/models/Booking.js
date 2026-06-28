const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  trackingId: { type: String, required: true, unique: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true }
    }
  },
  parcel: {
    description: { type: String, required: true },
    weight: { type: Number, required: true }, // in kg
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number }
    },
    category: { 
      type: String, 
      enum: ['documents', 'electronics', 'clothing', 'fragile', 'other'], 
      required: true 
    },
    image: { type: String } // Cloudinary URL
  },
  pickupAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'cancelled'],
    default: 'pending'
  },
  statusLogs: [
    {
      stage: { type: String, required: true },
      message: { type: String, required: true },
      location: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  payment: {
    amount: { type: Number, required: true },
    method: { type: String, enum: ['online', 'pod'], required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    transactionId: { type: String },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    paidAt: { type: Date }
  },
  qrCode: { type: String }, // Cloudinary URL of QR image
  estimatedDelivery: { type: Date },
  deliveredAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
