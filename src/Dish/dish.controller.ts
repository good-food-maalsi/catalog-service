import { Elysia, t } from "elysia";
import { Prisma } from "@prisma/client";
import { prismaPlugin } from "../Plugin/prisma.js";
import { createDishSchema, updateDishSchema } from "@good-food/contracts/catalog";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const DishController = new Elysia()
  .use(prismaPlugin)
  .group("/dish", (app) =>
    app
      // Get all dishes (with optional categoryId, menuId)
      .get(
        "/",
        async ({ db, query, set }) => {
          const rawCategoryId =
            typeof query.categoryId === "string"
              ? query.categoryId.trim()
              : undefined;
          const rawMenuId =
            typeof query.menuId === "string" ? query.menuId.trim() : undefined;
          const rawFranchiseId =
            typeof query.franchiseId === "string"
              ? query.franchiseId.trim()
              : undefined;

          const categoryId =
            rawCategoryId && UUID_REGEX.test(rawCategoryId)
              ? rawCategoryId
              : undefined;
          const menuId =
            rawMenuId && UUID_REGEX.test(rawMenuId) ? rawMenuId : undefined;
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

          const categoryMenuIds = categoryId
            ? (
                await db.menuCategory.findMany({
                  where: { categoryId },
                  select: { menuId: true },
                })
              ).map((r) => r.menuId)
            : null;

          const whereConditions: Prisma.DishWhereInput[] = [];

          if (franchiseId) whereConditions.push({ franchiseId });
          if (menuId) whereConditions.push({ menuId });
          if (categoryMenuIds !== null)
            whereConditions.push({
              menuId: { in: categoryMenuIds },
            });

          const where: Prisma.DishWhereInput =
            whereConditions.length > 0 ? { AND: whereConditions } : {};

          const dishes = await db.dish.findMany({
            where,
            include: {
              Menu: true,
            },
          });
          return { data: dishes };
        },
        {
          query: t.Object({
            menuId: t.Optional(t.String()),
            categoryId: t.Optional(t.String()),
            franchiseId: t.Optional(t.String()),
          }),
        }
      )

      // Get dish by ID
      .get("/:id", async ({ params, db, set }) => {
        const dish = await db.dish.findUnique({
          where: { id: params.id },
          include: {
            Menu: true,
            ingredients: true,
          },
        });

        if (!dish) {
          set.status = 404;
          return { message: "Dish not found" };
        }

        return { data: dish };
      })

      // Create dish
      .post("/", async ({ body, set, db }) => {
        const parsed = createDishSchema.safeParse(body);
        if (!parsed.success) {
          set.status = 400;
          return { error: parsed.error.issues };
        }
        try {
          const dish = await db.dish.create({
            data: {
              franchiseId: body.franchiseId,
              name: body.name,
              description: body.description,
              basePrice: body.basePrice,
              availability: body.availability ?? true,
              ...(body.menuId !== undefined && { menuId: body.menuId }),
              ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
            },
            include: {
              Menu: true,
            },
          });

          set.status = 201;
          return { message: "Dish created successfully", data: dish };
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2003"
          ) {
            set.status = 400;
            return { message: "Invalid menuId: Menu does not exist" };
          }
          throw error;
        }
      }, {
        body: t.Object({
          franchiseId: t.String(),
          name: t.String(),
          description: t.String(),
          basePrice: t.Number(),
          availability: t.Optional(t.Boolean()),
          menuId: t.Optional(t.String()),
          imageUrl: t.Optional(t.String()),
        }),
      })

      // Update dish
      .put("/:id", async ({ params, body, set, db }) => {
        const parsed = updateDishSchema.safeParse(body);
        if (!parsed.success) {
          set.status = 400;
          return { error: parsed.error.issues };
        }
        try {
          const dish = await db.dish.update({
            where: { id: params.id },
            data: {
              ...(body.name !== undefined && { name: body.name }),
              ...(body.description !== undefined && { description: body.description }),
              ...(body.basePrice !== undefined && { basePrice: body.basePrice }),
              ...(body.availability !== undefined && { availability: body.availability }),
              ...(body.menuId !== undefined && { menuId: body.menuId }),
              ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
            },
            include: {
              Menu: true,
            },
          });

          return { message: "Dish updated successfully", data: dish };
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
              set.status = 404;
              return { message: "Dish not found" };
            }
            if (error.code === "P2003") {
              set.status = 400;
              return { message: "Invalid menuId: Menu does not exist" };
            }
          }
          throw error;
        }
      }, {
        body: t.Object({
          name: t.Optional(t.String()),
          description: t.Optional(t.String()),
          basePrice: t.Optional(t.Number()),
          availability: t.Optional(t.Boolean()),
          menuId: t.Optional(t.String()),
          imageUrl: t.Optional(t.String()),
        }),
      })

      // Delete dish
      .delete("/:id", async ({ params, set, db }) => {
        try {
          await db.dish.delete({
            where: { id: params.id },
          });

          return { message: "Dish deleted successfully" };
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2025"
          ) {
            set.status = 404;
            return { message: "Dish not found" };
          }
          throw error;
        }
      })
  );
