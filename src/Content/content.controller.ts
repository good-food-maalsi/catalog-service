import { Elysia, t } from "elysia";
import { Prisma } from "@prisma/client";
import { prismaPlugin } from "../Plugin/prisma.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * GET /content — menus + dishes en un seul appel, filtrés par categoryId et/ou franchiseId.
 * Utilisé par la page restaurant pour éviter 2 appels et garantir le même filtre.
 */
export const ContentController = new Elysia()
  .use(prismaPlugin)
  .get(
    "/content",
    async ({ db, query, set }) => {
      const rawCategoryId =
        typeof query.categoryId === "string"
          ? query.categoryId.trim()
          : undefined;
      const rawFranchiseId =
        typeof query.franchiseId === "string"
          ? query.franchiseId.trim()
          : undefined;

      const categoryId =
        rawCategoryId && UUID_REGEX.test(rawCategoryId)
          ? rawCategoryId
          : undefined;
      const franchiseId =
        rawFranchiseId && UUID_REGEX.test(rawFranchiseId)
          ? rawFranchiseId
          : undefined;

      if (rawCategoryId != null && rawCategoryId !== "" && !categoryId) {
        set.status = 400;
        return { message: "Invalid categoryId format (UUID expected)" };
      }
      if (rawFranchiseId != null && rawFranchiseId !== "" && !franchiseId) {
        set.status = 400;
        return { message: "Invalid franchiseId format (UUID expected)" };
      }

      if (categoryId) {
        const category = await db.category.findUnique({
          where: { id: categoryId },
        });
        if (!category) {
          set.status = 400;
          return { message: "Category not found" };
        }
      }

      const menuIdsInCategory = categoryId
        ? (
            await db.menuCategory.findMany({
              where: { categoryId },
              select: { menuId: true },
            })
          ).map((r) => r.menuId)
        : null;

      const menuIdsForFranchise = franchiseId
        ? (
            await db.dish.findMany({
              where: { franchiseId },
              select: { menuId: true },
              distinct: ["menuId"],
            })
          )
            .map((d) => d.menuId)
            .filter((id): id is string => id != null)
        : null;

      const menuConditions: Prisma.MenuWhereInput[] = [];
      if (menuIdsInCategory !== null)
        menuConditions.push({ id: { in: menuIdsInCategory } });
      if (menuIdsForFranchise !== null)
        menuConditions.push({ id: { in: menuIdsForFranchise } });
      const menuWhere: Prisma.MenuWhereInput =
        menuConditions.length > 0 ? { AND: menuConditions } : {};

      const dishConditions: Prisma.DishWhereInput[] = [];
      if (franchiseId) dishConditions.push({ franchiseId });
      if (menuIdsInCategory !== null)
        dishConditions.push({ menuId: { in: menuIdsInCategory } });
      const dishWhere: Prisma.DishWhereInput =
        dishConditions.length > 0 ? { AND: dishConditions } : {};

      const [menus, dishes] = await Promise.all([
        db.menu.findMany({
          where: menuWhere,
          include: {
            Categories: true,
            Discounts: true,
            Dish: true,
          },
        }),
        db.dish.findMany({
          where: dishWhere,
          include: { Menu: true },
        }),
      ]);

      return { data: { menus, dishes } };
    },
    {
      query: t.Object({
        categoryId: t.Optional(t.String()),
        franchiseId: t.Optional(t.String()),
      }),
    }
  );
