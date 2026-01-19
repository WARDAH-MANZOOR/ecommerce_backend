import { prisma } from "../../config/prisma.js";
import path from "path";

export const invoiceService = {
  async getByOrderId(orderId: string, userId: string) {
    return prisma.invoice.findFirst({
      where: {
        orderId,
        order: {
          userId, // 🔐 security check
        },
      },
    });
  },

  async getInvoiceFile(orderId: string, userId: string) {
    const invoice = await this.getByOrderId(orderId, userId);
    if (!invoice) throw new Error("Invoice not found");

    return path.join(process.cwd(), "public", invoice.pdfUrl);
  },
};
export default {invoiceService};