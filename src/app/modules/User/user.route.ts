import { Router } from "express";
import { UserController } from "./user.controller";

const router = Router();

router.post("/register", UserController.createUser);
router.post("/organizations", UserController.createOrganization);

export const UserRoute = router;
