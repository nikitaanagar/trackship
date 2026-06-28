const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  getAssignedBookings,
  scanPickup,
  updateDeliveryStatus
} = require('../controllers/agent.controller');

// Enforce authentication & agent/admin role restriction
router.use(protect);
router.use(authorize('agent', 'admin'));

router.get('/assigned', getAssignedBookings);
router.get('/deliveries', getAssignedBookings); // Alias as per routing sheet
router.post('/scan-pickup', scanPickup);
router.put('/update-status/:bookingId', updateDeliveryStatus);

module.exports = router;
