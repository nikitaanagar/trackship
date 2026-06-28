let ioInstance = null;

const init = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join room for user-specific notifications
    socket.on('join_user_room', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined notification room user_${userId}`);
    });

    // Join room for live tracking of a specific parcel
    socket.on('join_tracking_room', (bookingId) => {
      socket.join(`tracking_${bookingId}`);
      console.log(`Socket joined tracking room for booking ${bookingId}`);
    });

    // Agent broadcasts location updates
    socket.on('location_update', (data) => {
      const { bookingId, lat, lng } = data;
      console.log(`Location update for booking ${bookingId}: Lat ${lat}, Lng ${lng}`);
      // Broadcast to everyone in tracking room except the sender or to everyone in room
      io.to(`tracking_${bookingId}`).emit('location_update', { bookingId, lat, lng });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

const getIO = () => {
  return ioInstance;
};

module.exports = {
  init,
  getIO
};
