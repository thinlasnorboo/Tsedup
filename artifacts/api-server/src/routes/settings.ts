import { Router, type IRouter } from "express";
import { db, bankDetailsTable, siteConfigTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/adminAuth";

const router: IRouter = Router();

const DEFAULT_BANK = {
  accountNo: "216001502780",
  holderName: "THINLAS NORBOO",
  ifscCode: "ICIC0003623",
  bankName: "ICICI Bank",
  upiId: null,
};

async function getOrSeedBank() {
  const rows = await db.select().from(bankDetailsTable).limit(1);
  if (rows.length === 0) {
    const [row] = await db.insert(bankDetailsTable).values(DEFAULT_BANK).returning();
    return row;
  }
  return rows[0];
}

// GET /api/bank-details — public
router.get("/bank-details", async (_req, res): Promise<void> => {
  const row = await getOrSeedBank();
  res.json(row);
});

// PATCH /api/bank-details — admin only
router.patch("/bank-details", requireAdmin, async (req, res): Promise<void> => {

  const row = await getOrSeedBank();
  const { accountNo, holderName, ifscCode, bankName, upiId } = req.body ?? {};
  const [updated] = await db
    .update(bankDetailsTable)
    .set({
      ...(accountNo && { accountNo }),
      ...(holderName && { holderName }),
      ...(ifscCode && { ifscCode }),
      ...(bankName && { bankName }),
      upiId: upiId ?? null,
      updatedAt: new Date(),
    })
    .where(eq(bankDetailsTable.id, row.id))
    .returning();
  res.json(updated);
});

// GET /api/layout — public
router.get("/layout", async (_req, res): Promise<void> => {
  const rows = await db.select().from(siteConfigTable).where(eq(siteConfigTable.key, "homepage_layout"));
  const defaultOrder = JSON.stringify(["stats", "services", "pricing", "map"]);
  res.json({ order: JSON.parse(rows[0]?.value ?? defaultOrder) });
});

// PATCH /api/layout — admin only
router.patch("/layout", requireAdmin, async (req, res): Promise<void> => {
  const { order } = req.body ?? {};
  if (!Array.isArray(order)) { res.status(400).json({ error: "order must be array" }); return; }
  const existing = await db.select().from(siteConfigTable).where(eq(siteConfigTable.key, "homepage_layout"));
  const value = JSON.stringify(order);
  if (existing.length === 0) {
    await db.insert(siteConfigTable).values({ key: "homepage_layout", value });
  } else {
    await db.update(siteConfigTable).set({ value }).where(eq(siteConfigTable.key, "homepage_layout"));
  }
  res.json({ order });
});

// GET /api/font — public
router.get("/font", async (_req, res): Promise<void> => {
  const rows = await db.select().from(siteConfigTable).where(eq(siteConfigTable.key, "site_font"));
  res.json({ font: rows[0]?.value ?? "Inter" });
});

// PATCH /api/font — admin only
router.patch("/font", requireAdmin, async (req, res): Promise<void> => {
  const { font } = req.body ?? {};
  if (!font) { res.status(400).json({ error: "font required" }); return; }
  const existing = await db.select().from(siteConfigTable).where(eq(siteConfigTable.key, "site_font"));
  if (existing.length === 0) {
    await db.insert(siteConfigTable).values({ key: "site_font", value: font });
  } else {
    await db.update(siteConfigTable).set({ value: font }).where(eq(siteConfigTable.key, "site_font"));
  }
  res.json({ font });
});

// GET /api/notice — public
router.get("/notice", async (_req, res): Promise<void> => {
  const rows = await db.select().from(siteConfigTable).where(eq(siteConfigTable.key, "notice"));
  res.json({ notice: rows[0]?.value ?? "" });
});

// PATCH /api/notice — admin only
router.patch("/notice", requireAdmin, async (req, res): Promise<void> => {
  const { notice } = req.body ?? {};
  const existing = await db.select().from(siteConfigTable).where(eq(siteConfigTable.key, "notice"));
  if (existing.length === 0) {
    await db.insert(siteConfigTable).values({ key: "notice", value: notice ?? "" });
  } else {
    await db.update(siteConfigTable).set({ value: notice ?? "" }).where(eq(siteConfigTable.key, "notice"));
  }
  res.json({ notice: notice ?? "" });
});

export default router;
