import { Elysia, t } from "elysia";
import { Prisma } from "@prisma/client";
import { prismaPlugin } from "../Plugin/prisma.js";

export const CategoryController = new Elysia()
  .use(prismaPlugin)
  .group("/category", (app) =>
    app
      // Get all categories
      .get("/", async ({ db }) => {
        const categories = await db.category.findMany({
          include: {
            Menus: true,
          },
        });
        return { data: categories };
      })

      // Get category by ID
      .get("/:id", async ({ params, db, set }) => {
        const category = await db.category.findUnique({
          where: { id: params.id },
          include: {
            Menus: true,
          },
        });

        if (!category) {
          set.status = 404;
          return { message: "Category not found" };
        }

        return { data: category };
      })

      // Create category
      .post("/", async ({ body, set, db }) => {
        try {
          const category = await db.category.create({
            data: {
              name: body.name,
              description: body.description,
            },
          });

          set.status = 201;
          return { message: "Category created successfully", data: category };
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
          ) {
            set.status = 400;
            return { message: "Category with this name already exists" };
          }
          throw error;
        }
      }, {
        body: t.Object({
          name: t.String(),
          description: t.String(),
        }),
      })

      // Update category
      .put("/:id", async ({ params, body, set, db }) => {
        try {
          const category = await db.category.update({
            where: { id: params.id },
            data: {
              ...(body.name !== undefined && { name: body.name }),
              ...(body.description !== undefined && { description: body.description }),
            },
          });

          return { message: "Category updated successfully", data: category };
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
              set.status = 404;
              return { message: "Category not found" };
            }
            if (error.code === "P2002") {
              set.status = 400;
              return { message: "Category with this name already exists" };
            }
          }
          throw error;
        }
      }, {
        body: t.Object({
          name: t.Optional(t.String()),
          description: t.Optional(t.String()),
        }),
      })

      // Delete category
      .delete("/:id", async ({ params, set, db }) => {
        try {
          await db.category.delete({
            where: { id: params.id },
          });

          return { message: "Category deleted successfully" };
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2025"
          ) {
            set.status = 404;
            return { message: "Category not found" };
          }
          throw error;
        }
      })
  );
