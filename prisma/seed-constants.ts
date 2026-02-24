/**
 * UUID fixes partagés entre la seed franchise (StockFranchise) et la seed catalog (DishIngredient).
 * À garder synchronisé avec franchise-service/prisma/seed-constants.ts
 */
export const SEED_STOCK_IDS = {
  tomate: "a1000000-0000-0000-0000-000000000001",
  salade: "a1000000-0000-0000-0000-000000000002",
  boeuf: "a1000000-0000-0000-0000-000000000003",
  poulet: "a1000000-0000-0000-0000-000000000004",
  fromage: "a1000000-0000-0000-0000-000000000005",
} as const;
