import { PrismaClient } from "@prisma/client";
// import { DiscountType } from "@prisma/client"; // commenté : seed sans discounts
import { SEED_STOCK_IDS } from "./seed-constants.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Clear existing data
  await prisma.dishIngredient.deleteMany();
  await prisma.dish.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.menuDiscount.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.category.deleteMany();

  // Create Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Burgers",
        description: "Delicious juicy burgers with various toppings",
      },
    }),
    prisma.category.create({
      data: {
        name: "Pizzas",
        description: "Freshly baked pizzas with premium ingredients",
      },
    }),
    prisma.category.create({
      data: {
        name: "Drinks",
        description: "Refreshing beverages and drinks",
      },
    }),
    prisma.category.create({
      data: {
        name: "Desserts",
        description: "Sweet treats and desserts",
      },
    }),
  ]);

  // Create Menus
  const mainLevelMenu = await prisma.menu.create({
    data: {
      name: "Main Menu",
      description: "Our standard menu available all day",
      availability: true,
    },
  });

  const lunchMenu = await prisma.menu.create({
    data: {
      name: "Lunch Special",
      description: "Special offers available starting from 11 AM to 3 PM",
      availability: true,
    },
  });

  // Link Menus and Categories
  for (const category of categories) {
    await prisma.menuCategory.create({
      data: {
        menuId: mainLevelMenu.id,
        categoryId: category.id,
      },
    });
  }

  // Create Discounts (commenté : seed menus/catégories/plats uniquement)
  // const summerSale = await prisma.discount.create({
  //   data: {
  //     name: "Summer Sale",
  //     code: "SUMMER20",
  //     description: "20% off on all items",
  //     type: DiscountType.PERCENTAGE,
  //     value: 20,
  //     dateFrom: new Date("2024-06-01"),
  //     dateTo: new Date("2024-08-31"),
  //   },
  // });
  // const welcomeOffer = await prisma.discount.create({
  //   data: {
  //     name: "Welcome Offer",
  //     code: "WELCOME5",
  //     description: "€5 off on your first order",
  //     type: DiscountType.FIXED_AMOUNT,
  //     value: 5,
  //     dateFrom: new Date("2024-01-01"),
  //     dateTo: new Date("2024-12-31"),
  //   },
  // });
  // await prisma.menuDiscount.create({
  //   data: {
  //     menuId: mainLevelMenu.id,
  //     discountId: summerSale.id,
  //   },
  // });

  // Create Dishes (one by one to get ids for DishIngredient)
  // Aligné avec la franchise seedée quand le script purge-and-seed passe SEED_FRANCHISE_ID
  const franchiseId =
    process.env.SEED_FRANCHISE_ID ?? "00000000-0000-0000-0000-000000000001";
  const classicCheeseburger = await prisma.dish.create({
    data: {
      name: "Classic Cheeseburger",
      description: "Beef patty, cheddar cheese, lettuce, tomato, and our secret sauce",
      basePrice: 12.5,
      menuId: mainLevelMenu.id,
      franchiseId,
    },
  });
  const margheritaPizza = await prisma.dish.create({
    data: {
      name: "Margherita Pizza",
      description: "San Marzano tomatoes, fresh mozzarella, basil, and extra virgin olive oil",
      basePrice: 14.0,
      menuId: mainLevelMenu.id,
      franchiseId,
    },
  });
  const pepperoniPassion = await prisma.dish.create({
    data: {
      name: "Pepperoni Passion",
      description: "Loads of pepperoni and mozzarella",
      basePrice: 16.5,
      menuId: mainLevelMenu.id,
      franchiseId,
    },
  });
  const truffleFries = await prisma.dish.create({
    data: {
      name: "Truffle Fries",
      description: "Crispy fries tossed in truffle oil and parmesan",
      basePrice: 6.0,
      menuId: mainLevelMenu.id,
      franchiseId,
    },
  });
  const chocolateLavaCake = await prisma.dish.create({
    data: {
      name: "Chocolate Lava Cake",
      description: "Warm chocolate cake with a gooey center",
      basePrice: 8.0,
      menuId: mainLevelMenu.id,
      franchiseId,
    },
  });
  await prisma.dish.create({
    data: {
      name: "Classic Lemonade",
      description: "House-made fresh lemonade",
      basePrice: 4.5,
      menuId: mainLevelMenu.id,
      franchiseId,
    },
  });

  // DishIngredient: ingrédients nécessaires par plat (stock_id = SEED_STOCK_IDS)
  const dishIngredients: Array<{ dish_id: string; stock_id: string; quantity_required: number }> = [
    { dish_id: classicCheeseburger.id, stock_id: SEED_STOCK_IDS.boeuf, quantity_required: 1 },
    { dish_id: classicCheeseburger.id, stock_id: SEED_STOCK_IDS.salade, quantity_required: 1 },
    { dish_id: classicCheeseburger.id, stock_id: SEED_STOCK_IDS.tomate, quantity_required: 1 },
    { dish_id: classicCheeseburger.id, stock_id: SEED_STOCK_IDS.fromage, quantity_required: 1 },
    { dish_id: margheritaPizza.id, stock_id: SEED_STOCK_IDS.tomate, quantity_required: 2 },
    { dish_id: margheritaPizza.id, stock_id: SEED_STOCK_IDS.fromage, quantity_required: 1 },
    { dish_id: pepperoniPassion.id, stock_id: SEED_STOCK_IDS.tomate, quantity_required: 1 },
    { dish_id: pepperoniPassion.id, stock_id: SEED_STOCK_IDS.fromage, quantity_required: 1 },
    { dish_id: pepperoniPassion.id, stock_id: SEED_STOCK_IDS.poulet, quantity_required: 1 },
    { dish_id: truffleFries.id, stock_id: SEED_STOCK_IDS.fromage, quantity_required: 1 },
    { dish_id: chocolateLavaCake.id, stock_id: SEED_STOCK_IDS.fromage, quantity_required: 1 },
  ];
  for (const di of dishIngredients) {
    await prisma.dishIngredient.create({ data: di });
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
