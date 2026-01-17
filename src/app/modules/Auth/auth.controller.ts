import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../../utlis/catchAsync";
import { sendResponse } from "../../../utlis/SendResponse";
import { setAuthCookie } from "../../../utlis/setCookie";
import { customError } from "../../middleware/globalErrorHandler";
import { AuthService } from "./auth.service";

const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await AuthService.login(email, password);

  setAuthCookie(res, result);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Login successful",
    data: result,
  });
});

const createOrganization = catchAsync(
  async (req: Request & { user?: { id: string } }, res: Response) => {
    if (!req.user?.id) {
      throw new customError(StatusCodes.UNAUTHORIZED, "Unauthorized");
    }
    const result = await AuthService.createOrganization(req.user.id, req.body);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Organization created successfully",
      data: result,
    });
  }
);

const createDepartment = catchAsync(
  async (req: Request & { user?: { id: string } }, res: Response) => {
    if (!req.user?.id) {
      throw new customError(StatusCodes.UNAUTHORIZED, "Unauthorized");
    }
    const { organizationId } = req.params;
    const { departments } = req.body;
    const result = await AuthService.createDepartment(
      organizationId,
      departments
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Departments created successfully",
      data: result,
    });
  }
);

export const AuthController = {
  login,
  createOrganization,
  createDepartment,
};
