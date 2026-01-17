import { Router } from "express";
import { authenticate, requireOrgRole } from "../../middleware/checkAuth";
import { AuthController } from "./auth.controller";

const route = Router();

route.post("/login", AuthController.login);
route.post("/organizations", authenticate(), AuthController.createOrganization);
route.post(
  "/:organizationId/departments",
  authenticate(),
  requireOrgRole("OWNER", "ORG_ADMIN"),
  AuthController.createDepartment
);

export const AuthRoutes = route;
