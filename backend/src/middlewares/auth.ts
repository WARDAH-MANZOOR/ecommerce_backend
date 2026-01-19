import { Request, Response, NextFunction, RequestHandler } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt.js";

export interface AuthRequest extends Request {
  user: JwtPayload;
}

export const requireAuth: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
    return
  } catch {
    res.status(401).json({ message: "Invalid token" });
    return
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  return next();
};

