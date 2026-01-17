import envConfig from "../../config/envConfig";
import { generateToken } from "../../utlis/jwtHelper";

export interface AccessTokenPayload {
  sub: string; // userId
  email: string;
  systemRole: "ADMIN" | "USER";
}

export interface RefreshTokenPayload {
  sub: string; // userId
  tokenVersion: number;
}

interface CreateUserTokenInput {
  id: string;
  email: string;
  systemRole: "ADMIN" | "USER";
  tokenVersion?: number;
}

export const createUserToken = (user: CreateUserTokenInput) => {
  const accessToken = generateToken(
    {
      sub: user.id,
      email: user.email,
      systemRole: user.systemRole,
    },
    envConfig.JWT_ACCESS_TOKEN_SECRET as string,
    envConfig.JWT_ACCESS_TOKEN_EXPIRES_IN as string
  );

  const refreshToken = generateToken(
    {
      sub: user.id,
      tokenVersion: user.tokenVersion ?? 0,
    },
    envConfig.JWT_REFRESH_TOKEN_SECRET as string,
    envConfig.JWT_REFRESH_TOKEN_EXPIRES_IN as string
  );

  return { accessToken, refreshToken };
};
