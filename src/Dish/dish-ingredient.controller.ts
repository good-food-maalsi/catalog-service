import { Elysia, t } from "elysia";
import { Prisma } from "@prisma/client";
import { prismaPlugin } from "../Plugin/prisma.js";
import {
  createDishIngredientSchema,
  updateDishIngredientSchema,
} from "@good-food/contracts/catalog";

export const DishIngredientController = new Elysia()
  .use(prismaPlugin)
  .group("/dish/:id/ingredients", (app) =>
    app
      // GET /dish/:id/ingredients — list ingredients for a dish
      .get("/", async ({ params, db, set }) => {
        const dish = await db.dish.findUnique({ where: { id: params.id } });
        if (!dish) {
          set.status = 404;
          return { message: "Dish not found" };
        }

        const ingredients = await db.dishIngredient.findMany({
          where: { dish_id: params.id },
        });

        return { data: ingredients };
      })

      // POST /dish/:id/ingredients — add an ingredient to a dish
      .post(
        "/",
        async ({ params, body, set, db }) => {
          const parsed = createDishIngredientSchema.safeParse(body);
          if (!parsed.success) {
            set.status = 400;
            return { error: parsed.error.issues };
          }

          const dish = await db.dish.findUnique({ where: { id: params.id } });
          if (!dish) {
            set.status = 404;
            return { message: "Dish not found" };
          }

          try {
            const ingredient = await db.dishIngredient.create({
              data: {
                dish_id: params.id,
                stock_id: body.stock_id,
                quantity_required: body.quantity_required,
              },
            });

            set.status = 201;
            return { message: "Ingredient added successfully", data: ingredient };
          } catch (error) {
            if (
              error instanceof Prisma.PrismaClientKnownRequestError &&
              error.code === "P2002"
            ) {
              set.status = 409;
              return { message: "This ingredient (stock) is already added to this dish" };
            }
            throw error;
          }
        },
        {
          body: t.Object({
            stock_id: t.String(),
            quantity_required: t.Number(),
          }),
        }
      )

      // PUT /dish/:id/ingredients/:ingredientId — update quantity_required
      .put(
        "/:ingredientId",
        async ({ params, body, set, db }) => {
          const parsed = updateDishIngredientSchema.safeParse(body);
          if (!parsed.success) {
            set.status = 400;
            return { error: parsed.error.issues };
          }

          try {
            const ingredient = await db.dishIngredient.update({
              where: { id: params.ingredientId },
              data: {
                quantity_required: body.quantity_required,
              },
            });

            return { message: "Ingredient updated successfully", data: ingredient };
          } catch (error) {
            if (
              error instanceof Prisma.PrismaClientKnownRequestError &&
              error.code === "P2025"
            ) {
              set.status = 404;
              return { message: "Ingredient not found" };
            }
            throw error;
          }
        },
        {
          body: t.Object({
            quantity_required: t.Number(),
          }),
        }
      )

      // DELETE /dish/:id/ingredients/:ingredientId — remove an ingredient from a dish
      .delete("/:ingredientId", async ({ params, set, db }) => {
        try {
          await db.dishIngredient.delete({
            where: { id: params.ingredientId },
          });

          return { message: "Ingredient removed successfully" };
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2025"
          ) {
            set.status = 404;
            return { message: "Ingredient not found" };
          }
          throw error;
        }
      })
  );
