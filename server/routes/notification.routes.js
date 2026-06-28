const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getNotifications,
  markRead,
  markAllRead
} = require('../controllers/notification.controller');

// Enforce login for notifications
router.use(protect);

router.get('/', getNotifications);
router.put('/mark-read/:id', markRead);
router.put('/mark-all-read', markAllRead);

module.exports = router;
