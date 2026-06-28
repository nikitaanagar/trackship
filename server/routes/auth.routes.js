const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth.middleware');
const {
  signup,
  login,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  getMe
} = require('../controllers/auth.controller');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'trackship_super_secret_jwt_key_123!', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Rate limiter for authentication routes
const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.'
  }
});

// Standard auth routes
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);

// Google OAuth routes
const hasGoogleCreds = process.env.GOOGLE_CLIENT_ID && 
                       !process.env.GOOGLE_CLIENT_ID.startsWith('mock') && 
                       process.env.GOOGLE_CLIENT_SECRET && 
                       !process.env.GOOGLE_CLIENT_SECRET.startsWith('mock');

if (hasGoogleCreds) {
  router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    async (req, res) => {
      // Successful authentication, redirect to frontend with token
      const token = generateToken(req.user._id);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth-success?token=${token}`);
    }
  );
} else {
  // Mock Google Login when credentials are not configured
  router.get('/google', async (req, res) => {
    console.log('[Google Auth Mock] Mocking Google Login redirect.');
    
    // Find or create a mock Google user
    let user = await User.findOne({ email: 'google.mock@trackship.com' });
    if (!user) {
      user = await User.create({
        name: 'Google Mock User',
        email: 'google.mock@trackship.com',
        googleId: 'mock-google-id-12345',
        avatar: 'https://ui-avatars.com/api/?name=Google+Mock&background=2563EB&color=fff&size=128',
        isVerified: true,
        role: 'customer'
      });
    }
    
    const token = generateToken(user._id);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth-success?token=${token}`);
  });
}

module.exports = router;
