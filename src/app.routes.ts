import { Elysia } from "elysia";
import { authMiddleware } from "./Middleware/auth.middleware.js";

import { DishController } from "./Dish/dish.controller.js";
import { CategoryController } from "./Category/category.controller.js";
import { MenuController } from "./Menu/menu.controller.js";
import { DiscountController } from "./Discount/discount.controller.js";
import { prismaPlugin } from "./Plugin/prisma.js";

const routes = new Elysia({ prefix: "api/v1" })
  .use(prismaPlugin)
  .use(DishController)
  .use(CategoryController)
  .use(MenuController)
  .use(DiscountController);

export { routes as AppRoutes };
