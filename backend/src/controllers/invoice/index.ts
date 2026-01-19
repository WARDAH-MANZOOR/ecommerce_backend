import { Request, Response } from "express";
import { invoiceService } from "../../services/invoice/index.js";

declare global {
  namespace Express {
    interface Request {
      user: { id: string };
    }
  }
}

export const invoiceController = {
  async getInvoiceByOrder(req: Request, res: Response) {
    const invoice = await invoiceService.getByOrderId(
      req.params.orderId,
      req.user.id
    );

    if (!invoice)
      return res.status(404).json({ message: "Invoice not found" });

    res.json(invoice);
  },

  async downloadInvoice(req: Request, res: Response) {
    const filePath = await invoiceService.getInvoiceFile(
      req.params.orderId,
      req.user.id
    );

    res.download(filePath);
  },
};
export default {invoiceController};