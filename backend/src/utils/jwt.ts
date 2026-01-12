import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";
const JWT_EXPIRES_IN = Number(process.env.JWT_EXPIRES_IN) || 60 * 60 * 24 * 7;


export interface JwtPayload {
  userId: string;
  role: "USER" | "ADMIN";
}

export const signToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
