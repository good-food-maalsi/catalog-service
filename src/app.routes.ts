import { Elysia } from "elysia";

import { DishController } from "./Dish/dish.controller.js";
import { prismaPlugin } from "./Plugin/prisma.js";

const routes = new Elysia({ prefix: "api/v1" })
  .use(prismaPlugin)
  .use(DishController);

export { routes as AppRoutes };
