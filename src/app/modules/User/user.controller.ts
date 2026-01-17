import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../../utlis/catchAsync";
import { sendResponse } from "../../../utlis/SendResponse";
import { UserService } from "./user.service";

const createUser = catchAsync(async (req: Request, res: Response) => {
  console.log(req.body);
  const createdUser = await UserService.createUser(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "User created successfully",
    data: createdUser,
  });
});

const createOrganization = catchAsync(async (req: Request, res: Response) => {
  const createdOrganization = await UserService.createOrganization(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Organization created successfully",
    data: createdOrganization,
  });
});

export const UserController = {
  createUser,
  createOrganization,
};
