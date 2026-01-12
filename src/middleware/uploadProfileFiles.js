const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directories exist
const taxCardsDir = 'uploads/tax-cards';
const profileImagesDir = 'uploads/profile-images';

if (!fs.existsSync(taxCardsDir)) {
  fs.mkdirSync(taxCardsDir, { recursive: true });
}
if (!fs.existsSync(profileImagesDir)) {
  fs.mkdirSync(profileImagesDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'taxCard') {
      cb(null, taxCardsDir);
    } else if (file.fieldname === 'profileImage') {
      cb(null, profileImagesDir);
    } else {
      cb(new Error('Unexpected field'));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    if (file.fieldname === 'taxCard') {
      cb(null, 'tax-card-' + uniqueSuffix + path.extname(file.originalname));
    } else if (file.fieldname === 'profileImage') {
      cb(null, 'profile-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'taxCard') {
    const allowedTypes = /pdf|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Tax card must be PDF, JPG, JPEG, or PNG'));
    }
  } else if (file.fieldname === 'profileImage') {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Profile image must be JPEG, JPG, PNG, or GIF'));
    }
  } else {
    cb(new Error('Unexpected field'));
  }
};

// Multer configuration - accepts multiple fields
const uploadProfileFiles = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  },
  fileFilter: fileFilter
}).fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'taxCard', maxCount: 1 }
]);

module.exports = { uploadProfileFiles };
