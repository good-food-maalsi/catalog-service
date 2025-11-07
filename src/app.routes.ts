import Elysia from 'elysia';

import { DishController } from './Dish/dish.controller';
import { prismaPlugin } from './Plugin/prisma';

const routes = new Elysia({ prefix: 'api/v1' })
    .use(prismaPlugin)
    .use(DishController)

export { routes as AppRoutes };