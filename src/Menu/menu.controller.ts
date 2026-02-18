import { Elysia, t } from "elysia";
import { Prisma } from "@prisma/client";
import { prismaPlugin } from "../Plugin/prisma.js";
import { createMenuSchema, updateMenuSchema } from "@good-food/contracts/catalog";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const MenuController = new Elysia()
  .use(prismaPlugin)
  .group("/menu", (app) =>
    app
      // Get all menus (optionally filtered by categoryId)
      .get(
        "/",
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

          const conditions: Prisma.MenuWhereInput[] = [];
          if (menuIdsInCategory !== null)
            conditions.push({ id: { in: menuIdsInCategory } });
          if (menuIdsForFranchise !== null)
            conditions.push({ id: { in: menuIdsForFranchise } });
          const where: Prisma.MenuWhereInput =
            conditions.length > 0 ? { AND: conditions } : {};

          const menus = await db.menu.findMany({
            where,
            include: {
              Categories: true,
              Discounts: true,
              Dish: true,
            },
          });
          return { data: menus };
        },
        {
          query: t.Object({
            categoryId: t.Optional(t.String()),
            franchiseId: t.Optional(t.String()),
          }),
        }
      )

      // Get menu by ID
      .get("/:id", async ({ params, db, set }) => {
        const menu = await db.menu.findUnique({
          where: { id: params.id },
          include: {
            Categories: true,
            Discounts: true,
            Dish: true,
          },
        });

        if (!menu) {
          set.status = 404;
          return { message: "Menu not found" };
        }

        return { data: menu };
      })

      // Create menu
      .post("/", async ({ body, set, db }) => {
        const parsed = createMenuSchema.safeParse(body);
        if (!parsed.success) {
          set.status = 400;
          return { error: parsed.error.issues };
        }
        const menu = await db.menu.create({
          data: {
            name: body.name,
            description: body.description,
            availability: body.availability ?? true,
          },
        });

        set.status = 201;
        return { message: "Menu created successfully", data: menu };
      }, {
        body: t.Object({
          name: t.String(),
          description: t.String(),
          availability: t.Optional(t.Boolean()),
        }),
      })

      // Update menu
      .put("/:id", async ({ params, body, set, db }) => {
        const parsed = updateMenuSchema.safeParse(body);
        if (!parsed.success) {
          set.status = 400;
          return { error: parsed.error.issues };
        }
        try {
          const menu = await db.menu.update({
            where: { id: params.id },
            data: {
              ...(body.name !== undefined && { name: body.name }),
              ...(body.description !== undefined && { description: body.description }),
              ...(body.availability !== undefined && { availability: body.availability }),
            },
          });

          return { message: "Menu updated successfully", data: menu };
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2025"
          ) {
            set.status = 404;
            return { message: "Menu not found" };
          }
          throw error;
        }
      }, {
        body: t.Object({
          name: t.Optional(t.String()),
          description: t.Optional(t.String()),
          availability: t.Optional(t.Boolean()),
        }),
      })

      // Delete menu
      .delete("/:id", async ({ params, set, db }) => {
        try {
          await db.menu.delete({
            where: { id: params.id },
          });

          return { message: "Menu deleted successfully" };
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2025"
          ) {
            set.status = 404;
            return { message: "Menu not found" };
          }
          throw error;
        }
      })
  );
