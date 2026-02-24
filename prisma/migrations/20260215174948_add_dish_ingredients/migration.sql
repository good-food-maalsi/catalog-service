-- CreateTable
CREATE TABLE "dish_ingredients" (
    "id" UUID NOT NULL,
    "dish_id" UUID NOT NULL,
    "stock_id" UUID NOT NULL,
    "quantity_required" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dish_ingredients_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "dish_ingredients" ADD CONSTRAINT "dish_ingredients_dish_id_fkey" FOREIGN KEY ("dish_id") REFERENCES "Dish"("id") ON DELETE CASCADE ON UPDATE CASCADE;
