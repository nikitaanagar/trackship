const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { createOrder, verifyPayment } = require('../controllers/payment.controller');

// Secure all payment routes
router.use(protect);

router.post('/order', createOrder);
router.post('/verify', verifyPayment);

module.exports = router;
