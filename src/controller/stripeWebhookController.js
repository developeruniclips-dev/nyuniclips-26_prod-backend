const stripe = require("../config/stripe");
const { confirmPurchase } = require("./purchaseController");

const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const videoId = paymentIntent.metadata.videoId;
    const buyerId = paymentIntent.metadata.buyerId;
    const transactionId = paymentIntent.id;

    await confirmPurchase(Number(videoId), Number(buyerId), transactionId);
  }

  res.json({ received: true });
};

module.exports = { stripeWebhook };
