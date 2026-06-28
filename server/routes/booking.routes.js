const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  createBooking,
  getMyBookings,
  trackParcel,
  getBookingById,
  cancelBooking
} = require('../controllers/booking.controller');

// Setup multer in-memory storage for parcel file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Public Route
router.get('/track/:trackingId', trackParcel);

// Protected routes (require JWT verification)
router.use(protect);

router.post('/create', authorize('customer', 'admin'), upload.single('image'), createBooking);
router.get('/my-bookings', authorize('customer', 'admin'), getMyBookings);
router.get('/:id', getBookingById);
router.delete('/:id/cancel', cancelBooking);

module.exports = router;
