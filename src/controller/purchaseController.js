const { VideoModel } = require("../models/videos");
const { PurchaseModel } = require("../models/purchases");
const { SubjectModel } = require("../models/subject");
const stripe = require("../config/stripe");

// Default bundle price if not set
const DEFAULT_BUNDLE_PRICE = 6.00;

// NEW: Create payment intent for subject bundle (dynamic price)
const createSubjectPaymentIntent = async (req, res) => {
  try {
    const { subjectId, scholarId } = req.body;
    const buyerId = req.user.id;

    if (!subjectId || !scholarId) {
      return res.status(400).json({ message: "Subject ID and Scholar ID are required" });
    }

    // Check if already purchased
    const [existing] = await PurchaseModel.hasPurchasedSubject(buyerId, subjectId, scholarId);
    if (existing.length > 0) {
      return res.status(400).json({ message: "You have already purchased this course bundle" });
    }

    // Get the bundle price from the subject
    const [subjectRows] = await SubjectModel.findByIdWithPrice(subjectId);
    const bundlePrice = subjectRows.length > 0 && subjectRows[0].bundle_price 
      ? parseFloat(subjectRows[0].bundle_price) 
      : DEFAULT_BUNDLE_PRICE;

    // Create Stripe PaymentIntent with dynamic price
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(bundlePrice * 100), // Convert to cents
      currency: "eur",
      metadata: {
        buyerId: buyerId.toString(),
        subjectId: subjectId.toString(),
        scholarId: scholarId.toString(),
        type: "subject_bundle",
        bundlePrice: bundlePrice.toString()
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      amount: bundlePrice
    });
  } catch (err) {
    console.error("Error creating subject payment intent:", err);
    res.status(500).json({ message: "Failed to create payment", error: err.message });
  }
};

// NEW: Confirm subject bundle purchase
const confirmSubjectPurchase = async (req, res) => {
  try {
    const { subjectId, scholarId, transactionId, amount } = req.body;
    const buyerId = req.user.id;

    // Check if already purchased
    const [existing] = await PurchaseModel.hasPurchasedSubject(buyerId, subjectId, scholarId);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Already purchased" });
    }

    // Get the bundle price from the subject (or use provided amount)
    let bundlePrice = amount;
    if (!bundlePrice) {
      const [subjectRows] = await SubjectModel.findByIdWithPrice(subjectId);
      bundlePrice = subjectRows.length > 0 && subjectRows[0].bundle_price 
        ? parseFloat(subjectRows[0].bundle_price) 
        : DEFAULT_BUNDLE_PRICE;
    }

    // Save the purchase
    await PurchaseModel.purchaseSubjectBundle(buyerId, subjectId, scholarId, bundlePrice, transactionId);

    res.status(200).json({ 
      message: "Purchase successful! You now have access to all videos in this course.",
      success: true
    });
  } catch (err) {
    console.error("Error confirming subject purchase:", err);
    res.status(500).json({ message: "Failed to confirm purchase", error: err.message });
  }
};

