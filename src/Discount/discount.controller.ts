import { Elysia, t } from "elysia";
import { Prisma } from "@prisma/client";
import { prismaPlugin } from "../Plugin/prisma.js";
import { createAuthMiddleware, Role } from "@good-food/utils";
import { env } from "../Utils/env.js";

export const DiscountController = new Elysia()
  .use(prismaPlugin)
  .use(createAuthMiddleware({
    allowedRoles: [Role.CUSTOMER, Role.ADMIN],
    env,
  }))
  .group("/discount", (app) =>
    app
      // Get all discounts
      .get("/", async ({ db }) => {
        const discounts = await db.discount.findMany({
          include: {
            Menus: true,
          },
        });
        return { data: discounts };
      })

      // Get discount by ID
      .get("/:id", async ({ params, db, set }) => {
        const discount = await db.discount.findUnique({
          where: { id: params.id },
          include: {
            Menus: true,
          },
        });

        if (!discount) {
          set.status = 404;
          return { message: "Discount not found" };
        }

        return { data: discount };
      })

      // Create discount
      .post("/", async ({ body, set, db }) => {
        try {
          const discount = await db.discount.create({
            data: {
              name: body.name,
              code: body.code,
              description: body.description,
              type: body.type,
              value: body.value,
              dateFrom: new Date(body.dateFrom),
              dateTo: new Date(body.dateTo),
            },
          });

          set.status = 201;
          return { message: "Discount created successfully", data: discount };
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            (error.code === "P2002")
          ) {
            set.status = 400;
            return { message: "Discount with this name or code already exists" };
          }
          throw error;
        }
      }, {
        body: t.Object({
          name: t.String(),
          code: t.String(),
          description: t.String(),
          type: t.Union([
            t.Literal("PERCENTAGE"),
            t.Literal("FIXED_AMOUNT"),
            t.Literal("SPECIAL_OFFER"),
          ]),
          value: t.Number(),
          dateFrom: t.String(), // ISO date string
          dateTo: t.String(),   // ISO date string
        }),
      })

      // Update discount
      .put("/:id", async ({ params, body, set, db }) => {
        try {
          const discount = await db.discount.update({
            where: { id: params.id },
            data: {
              ...(body.name !== undefined && { name: body.name }),
              ...(body.code !== undefined && { code: body.code }),
              ...(body.description !== undefined && { description: body.description }),
              ...(body.type !== undefined && { type: body.type }),
              ...(body.value !== undefined && { value: body.value }),
              ...(body.dateFrom !== undefined && { dateFrom: new Date(body.dateFrom) }),
              ...(body.dateTo !== undefined && { dateTo: new Date(body.dateTo) }),
            },
          });

          return { message: "Discount updated successfully", data: discount };
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
              set.status = 404;
              return { message: "Discount not found" };
            }
            if (error.code === "P2002") {
              set.status = 400;
              return { message: "Discount with this name or code already exists" };
            }
          }
          throw error;
        }
      }, {
        body: t.Object({
          name: t.Optional(t.String()),
          code: t.Optional(t.String()),
          description: t.Optional(t.String()),
          type: t.Optional(t.Union([
            t.Literal("PERCENTAGE"),
            t.Literal("FIXED_AMOUNT"),
            t.Literal("SPECIAL_OFFER"),
          ])),
          value: t.Optional(t.Number()),
          dateFrom: t.Optional(t.String()),
          dateTo: t.Optional(t.String()),
        }),
      })

      // Delete discount
      .delete("/:id", async ({ params, set, db }) => {
        try {
          await db.discount.delete({
            where: { id: params.id },
          });

          return { message: "Discount deleted successfully" };
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2025"
          ) {
            set.status = 404;
            return { message: "Discount not found" };
          }
          throw error;
        }
      })
  );
