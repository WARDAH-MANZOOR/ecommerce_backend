import { Router } from "express";
import { authRouter } from "../controllers/auth/index.js";
import { productRouter } from "../controllers/product/index.js";
import { orderRouter } from "../controllers/order/index.js";
import { cartRouter } from "../controllers/cart/index.js";
import { paymentRouter } from "../controllers/payment/index.js";
// import  webhookRouter  from "../controllers/webhook/index.js";
const router = Router();

router.use("/auth", authRouter);
router.use("/products", productRouter);
router.use("/orders", orderRouter);
router.use("/cart", cartRouter);
router.use("/payments", paymentRouter);
// router.use("/webhooks", webhookRouter);
export default router;

