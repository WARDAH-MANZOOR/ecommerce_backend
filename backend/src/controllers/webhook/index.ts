import { Request, Response } from "express";
import Stripe from "stripe";
import { paymentWebhookService } from "../../services/webhook/index.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const stripeWebhookController = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"]!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      try {
        await paymentWebhookService.handleCheckoutSessionCompleted(orderId);
        console.log(`Order ${orderId} marked as PAID`);
      } catch (err) {
        console.error("Error updating order/payment:", err);
        return res.status(500).send("Internal Server Error");
      }
    }
  }

  res.json({ received: true });
};
export default stripeWebhookController;