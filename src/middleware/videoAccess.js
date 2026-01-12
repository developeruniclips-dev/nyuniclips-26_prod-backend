const { VideoModel } = require("../models/videos");
const { PurchaseModel } = require("../models/purchases");

const canAccessVideo = async (req, res, next) => {
  try {
    const videoId = Number(req.params.id);
    const userId = req.user?.id;

    const [videoRows] = await VideoModel.findById(videoId);
    if (videoRows.length === 0) return res.status(404).json({ message: "Video not found" });

    const video = videoRows[0];

    // If free or owner -> allow
    if (video.is_free === 1 || video.scholar_user_id === userId) {
      return next();
    }

    // Check purchase
    const [purchaseRows] = await PurchaseModel.findByUserAndVideo(userId, videoId);
    if (purchaseRows.length > 0) return next();

    return res.status(403).json({ message: "You must purchase this video to access it" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { canAccessVideo };
