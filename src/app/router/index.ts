import { Router } from "express";
import { AuthRoutes } from "../modules/Auth/auth.route";
import { UserRoute } from "../modules/User/user.route";

const router = Router();

const moduleRouter = [
  {
    path: "/users",
    router: UserRoute,
  },
  {
    path: "/auth",
    router: AuthRoutes,
  },
];

moduleRouter.forEach((route) => {
  router.use(route.path, route.router);
});

export default router;
