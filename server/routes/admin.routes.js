const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  getDashboardStats,
  getAllBookings,
  assignAgent,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  getReports
} = require('../controllers/admin.controller');

// Enforce admin permission guards
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/assign-agent', assignAgent);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', toggleUserStatus);
router.get('/reports', getReports);

module.exports = router;
