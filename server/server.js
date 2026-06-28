const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
require('dotenv').config();

// Configs & Database
const connectDB = require('./config/db');
const socketHandler = require('./socket/socketHandler');
require('./config/passport'); // initializes Google passport strategy

// Initialize Express, HTTP Server, and Socket.io
const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Connect to Database
// Only connect if not in testing mode (Jest will handle its own connection in tests)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Security & Core Middleware
app.use(helmet({
  contentSecurityPolicy: false // disable CSP to ease local map embeds / third-party asset loading
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Setup Socket.io events
socketHandler.init(io);

// Routes mounting
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/booking', require('./routes/booking.routes'));
app.use('/api/agent', require('./routes/agent.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/payment', require('./routes/payment.routes'));

// API Heartbeat / Health Check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TrackShip API Service Heartbeat',
    timestamp: new Date()
  });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  });
});

// Global Error Handler
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

// Listen
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`TrackShip Server running on port ${PORT}`);
  });
}

// Export for unit tests
module.exports = server;
