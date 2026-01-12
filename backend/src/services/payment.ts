// import Stripe from "stripe";
// import { prisma } from "../config/prisma.js";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2024-06-20",
// });
// export const paymentService = {
//   async createPaymentIntent(orderId: string) {
//     const order = await prisma.order.findUnique({
//       where: { id: orderId },
//       include: {
//         items: {
//           include: {
//             product: true,
//           },
//         },
//       },
//     });

//     if (!order) {
//       throw new Error("Order not found");
//     }

//     if (order.paymentStatus === "PAYMENT_SUCCESS") {
//       throw new Error("Order already paid");
//     }

//     const amount = Number(order.totalAmount) * 100; // Convert to cents

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: Math.round(amount),
//       currency: "usd",
//       metadata: {
//         orderId: order.id,
//       },
//     });

//     // Create or update payment record
//     await prisma.payment.upsert({
//       where: { orderId },
//       create: {
//         orderId: order.id,
//         amount: order.totalAmount,
//         stripePaymentIntent: paymentIntent.id,
//         status: "PAYMENT_PENDING",
//       },
//       update: {
//         stripePaymentIntent: paymentIntent.id,
//         status: "PAYMENT_PENDING",
//       },
//     });

//     return {
//       clientSecret: paymentIntent.client_secret,
//       paymentIntentId: paymentIntent.id,
//     };
//   },

//   async confirmPayment(paymentIntentId: string) {
//     const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

//     if (paymentIntent.status === "succeeded") {
//       const orderId = paymentIntent.metadata.orderId;

//       // Update payment status
//       await prisma.payment.update({
//         where: { orderId },
//         data: { status: "PAYMENT_SUCCESS" },
//       });

//       // Update order status
//       await prisma.order.update({
//         where: { id: orderId },
//         data: {
//           paymentStatus: "PAYMENT_SUCCESS",
//           status: "PAID",
//         },
//       });

//       return { success: true, orderId };
//     }

//     // Update payment status to failed
//     const orderId = paymentIntent.metadata.orderId;
//     await prisma.payment.update({
//       where: { orderId },
//       data: { status: "PAYMENT_FAILED" },
//     });

//     await prisma.order.update({
//       where: { id: orderId },
//       data: { paymentStatus: "PAYMENT_FAILED" },
//     });

//     return { success: false, orderId };
//   },

//   async getPaymentStatus(orderId: string) {
//     const payment = await prisma.payment.findUnique({
//       where: { orderId },
//       include: {
//         order: true,
//       },
//     });

//     return payment;
//   },
// };
import Stripe from "stripe";
import { prisma } from "../config/prisma.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const paymentService = {
  async createPaymentIntent(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) throw new Error("Order not found");
    if (order.paymentStatus === "PAYMENT_SUCCESS")
      throw new Error("Order already paid");

    const amount = Number(order.totalAmount) * 100; // in cents

    // 🔹 Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: order.items.map((item:any) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.product.name },
          unit_amount: Math.round(item.product.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: "http://localhost:8501?success=true",
      cancel_url: "http://localhost:8501?canceled=true",
      metadata: { orderId: order.id },
    });

    // 🔹 Create or update payment record in DB
    await prisma.payment.upsert({
      where: { orderId },
      create: {
        orderId: order.id,
        amount: order.totalAmount,
        stripePaymentIntent: typeof session.payment_intent === "string" 
            ? session.payment_intent 
            : session.payment_intent?.id ?? "",
        status: "PAYMENT_PENDING",
      },
      update: {
        stripePaymentIntent: typeof session.payment_intent === "string" 
            ? session.payment_intent 
            : session.payment_intent?.id ?? "",
        status: "PAYMENT_PENDING",
      },
    });
    
    // 🔹 Return Checkout URL to frontend
    return {
      checkoutUrl: session.url,
      clientSecret: session.payment_intent ? session.payment_intent : null,
    };
  },

  // ✅ Keep confirmPayment and getPaymentStatus same
  async confirmPayment(paymentIntentId: string) {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      const orderId = paymentIntent.metadata.orderId;

      await prisma.payment.update({
        where: { orderId },
        data: { status: "PAYMENT_SUCCESS" },
      });

      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAYMENT_SUCCESS",
          status: "PAID",
        },
      });

      return { success: true, orderId };
    }

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
      include: { order: true },
    });
    return payment;
  },
};
