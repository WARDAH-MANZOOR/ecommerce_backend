// src/controllers/webhook/index.ts
import Stripe from "stripe";
import { Request, Response } from "express";
import { paymentWebhookService } from "../../services/webhook/index.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});


// export const stripeWebhookController = (req: Request, res: Response) => {
//     console.log("==== WEBHOOK HIT ====");
//     console.log("Body is Buffer:", Buffer.isBuffer(req.body));
//     console.log("Body length:", req.body?.length);
  
//     const sig = req.headers["stripe-signature"];
  
//     try {
//       const event = stripe.webhooks.constructEvent(
//         req.body,
//         sig as string,
//         process.env.STRIPE_WEBHOOK_SECRET!
//       );
  
//       console.log("✅ VERIFIED EVENT:", event.type);
  
//       return res.json({ received: true });
//     } catch (err) {
//       console.error("❌ SIGNATURE FAIL:", err instanceof Error ? err.message : String(err));
//       return res.status(400).send("Webhook Error");
//     }
//   };
export const stripeWebhookController = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"]!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log("✅ Webhook verified:", event.type);
  } catch (err: any) {
    console.error("❌ Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await paymentWebhookService.handleCheckoutSessionCompleted(session);
  }

  res.json({ received: true });
};
  
export default stripeWebhookController;