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

  // Fetch the order along with user info and order items
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true, // for customer info
      items: { include: { product: true } }, // for order items
    },
  });

  if (!order) return;

  // Update payment intent and status
  await prisma.payment.update({
    where: { orderId },
    data: {
      status: "PAYMENT_SUCCESS",
      stripePaymentIntent:
        typeof session.payment_intent === "string"
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

  // Generate invoice number
  const invoiceNumber = `INV-${Date.now()}`;

  // Prepare data for invoice PDF
  const customer = {
    name: order.user.name,
    email: order.user.email,
    address: order.user.address || "Not Provided", // You can extend User model to store address
  };

  const items = order.items.map(item => ({
    name: item.product.name,
    quantity: item.quantity,
    price: Number(item.price),
  }));

  const totalAmount = Number(order.totalAmount);

  // Generate full invoice PDF
  const pdfUrl = await generateInvoicePdf({
    orderId,
    invoiceNumber,
    customer,
    items,
    totalAmount,
  });

  // Save invoice in DB
  await prisma.invoice.create({
    data: {
      orderId,
      invoiceNumber,
      pdfUrl,
    },
  });

  // Clear user's cart after successful payment
  await prisma.cartItem.deleteMany({
    where: {
      cart: { userId: order.userId },
    },
  });
},
};