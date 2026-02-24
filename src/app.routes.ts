import { Elysia } from "elysia";
import { authMiddleware } from "./Middleware/auth.middleware.js";

import { DishController } from "./Dish/dish.controller.js";
import { DishIngredientController } from "./Dish/dish-ingredient.controller.js";
import { CategoryController } from "./Category/category.controller.js";
import { MenuController } from "./Menu/menu.controller.js";
import { DiscountController } from "./Discount/discount.controller.js";
import { SearchController } from "./Search/search.controller.js";
import { ContentController } from "./Content/content.controller.js";
import { prismaPlugin } from "./Plugin/prisma.js";

const routes = new Elysia()
  .use(prismaPlugin)
  .use(SearchController)
  .use(ContentController)
  .use(DishController)
  .use(DishIngredientController)
  .use(CategoryController)
  .use(MenuController)
  .use(DiscountController);

export { routes as AppRoutes };
