import { prisma } from "../config/prisma.js";

export interface CreateOrderData {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export const orderService = {
  async getAll(userId?: string) {
    const where = userId ? { userId } : {};
    return prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string, userId?: string) {
    const where: any = { id };
    if (userId) {
      where.userId = userId;
    }

    return prisma.order.findFirst({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payment: true,
      },
    });
  },

  // async create(userId: string, data: CreateOrderData) {
  //   // Get cart items
  //   const cart = await prisma.cart.findUnique({
  //     where: { userId },
  //     include: {
  //       items: {
  //         include: {
  //           product: true,
  //         },
  //       },
  //     },
  //   });

  //   if (!cart || cart.items.length === 0) {
  //     throw new Error("Cart is empty");
  //   }

  //   // Calculate total
  //   let totalAmount = 0;
  //   const orderItems = cart.items.map((item: typeof cart.items[0]) => {
  //     const price = Number(item.product.price);
  //     const itemTotal = price * item.quantity;
  //     totalAmount += itemTotal;

  //     return {
  //       productId: item.productId,
  //       quantity: item.quantity,
  //       price: price,
  //     };
  //   });

  //   // Create order
  //   const order = await prisma.order.create({
  //     data: {
  //       userId,
  //       totalAmount: totalAmount,
  //       items: {
  //         create: orderItems,
  //       },
  //     },
  //     include: {
  //       items: {
  //         include: {
  //           product: true,
  //         },
  //       },
  //     },
  //   });

  //   // Clear cart
  //   await prisma.cartItem.deleteMany({
  //     where: { cartId: cart.id },
  //   });

  //   return order;
  // },
  async create(userId: string) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    let totalAmount = 0;

    const items = cart.items.map(item => {
      totalAmount += Number(item.product.price) * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.product.price),
      };
    });

    return prisma.order.create({
      data: {
        userId,
        status: "PENDING",
        paymentStatus: "PAYMENT_PENDING",
        totalAmount,
        items: { create: items },
      },
      include: { items: true },
    });
  }
  ,
  async updateStatus(id: string, status: string) {
    return prisma.order.update({
      where: { id },
      data: { status: status as any },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  },
};
