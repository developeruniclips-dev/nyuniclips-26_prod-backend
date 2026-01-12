const rateLimit = require('express-rate-limit');

// Rate limiter for profile updates
const profileUpdateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each user to 5 requests per windowMs
  message: 'Too many profile update attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit per user ID
    return req.user?.id || req.ip;
  }
});

// Rate limiter for profile image uploads
const imageUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each user to 10 image uploads per hour
  message: 'Too many image uploads, please try again later',
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  }
});

module.exports = {
  profileUpdateLimiter,
  imageUploadLimiter
};
