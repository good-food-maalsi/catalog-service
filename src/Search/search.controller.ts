import { Elysia, t } from "elysia";
import { prismaPlugin } from "../Plugin/prisma.js";

const SEARCH_MAX_LENGTH = 200;

function sanitizeSearch(value: string | undefined): string | undefined {
  if (value == null || typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  return trimmed.length > SEARCH_MAX_LENGTH
    ? trimmed.slice(0, SEARCH_MAX_LENGTH)
    : trimmed;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const SearchController = new Elysia()
  .use(prismaPlugin)
  .get(
    "/search",
    async ({ db, query, set }) => {
      const q = sanitizeSearch(query.q);
      const franchiseId =
        query.franchiseId && UUID_REGEX.test(query.franchiseId)
          ? query.franchiseId
          : undefined;

      if (query.franchiseId != null && query.franchiseId !== "" && !franchiseId) {
        set.status = 400;
        return { message: "Invalid franchiseId format (UUID expected)" };
      }

      if (!q) {
        return {
          data: {
            dishes: [],
            menus: [],
          },
        };
      }

      const dishWhere = {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
        ],
        ...(franchiseId && { franchiseId }),
      };

      const menuIdsForFranchise = franchiseId
        ? (
            await db.dish.findMany({
              where: { franchiseId },
              select: { menuId: true },
              distinct: ["menuId"],
            })
          )
            .map((d) => d.menuId)
            .filter((id): id is string => id != null)
        : null;

      const menuWhere = {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
        ],
        ...(menuIdsForFranchise !== null && { id: { in: menuIdsForFranchise } }),
      };

      const [dishes, menus] = await Promise.all([
        db.dish.findMany({
          where: dishWhere,
          include: { Menu: true },
        }),
        db.menu.findMany({
          where: menuWhere,
        }),
      ]);

      return {
        data: {
          dishes,
          menus,
        },
      };
    },
    {
      query: t.Object({
        q: t.Optional(t.String()),
        franchiseId: t.Optional(t.String()),
      }),
    }
  );
