import { Router } from "express";
import { orderService } from "../../services/order.js";
import { requireAuth, requireAdmin, AuthRequest } from "../../middlewares/auth.js";

export const orderRouter = Router();

// Get all orders (user sees own, admin sees all)
orderRouter.get("/", requireAuth, async (req, res, next) => {
  const authReq = req as AuthRequest; // cast to access user safely

  try {
    if (!authReq.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = authReq.user.role === "ADMIN" ? undefined : authReq.user.id;
    const orders = await orderService.getAll(userId);
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});


// Get order by ID
orderRouter.get("/:id", requireAuth, async (req, res, next) => {
  const authReq = req as AuthRequest; // cast to access user safely

  try {
    if (!authReq.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = authReq.user.role === "ADMIN" ? undefined : authReq.user.id;
    const order = await orderService.getById(req.params.id, userId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (err) {
    next(err);
  }
});


// Create order from cart
// orderRouter.post("/", requireAuth, async (req: AuthRequest, res, next) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     const order = await orderService.create(req.user.userId, { items: [] });
//     res.status(201).json({ order });
//   } catch (err: any) {
//     if (err.message === "Cart is empty") {
//       return res.status(400).json({ message: err.message });
//     }
//     next(err);
//   }
// });
orderRouter.post("/", requireAuth, async (req, res, next) => {
  const authReq = req as AuthRequest; // cast here to access user

  try {
    if (!authReq.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const order = await orderService.create(authReq.user.id); // use authReq.user.id
    res.status(201).json({ order });
  } catch (err: any) {
    if (err.message === "Cart is empty") {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
});

// Update order status (Admin only)
orderRouter.put("/:id/status", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    const order = await orderService.updateStatus(req.params.id, status);
    res.json({ order });
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Order not found" });
    }
    next(err);
  }
});
