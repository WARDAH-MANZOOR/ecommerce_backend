import { Router } from "express";
import { invoiceController } from "../../controllers/invoice/index.js";
import { requireAuth,requireAdmin } from "../../middlewares/auth.js";

const router = Router();

router.get("/:orderId", requireAuth, invoiceController.getInvoiceByOrder);
router.get("/:orderId/download", requireAuth, invoiceController.downloadInvoice);

export default router;
