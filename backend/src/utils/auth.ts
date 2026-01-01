import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../config/index.js";

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions["expiresIn"],
  };
  return jwt.sign(payload, config.jwt.secret, options);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions["expiresIn"],
  };
  return jwt.sign(payload, config.jwt.refreshSecret, options);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
};

export const generateTokens = (payload: TokenPayload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { accessToken, refreshToken };
};
