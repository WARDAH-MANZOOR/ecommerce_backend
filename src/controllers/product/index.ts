import { Router } from "express";
import { productService } from "../../services/product.js";
import { requireAuth, requireAdmin, AuthRequest } from "../../middlewares/auth.js";

export const productRouter = Router();

// Get all products
productRouter.get("/", async (_req, res, next) => {
  try {
    const products = await productService.getAll();
    res.json({ products });
  } catch (err) {
    next(err);
  }
});

// Get product by ID
productRouter.get("/:id", async (req, res, next) => {
  try {
    const product = await productService.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ product });
  } catch (err) {
    next(err);
  }
});

// Create product (Admin only)
productRouter.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { name, description, price, stock } = req.body;
    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const product = await productService.create({ name, description, price, stock });
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
});

// Update product (Admin only)
productRouter.put("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { name, description, price, stock } = req.body;
    const product = await productService.update(req.params.id, { name, description, price, stock });
    res.json({ product });
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Product not found" });
    }
    next(err);
  }
});

// Delete product (Admin only)
productRouter.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await productService.delete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Product not found" });
    }
    next(err);
  }
});