// NEW: Check if user has purchased a subject bundle
const checkSubjectPurchase = async (req, res) => {
  try {
    const { subjectId, scholarId } = req.query;
    const buyerId = req.user.id;

    if (!subjectId || !scholarId) {
      return res.status(400).json({ message: "Subject ID and Scholar ID are required" });
    }

    const [purchases] = await PurchaseModel.hasPurchasedSubject(buyerId, subjectId, scholarId);
    
    res.status(200).json({
      hasPurchased: purchases.length > 0,
      purchase: purchases[0] || null
    });
  } catch (err) {
    console.error("Error checking subject purchase:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// NEW: Get all subject purchases for current user
const getMySubjectPurchases = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const [purchases] = await PurchaseModel.getUserSubjectPurchases(buyerId);

    res.status(200).json({
      message: "Subject purchases fetched successfully",
      purchases
    });
  } catch (err) {
    console.error("Error fetching subject purchases:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Legacy: Purchase individual video (keeping for backwards compatibility)
const purchaseVideo = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { videoId } = req.body;

    // Check if video exists
    const [videoRows] = await VideoModel.findById(videoId);
    if (videoRows.length === 0) return res.status(404).json({ message: "Video not found" });

    const video = videoRows[0];

    // Free video — no purchase needed
    if (video.is_free === 1 || video.price === 0) {
      return res.status(400).json({ message: "This video is free" });
    }

    // Prevent buying own video
    if (video.scholar_user_id === buyerId) {
      return res.status(400).json({ message: "You already own this video as the creator" });
    }

    // Check if buyer already purchased this video
    const [existingPurchase] = await PurchaseModel.hasPurchased(buyerId, videoId);
    if (existingPurchase.length > 0) {
      return res.status(400).json({ message: "You have already purchased this video" });
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(video.price * 100), // Stripe expects cents
      currency: "eur",
      metadata: {
        buyerId: buyerId.toString(),
        videoId: videoId.toString(),
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during purchase", err });
  }
};

const getUserPurchases = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const [purchases] = await PurchaseModel.findByUser(buyerId);

    if (!purchases || purchases.length === 0) {
      return res.status(200).json({
        message: "You have not purchased any videos yet",
        purchases: []
      });
    }

    return res.json({
      message: "Purchases fetched successfully",
      purchases
    });

  } catch (err) {
    console.error("Error fetching user purchases:", err);
    return res.status(500).json({
      message: "Server error fetching purchases",
      error: err
    });
  }
};

const createPaymentIntent = async (req, res) => {
  try {
    const { videoId } = req.body;
    const buyerId = req.user.id;

    // Fetch video price from DB
    const [videoRows] = await VideoModel.findById(videoId);
    if (!videoRows.length) return res.status(404).json({ message: "Video not found" });

    const video = videoRows[0];

    if (video.is_free || video.price === 0)
      return res.status(400).json({ message: "This video is free" });

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: video.price * 100, // cents
      currency: "eur",
      metadata: {
        videoId: video.id,
        buyerId,
      },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Stripe PaymentIntent creation failed", err });
  }
};

// Confirm purchase after successful payment
const confirmPurchase = async (videoId, buyerId, transactionId) => {
  await PurchaseModel.savePurchase(buyerId, videoId, 0, transactionId);
};

// Admin: Get all transactions with details
const getAllTransactions = async (req, res) => {
  try {
    const { pool } = require("../config/db");
    
    const [transactions] = await pool.query(`
      SELECT 
        t.id as transaction_id,
        t.provider,
        t.provider_transaction_id,
        t.status,
        t.created_at as transaction_date,
        p.id as purchase_id,
        p.amount,
        p.currency,
        p.created_at as purchase_date,
        u.id as buyer_id,
        u.fname as buyer_fname,
        u.lname as buyer_lname,
        u.email as buyer_email,
        v.id as video_id,
        v.title as video_title,
        v.scholar_user_id,
        s.fname as scholar_fname,
        s.lname as scholar_lname
      FROM transactions t
      LEFT JOIN purchases p ON t.purchase_id = p.id
      LEFT JOIN users u ON p.buyer_user_id = u.id
      LEFT JOIN videos v ON p.video_id = v.id
      LEFT JOIN users s ON v.scholar_user_id = s.id
      ORDER BY t.created_at DESC
    `);

    res.json({
      message: "Transactions fetched successfully",
      transactions
    });

  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ message: "Server error fetching transactions", error: err });
  }
};

module.exports = {
  purchaseVideo,
  getUserPurchases,
  createPaymentIntent,
  confirmPurchase,
  getAllTransactions,
  // Subject bundle functions
  createSubjectPaymentIntent,
  confirmSubjectPurchase,
  checkSubjectPurchase,
  getMySubjectPurchases
};
