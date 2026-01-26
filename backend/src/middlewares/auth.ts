import { Request, Response, NextFunction, RequestHandler } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt.js";

export interface AuthRequest extends Request {
  user: JwtPayload;
}

// export const requireAuth: RequestHandler = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     res.status(401).json({ message: "Unauthorized" });
//     return
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const payload = verifyToken(token);
//     req.user = payload;
//     next();
//     return
//   } catch {
//     res.status(401).json({ message: "Invalid token" });
//     return
//   }
// };
export const requireAuth: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    req.user = verifyToken(token); // TS now recognizes req.user
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
// Admin middleware
export const requireAdmin: RequestHandler = (req, res, next) => {
  const authReq = req as AuthRequest; // cast here
  if (!authReq.user || authReq.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};
