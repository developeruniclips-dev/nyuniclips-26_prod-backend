const { pool } = require("../config/db");

// Subject bundle price in EUR
const SUBJECT_BUNDLE_PRICE = 6.00;

const PurchaseModel = {
  // Legacy video-based purchases (keep for backwards compatibility)
  create: (buyerUserId, videoId, amount, currency = "EUR") =>
    pool.query("INSERT INTO purchases (buyer_user_id, video_id, amount, currency) VALUES (?, ?, ?, ?)", [buyerUserId, videoId, amount, currency]),

  findByUserAndVideo: (buyerUserId, videoId) =>
    pool.query("SELECT * FROM purchases WHERE buyer_user_id = ? AND video_id = ?", [buyerUserId, videoId]),

  findByUser: (buyerUserId) =>
    pool.query("SELECT p.*, v.title, v.video_url FROM purchases p JOIN videos v ON p.video_id = v.id WHERE p.buyer_user_id = ?", [buyerUserId]),

  savePurchase: (user_id, video_id, amount, transaction_id) => {
    return pool.query(
      "INSERT INTO purchases (user_id, video_id, amount, transaction_id) VALUES (?, ?, ?, ?)",
      [user_id, video_id, amount, transaction_id]
    );
  },

  hasPurchased: (user_id, video_id) => {
    return pool.query(
      "SELECT * FROM purchases WHERE buyer_user_id = ? AND video_id = ?",
      [user_id, video_id]
    );
  },

  // NEW: Subject bundle purchases (€6 per subject)
  purchaseSubjectBundle: (buyerUserId, subjectId, scholarId, amount = SUBJECT_BUNDLE_PRICE, transactionId = null) => {
    return pool.query(
      `INSERT INTO subject_purchases (buyer_user_id, subject_id, scholar_id, amount, currency, transaction_id) 
       VALUES (?, ?, ?, ?, 'EUR', ?)`,
      [buyerUserId, subjectId, scholarId, amount, transactionId]
    );
  },

  hasPurchasedSubject: (buyerUserId, subjectId, scholarId) => {
    return pool.query(
      `SELECT * FROM subject_purchases WHERE buyer_user_id = ? AND subject_id = ? AND scholar_id = ?`,
      [buyerUserId, subjectId, scholarId]
    );
  },

  // Get all subject bundles purchased by user
  getUserSubjectPurchases: (buyerUserId) => {
    return pool.query(
      `SELECT sp.*, s.name as subject_name, u.fname as scholar_fname, u.lname as scholar_lname
       FROM subject_purchases sp
       JOIN subjects s ON sp.subject_id = s.id
       JOIN users u ON sp.scholar_id = u.id
       WHERE sp.buyer_user_id = ?
       ORDER BY sp.created_at DESC`,
      [buyerUserId]
    );
  },

  // Get all sales for a scholar (for earnings)
  getScholarSubjectSales: (scholarId) => {
    return pool.query(
      `SELECT sp.*, s.name as subject_name, u.fname as buyer_fname, u.lname as buyer_lname
       FROM subject_purchases sp
       JOIN subjects s ON sp.subject_id = s.id
       JOIN users u ON sp.buyer_user_id = u.id
       WHERE sp.scholar_id = ?
       ORDER BY sp.created_at DESC`,
      [scholarId]
    );
  }
};

module.exports = { PurchaseModel, SUBJECT_BUNDLE_PRICE };
