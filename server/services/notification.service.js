const Notification = require('../models/Notification');
const { getIO } = require('../socket/socketHandler');

const createNotification = async ({ userId, title, message, type, bookingId }) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      bookingId
    });

    const io = getIO();
    if (io) {
      io.to(`user_${userId}`).emit('new_notification', notification);
      console.log(`Notification emitted to room user_${userId}`);
    } else {
      console.log(`Socket.io not initialized, stored notification in database for User ${userId}`);
    }

    return notification;
  } catch (error) {
    console.error(`Error creating/emitting notification: ${error.message}`);
  }
};

module.exports = { createNotification };
