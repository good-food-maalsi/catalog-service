import Elysia from "elysia";
import {Prisma} from "@prisma/client";

export const DishController = new Elysia().group('/dish', (app) =>

    // Create Dish Controller
    app.post('/',
        async ({ body, set, db }) => {
        console.log(body);
        db.dish.create({
            data: {
                name: body.name,
            },//Prisma.DishCreateInput
        })
        return { message: 'create Dish' };
    }),
);