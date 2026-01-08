import { Router } from "express";
import { paymentService } from "../../services/payment.js";
import { requireAuth, AuthRequest } from "../../middlewares/auth.js";

export const paymentRouter = Router();

// All payment routes require authentication
paymentRouter.use(requireAuth);

// Create payment intent
paymentRouter.post("/create-intent", async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const result = await paymentService.createPaymentIntent(orderId);
    res.json(result);
  } catch (err: any) {
    if (err.message === "Order not found" || err.message === "Order already paid") {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
});

// Confirm payment (webhook or manual)
paymentRouter.post("/confirm", async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { paymentIntentId } = req.body;
    if (!paymentIntentId) {
      return res.status(400).json({ message: "Payment intent ID is required" });
    }

    const result = await paymentService.confirmPayment(paymentIntentId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get payment status
paymentRouter.get("/status/:orderId", async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const payment = await paymentService.getPaymentStatus(req.params.orderId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json({ payment });
  } catch (err) {
    next(err);
  }
});
