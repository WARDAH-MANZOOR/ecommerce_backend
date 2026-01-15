// src/controllers/webhook/index.ts
import Stripe from "stripe";
import { Request, Response } from "express";
import { paymentWebhookService } from "../../services/webhook/index.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

// export const stripeWebhookController = async (req: Request, res: Response) => {
//     console.log("==== WEBHOOK HIT ====");
//     console.log("Headers:", req.headers);
//     console.log("Stripe-Signature:", req.headers["stripe-signature"]);
    
//     const sig = req.headers["stripe-signature"]!;
//     let event: Stripe.Event;
  
//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
//       console.log("Webhook received! Event type:", event.type); // <-- Logging
//       console.log("Full event data:", JSON.stringify(event.data.object, null, 2)); // <-- Detailed session data
//     } catch (err: any) {
//       console.error("Webhook signature verification failed:", err.message); // <-- Error logging
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }
  
//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object as Stripe.Checkout.Session;
//       const orderId = session.metadata?.orderId;
  
//       if (orderId) {
//         try {
//           await paymentWebhookService.handleCheckoutSessionCompleted(orderId);
//           console.log(`Order ${orderId} marked as PAID`);
//         } catch (err) {
//           console.error("Error updating order/payment:", err);
//           return res.status(500).send("Internal Server Error");
//         }
//       }
//     }
  
//     res.json({ received: true });
//   };
export const stripeWebhookController = (req: Request, res: Response) => {
    console.log("==== WEBHOOK HIT ====");
    console.log("Body is Buffer:", Buffer.isBuffer(req.body));
    console.log("Body length:", req.body?.length);
  
    const sig = req.headers["stripe-signature"];
  
    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
  
      console.log("✅ VERIFIED EVENT:", event.type);
  
      return res.json({ received: true });
    } catch (err) {
      console.error("❌ SIGNATURE FAIL:", err instanceof Error ? err.message : String(err));
      return res.status(400).send("Webhook Error");
    }
  };
  
  
export default stripeWebhookController;