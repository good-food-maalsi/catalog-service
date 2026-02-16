import { Elysia, t } from "elysia";
import { Prisma } from "@prisma/client";
import { prismaPlugin } from "../Plugin/prisma.js";
import { createMenuSchema, updateMenuSchema } from "@good-food/contracts/catalog";

export const MenuController = new Elysia()
  .use(prismaPlugin)
  .group("/menu", (app) =>
    app
      // Get all menus
      .get("/", async ({ db }) => {
        const menus = await db.menu.findMany({
          include: {
            Categories: true,
            Discounts: true,
            Dish: true,
          },
        });
        return { data: menus };
      })

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
