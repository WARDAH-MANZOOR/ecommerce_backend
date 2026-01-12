import express from "express";
import { stripeWebhookController } from "../../controllers/webhook/index.js";

const router = express.Router();

// Raw body parser required by Stripe webhook
router.post("/stripe", express.raw({ type: "application/json" }), stripeWebhookController);

export default router;
