import bcrypt from "bcryptjs";

import { StatusCodes } from "http-status-codes";
import envConfig from "../../../config/envConfig";
import { prisma } from "../../../utlis/prisma";
import { customError } from "../../middleware/globalErrorHandler";
import { IOrganization, IUser } from "./user.interface";

const createUser = async (payload: IUser) => {
  console.log(payload);
  // Implementation for creating a user
  const passwordSalt = Number(envConfig.BCRYPT_SALT_ROUNDS);
  if (!passwordSalt || isNaN(passwordSalt)) {
    throw new customError(
      StatusCodes.BAD_REQUEST,
      "Invalid BCRYPT_SALT_ROUNDS configuration"
    );
  }
  const passwordHash = await bcrypt.hash(payload.password, passwordSalt);

  const user = await prisma.user.create({
    data: {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      password: passwordHash,
    },
  });

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const createOrganization = async (payload: IOrganization) => {
  const organization = await prisma.organization.create({
    data: {
      name: payload.name,
      email: payload.email,
      slug: payload.slug,
      address: payload.address,
      phoneNumber: payload.phoneNumber,
    },
  });

  return organization;
};

export const UserService = {
  createUser,
  createOrganization,
};
