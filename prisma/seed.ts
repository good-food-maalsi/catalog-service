import { PrismaClient } from "@prisma/client";
import { SEED_STOCK_IDS } from "./seed-constants.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  await prisma.dishIngredient.deleteMany();
  await prisma.dish.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.menuDiscount.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.category.deleteMany();

  const franchiseId =
    process.env.SEED_FRANCHISE_ID ?? "00000000-0000-0000-0000-000000000001";

  // ========== Catégories ==========
  const catBurgers = await prisma.category.create({
    data: {
      name: "Burgers",
      description: "Delicious juicy burgers with various toppings",
    },
  });
  const catPizzas = await prisma.category.create({
    data: {
      name: "Pizzas",
      description: "Freshly baked pizzas with premium ingredients",
    },
  });
  const catDrinks = await prisma.category.create({
    data: {
      name: "Drinks",
      description: "Refreshing beverages and drinks",
    },
  });
  const catDesserts = await prisma.category.create({
    data: {
      name: "Desserts",
      description: "Sweet treats and desserts",
    },
  });

  // ========== Un menu par catégorie ==========
  const menuBurgers = await prisma.menu.create({
    data: {
      name: "Menu Burgers",
      description: "Nos burgers et accompagnements",
      availability: true,
    },
  });
  const menuPizzas = await prisma.menu.create({
    data: {
      name: "Menu Pizzas",
      description: "Pizzas et formules",
      availability: true,
    },
  });
  const menuDrinks = await prisma.menu.create({
    data: {
      name: "Menu Boissons",
      description: "Boissons fraîches et chaudes",
      availability: true,
    },
  });
  const menuDesserts = await prisma.menu.create({
    data: {
      name: "Menu Desserts",
      description: "Pâtisseries et douceurs",
      availability: true,
    },
  });

  // Lien menu <-> catégorie (1 menu = 1 catégorie)
  await prisma.menuCategory.createMany({
    data: [
      { menuId: menuBurgers.id, categoryId: catBurgers.id },
      { menuId: menuPizzas.id, categoryId: catPizzas.id },
      { menuId: menuDrinks.id, categoryId: catDrinks.id },
      { menuId: menuDesserts.id, categoryId: catDesserts.id },
    ],
  });

  // ========== Plats par menu ==========

  // --- Menu Burgers ---
  const classicCheeseburger = await prisma.dish.create({
    data: {
      name: "Classic Cheeseburger",
      description:
        "Steak haché, cheddar, laitue, tomate et sauce maison",
      basePrice: 12.5,
      menuId: menuBurgers.id,
      franchiseId,
    },
  });
  const truffleFries = await prisma.dish.create({
    data: {
      name: "Frites truffe",
      description: "Frites croustillantes à l'huile de truffe et parmesan",
      basePrice: 6.0,
      menuId: menuBurgers.id,
      franchiseId,
    },
  });
  const cocaBurgers = await prisma.dish.create({
    data: {
      name: "Coca Cola",
      description: "Canette 33cl",
      basePrice: 3.5,
      menuId: menuBurgers.id,
      franchiseId,
    },
  });

  // --- Menu Pizzas ---
  const margheritaPizza = await prisma.dish.create({
    data: {
      name: "Pizza Margherita",
      description:
        "Tomates San Marzano, mozzarella, basilic, huile d'olive",
      basePrice: 14.0,
      menuId: menuPizzas.id,
      franchiseId,
    },
  });
  const pepperoniPassion = await prisma.dish.create({
    data: {
      name: "Pepperoni Passion",
      description: "Pepperoni et mozzarella à volonté",
      basePrice: 16.5,
      menuId: menuPizzas.id,
      franchiseId,
    },
  });
  const cocaPizzas = await prisma.dish.create({
    data: {
      name: "Coca Cola",
      description: "Canette 33cl",
      basePrice: 3.5,
      menuId: menuPizzas.id,
      franchiseId,
    },
  });

  // --- Menu Boissons ---
  const cocaDrinks = await prisma.dish.create({
    data: {
      name: "Coca Cola",
      description: "Canette 33cl",
      basePrice: 3.5,
      menuId: menuDrinks.id,
      franchiseId,
    },
  });
  const lemonade = await prisma.dish.create({
    data: {
      name: "Limonade maison",
      description: "Limonade fraîche pressée",
      basePrice: 4.5,
      menuId: menuDrinks.id,
      franchiseId,
    },
  });
  const iceTea = await prisma.dish.create({
    data: {
      name: "Ice Tea pêche",
      description: "Thé glacé saveur pêche 33cl",
      basePrice: 4.0,
      menuId: menuDrinks.id,
      franchiseId,
    },
  });

  // --- Menu Desserts ---
  const chocolateLavaCake = await prisma.dish.create({
    data: {
      name: "Coulant chocolat",
      description: "Cœur coulant et chocolat chaud",
      basePrice: 8.0,
      menuId: menuDesserts.id,
      franchiseId,
    },
  });
  const cocaDesserts = await prisma.dish.create({
    data: {
      name: "Coca Cola",
      description: "Canette 33cl",
      basePrice: 3.5,
      menuId: menuDesserts.id,
      franchiseId,
    },
  });

  // ========== Ingrédients par plat (stock_id = SEED_STOCK_IDS) ==========
  const dishIngredients: Array<{
    dish_id: string;
    stock_id: string;
    quantity_required: number;
  }> = [
    { dish_id: classicCheeseburger.id, stock_id: SEED_STOCK_IDS.boeuf, quantity_required: 1 },
    { dish_id: classicCheeseburger.id, stock_id: SEED_STOCK_IDS.salade, quantity_required: 1 },
    { dish_id: classicCheeseburger.id, stock_id: SEED_STOCK_IDS.tomate, quantity_required: 1 },
    { dish_id: classicCheeseburger.id, stock_id: SEED_STOCK_IDS.fromage, quantity_required: 1 },
    { dish_id: truffleFries.id, stock_id: SEED_STOCK_IDS.fromage, quantity_required: 1 },
    { dish_id: margheritaPizza.id, stock_id: SEED_STOCK_IDS.tomate, quantity_required: 2 },
    { dish_id: margheritaPizza.id, stock_id: SEED_STOCK_IDS.fromage, quantity_required: 1 },
    { dish_id: pepperoniPassion.id, stock_id: SEED_STOCK_IDS.tomate, quantity_required: 1 },
    { dish_id: pepperoniPassion.id, stock_id: SEED_STOCK_IDS.fromage, quantity_required: 1 },
    { dish_id: pepperoniPassion.id, stock_id: SEED_STOCK_IDS.poulet, quantity_required: 1 },
    { dish_id: chocolateLavaCake.id, stock_id: SEED_STOCK_IDS.fromage, quantity_required: 1 },
  ];
  for (const di of dishIngredients) {
    await prisma.dishIngredient.create({ data: di });
  }

  console.log("Seeding finished.");
  console.log("  - 4 catégories, 4 menus (1 par catégorie)");
  console.log("  - Plats par menu + Coca Cola réutilisé dans chaque menu");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
