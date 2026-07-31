import { Router, type IRouter } from "express";
import { db, visitsTable } from "@workspace/db";
import { count, eq, sql } from "drizzle-orm";

const router: IRouter = Router();

router.post("/visits", async (_req, res): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];
  await db.insert(visitsTable).values({ date: today });
  res.json({ ok: true });
});

router.get("/visits/stats", async (_req, res): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];
  const [totalRes] = await db.select({ count: count() }).from(visitsTable);
  const [todayRes] = await db.select({ count: count() }).from(visitsTable).where(eq(visitsTable.date, today));
  res.json({
    totalVisits: totalRes?.count ?? 0,
    todayVisits: todayRes?.count ?? 0,
  });
});

export default router;
