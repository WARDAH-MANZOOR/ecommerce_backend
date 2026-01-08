import { Router } from "express";
import { cartService } from "../../services/cart.js";
import { requireAuth, AuthRequest } from "../../middlewares/auth.js";

export const cartRouter = Router();

// All cart routes require authentication
cartRouter.use(requireAuth);

// Get cart
cartRouter.get("/", async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const cart = await cartService.getCart(req.user.userId);
    res.json({ cart });
  } catch (err) {
    next(err);
  }
});

// Add item to cart
cartRouter.post("/items", async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { productId, quantity } = req.body;
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid data" });
    }
    const item = await cartService.addItem(req.user.userId, { productId, quantity });
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
});

// Update cart item
cartRouter.put("/items/:id", async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { quantity } = req.body;
    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }
    const item = await cartService.updateItem(req.params.id, quantity);
    res.json({ item });
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Cart item not found" });
    }
    next(err);
  }
});

// Remove item from cart
cartRouter.delete("/items/:id", async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    await cartService.removeItem(req.params.id);
    res.json({ message: "Item removed from cart" });
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Cart item not found" });
    }
    next(err);
  }
});

// Clear cart
cartRouter.delete("/", async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const result = await cartService.clearCart(req.user.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
