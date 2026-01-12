const { body, validationResult } = require('express-validator');

// Profile validation rules
const validateProfile = [
  body('fname')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters'),
  
  body('lname')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  body('favoriteSubject')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Favorite subject cannot exceed 100 characters'),
  
  body('favoriteFood')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Favorite food cannot exceed 100 characters'),
  
  body('hobbies')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Hobbies cannot exceed 300 characters'),
  
  body('iban')
    .optional()
    .trim()
    .matches(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/)
    .withMessage('Invalid IBAN format')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  next();
};

module.exports = {
  validateProfile,
  handleValidationErrors
};
