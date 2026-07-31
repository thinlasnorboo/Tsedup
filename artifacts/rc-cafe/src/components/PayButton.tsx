import { useState, useEffect } from "react";
import { X, Wallet, CheckCircle2, ArrowRight, Smartphone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = "amount" | "scan" | "claim" | "done";

const GOOGLE_REVIEW_URL = "https://g.page/r/CTwjCkOeiqqpEAE/review";

export function PayButton() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [merchantUpi, setMerchantUpi] = useState("khangltak-1@okaxis");
  const [merchantName, setMerchantName] = useState("Thinlay Nubu");

  useEffect(() => {
    fetch("/api/bank-details")
      .then(r => r.json())
      .then(d => {
        if (d.upiId) setMerchantUpi(d.upiId);
        if (d.holderName) setMerchantName(d.holderName);
      })
      .catch(() => {});
  }, []);

  const amtNum = parseFloat(amount);
  const cashback = isNaN(amtNum) ? 0 : Math.round(amtNum * 0.02);

  const gpayLink = `gpay://upi/pay?pa=${encodeURIComponent(merchantUpi)}&pn=${encodeURIComponent(merchantName)}&am=${amtNum || ""}&cu=INR&tn=LA+RC+Cafe+Payment`;

  function reset() {
    setStep("amount");
    setAmount("");
    setName("");
    setUpiId("");
    setLoading(false);
  }

  async function handleClaim() {
    if (!name.trim() || !upiId.trim() || isNaN(amtNum) || amtNum < 1) return;
    setLoading(true);
    try {
      await fetch("/api/payments/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: name.trim(), customerUpiId: upiId.trim(), amount: Math.round(amtNum) }),
      });
      setStep("done");
    } catch {
      alert("Kuch gadbad ho gayi, dobara try karo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* ── Floating Buttons (bottom-right stack) ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

        {/* Google Review Button */}
        <a
          href={GOOGLE_REVIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-white text-gray-800 px-4 py-2.5 font-bold text-xs uppercase tracking-widest shadow-xl hover:bg-gray-100 active:scale-95 transition-all border border-gray-200"
          aria-label="Leave a Google Review"
        >
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          Review Us
        </a>

        {/* PAY Button */}
        <button
          onClick={() => { setOpen(true); reset(); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 font-bold uppercase tracking-widest text-sm shadow-xl hover:bg-primary/90 active:scale-95 transition-all"
          aria-label="Pay with UPI"
        >
          <Wallet className="w-4 h-4" />
          Pay
        </button>
      </div>

      {/* ── Modal Backdrop ── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) { setOpen(false); reset(); } }}
        >
          <div className="w-full max-w-sm bg-card border border-border text-foreground shadow-2xl flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="font-bold uppercase tracking-widest text-sm">UPI Payment</span>
              </div>
              <button onClick={() => { setOpen(false); reset(); }} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">

              {/* ── Step 1: Enter Amount ── */}
              {step === "amount" && (
                <>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Amount (Rs)</Label>
                    <Input
                      type="number"
                      min="1"
                      className="rounded-none text-2xl font-bold h-14 text-center"
                      placeholder="0"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      autoFocus
                    />
                  </div>
                  {amtNum > 0 && (
                    <div className="bg-primary/10 border border-primary/20 p-3 text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">2% Cashback milega</p>
                      <p className="text-2xl font-bold text-primary">Rs {cashback}</p>
                    </div>
                  )}
                  <Button
                    className="w-full rounded-none h-12 uppercase tracking-widest font-bold bg-primary hover:bg-primary/90"
                    disabled={!amtNum || amtNum < 1}
                    onClick={() => setStep("scan")}
                  >
                    Aage Badho <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </>
              )}

              {/* ── Step 2: Scan & Pay ── */}
              {step === "scan" && (
                <>
                  <div className="text-center space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Pay to</p>
                    <p className="font-bold text-lg">{merchantName}</p>
                    <p className="text-primary font-mono text-sm">{merchantUpi}</p>
                    <p className="text-3xl font-bold font-serif text-primary mt-2">Rs {Math.round(amtNum)}</p>
                  </div>

                  {/* Real UPI QR Image */}
                  <div className="flex justify-center bg-white p-3 border border-border/50">
                    <img
                      src="/upi-qr.png"
                      alt="UPI QR Code — Scan to Pay"
                      className="w-44 h-44 object-contain"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Google Pay, PhonePe, ya kisi bhi UPI app se scan karo
                  </p>

                  {/* Direct GPay button */}
                  <a
                    href={gpayLink}
                    className="flex items-center justify-center gap-2 w-full h-12 bg-[#4285F4] hover:bg-[#3367d6] text-white font-bold uppercase tracking-widest text-sm transition-colors"
                  >
                    <Smartphone className="w-4 h-4" />
                    Google Pay se Pay Karo
                  </a>

                  <Button
                    variant="outline"
                    className="w-full rounded-none h-10 uppercase tracking-widest text-xs font-bold border-primary/30 hover:bg-primary/10"
                    onClick={() => setStep("claim")}
                  >
                    Payment ho gayi? Cashback Claim Karo →
                  </Button>
                  <button onClick={() => setStep("amount")} className="text-xs text-muted-foreground underline w-full text-center">← Amount badlo</button>
                </>
              )}

              {/* ── Step 3: Claim 2% Cashback ── */}
              {step === "claim" && (
                <>
                  <div className="bg-primary/10 border border-primary/20 p-3 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Aapka 2% Cashback</p>
                    <p className="text-3xl font-bold text-primary">Rs {cashback}</p>
                    <p className="text-xs text-muted-foreground mt-1">Rs {Math.round(amtNum)} ki payment par</p>
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Aapka Naam *</Label>
                    <Input className="rounded-none" placeholder="Jaise: Ali Raza" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Aapka UPI ID *</Label>
                    <Input className="rounded-none font-mono" placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)} />
                    <p className="text-xs text-muted-foreground mt-1">Is UPI ID par cashback bheja jaega</p>
                  </div>
                  <Button
                    className="w-full rounded-none h-12 uppercase tracking-widest font-bold bg-primary hover:bg-primary/90"
                    disabled={!name.trim() || !upiId.trim() || loading}
                    onClick={handleClaim}
                  >
                    {loading ? "Submit ho raha hai..." : "Cashback Claim Karo"}
                  </Button>
                  <button onClick={() => setStep("scan")} className="text-xs text-muted-foreground underline w-full text-center">← Wapas QR pe jao</button>
                </>
              )}

              {/* ── Step 4: Done ── */}
              {step === "done" && (
                <div className="text-center py-4 space-y-4">
                  <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-wide mb-2">Shukriya!</h3>
                    <p className="text-muted-foreground text-sm">Aapka cashback claim mil gaya.</p>
                    <p className="text-primary font-bold text-lg mt-2">Rs {cashback} jald aapke UPI par aa jaega!</p>
                  </div>
                  <Button
                    className="w-full rounded-none h-11 uppercase tracking-widest font-bold bg-primary hover:bg-primary/90"
                    onClick={() => { setOpen(false); reset(); }}
                  >
                    Theek Hai
                  </Button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
