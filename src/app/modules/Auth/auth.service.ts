import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../../utlis/prisma";
import { OrganizationRole } from "../../generated/enums";
import { customError } from "../../middleware/globalErrorHandler";
import { createUserToken } from "../../middleware/userToken";
import { IOrganization } from "./auth.interface";

const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new customError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new customError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
  }

  const userToken = createUserToken({
    id: user.id,
    email: user.email,
    systemRole: user.systemRole,
  });
  const { password: _, ...userData } = user;

  return {
    user: userData,
    accessToken: userToken.accessToken,
    refreshToken: userToken.refreshToken,
  };
};

const createOrganization = async (userId: string, payload: IOrganization) => {
  if (!userId) {
    throw new Error("User ID is required to create organization");
  }

  const existingOwner = await prisma.organizationMember.findFirst({
    where: {
      userId,
      isOwner: true,
    },
  });

  if (existingOwner) {
    throw new customError(
      StatusCodes.BAD_REQUEST,
      "User already owns an organization"
    );
  }

  return prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: payload.name,
        email: payload.email,
        slug: payload.slug,
        address: payload.address,
        phoneNumber: payload.phoneNumber,
      },
    });

    const ownerMember = await tx.organizationMember.create({
      data: {
        role: OrganizationRole.OWNER,
        isOwner: true,
        organization: {
          connect: { id: organization.id },
        },
        user: {
          connect: { id: userId },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      organization,
      owner: ownerMember.user,
    };
  });
};

const createDepartment = async (
  organizationId: string,
  departments: { name: string }[]
) => {
  if (!organizationId) {
    throw new customError(StatusCodes.BAD_REQUEST, "Organization ID required");
  }

  if (!departments.length) {
    throw new customError(StatusCodes.BAD_REQUEST, "No departments provided");
  }

  const result = await prisma.department.createMany({
    data: departments.map((department) => ({
      name: department.name,
      organizationId,
    })),
    skipDuplicates: true,
  });

  return {
    createdCount: result.count,
  };
};

export const AuthService = {
  login,
  createOrganization,
  createDepartment,
};
