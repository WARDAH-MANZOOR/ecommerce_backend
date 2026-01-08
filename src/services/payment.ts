import Stripe from "stripe";
import { prisma } from "../config/prisma.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

export const paymentService = {
  async createPaymentIntent(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.paymentStatus === "PAYMENT_SUCCESS") {
      throw new Error("Order already paid");
    }

    const amount = Number(order.totalAmount) * 100; // Convert to cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: "usd",
      metadata: {
        orderId: order.id,
      },
    });

    // Create or update payment record
    await prisma.payment.upsert({
      where: { orderId },
      create: {
        orderId: order.id,
        amount: order.totalAmount,
        stripePaymentIntent: paymentIntent.id,
        status: "PAYMENT_PENDING",
      },
      update: {
        stripePaymentIntent: paymentIntent.id,
        status: "PAYMENT_PENDING",
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  },

  async confirmPayment(paymentIntentId: string) {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      const orderId = paymentIntent.metadata.orderId;

      // Update payment status
      await prisma.payment.update({
        where: { orderId },
        data: { status: "PAYMENT_SUCCESS" },
      });

      // Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAYMENT_SUCCESS",
          status: "PAID",
        },
      });

      return { success: true, orderId };
    }

    // Update payment status to failed
    const orderId = paymentIntent.metadata.orderId;
    await prisma.payment.update({
      where: { orderId },
      data: { status: "PAYMENT_FAILED" },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: "PAYMENT_FAILED" },
    });

    return { success: false, orderId };
  },

  async getPaymentStatus(orderId: string) {
    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: {
        order: true,
      },
    });

    return payment;
  },
};
