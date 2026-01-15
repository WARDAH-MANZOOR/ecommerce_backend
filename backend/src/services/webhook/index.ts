import Stripe from "stripe";
import { prisma } from "../../config/prisma.js";

// export const paymentWebhookService = {
//   async handleCheckoutSessionCompleted(orderId: string) {
//     // Payment & order status update in DB
//     await prisma.payment.update({
//       where: { orderId },
//       data: { status: "PAYMENT_SUCCESS" },
//     });

//     await prisma.order.update({
//       where: { id: orderId },
//       data: { paymentStatus: "PAYMENT_SUCCESS", status: "PAID" },
//     });
//   },
// };
// src/services/webhook/index.ts
export const paymentWebhookService = {
  async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const orderId = session.metadata?.orderId;
    if (!orderId) return;

    // Update payment intent and status
    await prisma.payment.update({
      where: { orderId },
      data: {
        status: "PAYMENT_SUCCESS",
        stripePaymentIntent: typeof session.payment_intent === "string" 
            ? session.payment_intent 
            : session.payment_intent?.id ?? "",
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAYMENT_SUCCESS",
        status: "PAID",
      },
    });
  },
};
