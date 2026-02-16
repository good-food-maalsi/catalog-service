import { Elysia, t } from "elysia";
import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prismaPlugin } from "../Plugin/prisma.js";
import { createAuthMiddleware, Role } from "@good-food/utils";
import { env } from "../Utils/env.js";
import {
  createDiscountSchema,
  updateDiscountSchema,
} from "@good-food/contracts/catalog";

type Ctx = { db: PrismaClient; params?: { id: string }; body?: unknown; set: { status?: number } };

export const DiscountController = new Elysia()
  .use(prismaPlugin)
  .use(
    createAuthMiddleware({
      allowedRoles: [Role.CUSTOMER, Role.ADMIN],
      env,
    }),
  )
  .group("/discount", (app) =>
    app
      // Get all discounts
      .get("/", async (ctx: Ctx) => {
        const db = ctx.db as PrismaClient;
        const discounts = await db.discount.findMany({
          include: {
            Menus: true,
          },
        });
        return { data: discounts };
      })

      // Get discount by ID
      .get("/:id", async (ctx: Ctx) => {
        const db = ctx.db as PrismaClient;
        const { params, set } = ctx;
        const discount = await db.discount.findUnique({
          where: { id: params!.id },
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
      .post(
        "/",
        async (ctx: Ctx) => {
          const db = ctx.db as PrismaClient;
          const { body, set } = ctx;
          const parsed = createDiscountSchema.safeParse(body);
          if (!parsed.success) {
            set.status = 400;
            return { error: parsed.error.issues };
          }
          const data = parsed.data;
          try {
            const discount = await db.discount.create({
              data: {
                name: data.name,
                code: data.code,
                description: data.description ?? "",
                type: data.type,
                value: data.value,
                dateFrom: new Date(data.dateFrom),
                dateTo: new Date(data.dateTo),
              },
            });

            set.status = 201;
            return { message: "Discount created successfully", data: discount };
          } catch (error) {
            if (
              error instanceof Prisma.PrismaClientKnownRequestError &&
              error.code === "P2002"
            ) {
              set.status = 400;
              return {
                message: "Discount with this name or code already exists",
              };
            }
            throw error;
          }
        },
        {
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
            dateTo: t.String(), // ISO date string
          }),
        },
      )

      // Update discount
      .put(
        "/:id",
        async (ctx: Ctx) => {
          const db = ctx.db as PrismaClient;
          const { params, body, set } = ctx;
          const parsed = updateDiscountSchema.safeParse(body);
          if (!parsed.success) {
            set.status = 400;
            return { error: parsed.error.issues };
          }
          const data = parsed.data;
          try {
            const discount = await db.discount.update({
              where: { id: params!.id },
              data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.code !== undefined && { code: data.code }),
                ...(data.description !== undefined && {
                  description: data.description,
                }),
                ...(data.type !== undefined && { type: data.type }),
                ...(data.value !== undefined && { value: data.value }),
                ...(data.dateFrom !== undefined && {
                  dateFrom: new Date(data.dateFrom),
                }),
                ...(data.dateTo !== undefined && {
                  dateTo: new Date(data.dateTo),
                }),
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
                return {
                  message: "Discount with this name or code already exists",
                };
              }
            }
            throw error;
          }
        },
        {
          body: t.Object({
            name: t.Optional(t.String()),
            code: t.Optional(t.String()),
            description: t.Optional(t.String()),
            type: t.Optional(
              t.Union([
                t.Literal("PERCENTAGE"),
                t.Literal("FIXED_AMOUNT"),
                t.Literal("SPECIAL_OFFER"),
              ]),
            ),
            value: t.Optional(t.Number()),
            dateFrom: t.Optional(t.String()),
            dateTo: t.Optional(t.String()),
          }),
        },
      )

      // Delete discount
      .delete("/:id", async (ctx: Ctx) => {
        const db = ctx.db as PrismaClient;
        const { params, set } = ctx;
        try {
          await db.discount.delete({
            where: { id: params!.id },
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
      }),
  );
