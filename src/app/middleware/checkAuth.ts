import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import envConfig from "../../config/envConfig";
import { verifyToken } from "../../utlis/jwtHelper";
import { prisma } from "../../utlis/prisma";
import { OrganizationRole } from "../generated/enums";
import { customError } from "./globalErrorHandler";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    systemRole: "ADMIN" | "USER";
  };
}

export const authenticate = () => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const token =
        req.cookies?.accessToken || req.headers?.authorization?.split(" ")[1];

      if (!token) {
        throw new customError(StatusCodes.UNAUTHORIZED, "Unauthorized");
      }

      const decoded = verifyToken(
        token,
        envConfig.JWT_ACCESS_TOKEN_SECRET as string
      ) as {
        sub: string;
        email: string;
        systemRole: "ADMIN" | "USER";
      };

      req.user = {
        id: decoded.sub,
        email: decoded.email,
        systemRole: decoded.systemRole,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireSystemRole = (...roles: ("ADMIN" | "USER")[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.systemRole)) {
      throw new customError(StatusCodes.FORBIDDEN, "System permission denied");
    }
    next();
  };
};

export const requireOrgRole = (...roles: OrganizationRole[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { organizationId } = req.params;

    if (!organizationId) {
      throw new customError(StatusCodes.BAD_REQUEST, "Organization ID missing");
    }

    const member = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: req.user!.id,
          organizationId,
        },
      },
    });

    if (!member || !roles.includes(member.role)) {
      throw new customError(
        StatusCodes.FORBIDDEN,
        "Organization permission denied"
      );
    }

    next();
  };
};
