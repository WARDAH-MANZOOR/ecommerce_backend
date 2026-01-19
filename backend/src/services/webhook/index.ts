import Stripe from "stripe";
import { prisma } from "../../config/prisma.js";
import { generateInvoicePdf } from "../../utils/invoice.js";

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

    const order = await prisma.order.findUnique({
          where: { id: orderId },
          select: { userId: true },
        });

        if (!order) return;
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
    const invoiceNumber = `INV-${Date.now()}`;

    const pdfUrl = await generateInvoicePdf({
      orderId,
      invoiceNumber,
    });

    // Save invoice
    await prisma.invoice.create({
      data: {
        orderId,
        invoiceNumber,
        pdfUrl,
      },
});
    // Clear cart(After successful payment, clear user's cart)
     await prisma.cartItem.deleteMany({
      where: {
        cart: { userId: order.userId }
      }
    });

    },
};
