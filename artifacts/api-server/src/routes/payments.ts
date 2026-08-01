import { Router, type IRouter } from "express";
import { db, paymentsTable, bankDetailsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/adminAuth";

const router: IRouter = Router();

// POST /api/payments/claim — customer submits cashback claim
router.post("/payments/claim", async (req, res): Promise<void> => {
  const { customerName, customerUpiId, amount } = req.body ?? {};
  if (!customerName || !customerUpiId || !amount || isNaN(Number(amount)) || Number(amount) < 1) {
    res.status(400).json({ error: "customerName, customerUpiId aur valid amount zaroori hai" });
    return;
  }
  const amtInt = Math.round(Number(amount));
  const cashback = Math.round(amtInt * 0.02); // 2%
  const [row] = await db.insert(paymentsTable).values({
    customerName,
    customerUpiId,
    amount: amtInt,
    cashbackAmount: cashback,
    status: "pending",
  }).returning();
  res.status(201).json(row);
});

// GET /api/payments — admin only — list all claims
router.get("/payments", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.select().from(paymentsTable).orderBy(desc(paymentsTable.createdAt));
  res.json(rows);
});

// PATCH /api/payments/:id — admin update status
router.patch("/payments/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { status, note } = req.body ?? {};
  if (!["pending", "paid", "rejected"].includes(status)) {
    res.status(400).json({ error: "status must be pending | paid | rejected" }); return;
  }
  const [updated] = await db.update(paymentsTable)
    .set({ status, ...(note !== undefined && { note }) })
    .where(eq(paymentsTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

export default router;
