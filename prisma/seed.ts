import { PrismaClient, DiscountType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Clear existing data
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

  // Create Discounts
  const summerSale = await prisma.discount.create({
    data: {
      name: "Summer Sale",
      code: "SUMMER20",
      description: "20% off on all items",
      type: DiscountType.PERCENTAGE,
      value: 20,
      dateFrom: new Date("2024-06-01"),
      dateTo: new Date("2024-08-31"),
    },
  });

  const welcomeOffer = await prisma.discount.create({
    data: {
      name: "Welcome Offer",
      code: "WELCOME5",
      description: "€5 off on your first order",
      type: DiscountType.FIXED_AMOUNT,
      value: 5,
      dateFrom: new Date("2024-01-01"),
      dateTo: new Date("2024-12-31"),
    },
  });

  // Link Menus and Discounts
  await prisma.menuDiscount.create({
    data: {
      menuId: mainLevelMenu.id,
      discountId: summerSale.id,
    },
  });

  // Create Dishes
  const dishes = [
    {
      name: "Classic Cheeseburger",
      description: "Beef patty, cheddar cheese, lettuce, tomato, and our secret sauce",
      basePrice: 12.5,
      menuId: mainLevelMenu.id,
      franchiseId: "00000000-0000-0000-0000-000000000001",
    },
    {
      name: "Margherita Pizza",
      description: "San Marzano tomatoes, fresh mozzarella, basil, and extra virgin olive oil",
      basePrice: 14.0,
      menuId: mainLevelMenu.id,
      franchiseId: "00000000-0000-0000-0000-000000000001",
    },
    {
      name: "Pepperoni Passion",
      description: "Loads of pepperoni and mozzarella",
      basePrice: 16.5,
      menuId: mainLevelMenu.id,
      franchiseId: "00000000-0000-0000-0000-000000000001",
    },
    {
      name: "Truffle Fries",
      description: "Crispy fries tossed in truffle oil and parmesan",
      basePrice: 6.0,
      menuId: mainLevelMenu.id,
      franchiseId: "00000000-0000-0000-0000-000000000001",
    },
    {
      name: "Chocolate Lava Cake",
      description: "Warm chocolate cake with a gooey center",
      basePrice: 8.0,
      menuId: mainLevelMenu.id,
      franchiseId: "00000000-0000-0000-0000-000000000001",
    },
    {
      name: "Classic Lemonade",
      description: "House-made fresh lemonade",
      basePrice: 4.5,
      menuId: mainLevelMenu.id,
      franchiseId: "00000000-0000-0000-0000-000000000001",
    },
  ];

  for (const dish of dishes) {
    await prisma.dish.create({
      data: dish,
    });
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
