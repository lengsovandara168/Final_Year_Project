import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function CashPaymentModal({
  open,
  onOpenChange,
  total,
  loading,
  onConfirm,
}: any) {
  const [received, setReceived] = useState<string>("");
  const receivedNum = parseFloat(received) || 0;
  const change = receivedNum - total;

  useEffect(() => {
    if (!open) {
      setReceived("");
    }
  }, [open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setReceived("");
    }

    onOpenChange(nextOpen);
  };

  const handleConfirm = () => {
    setReceived("");
    onConfirm(receivedNum);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-center">Cash Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="text-center bg-muted/30 py-4 rounded-xl border border-dashed">
            <p className="text-xs text-muted-foreground uppercase font-bold">
              Total Amount
            </p>
            <p className="text-4xl font-black text-primary">
              ${total.toFixed(2)}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Cash Received ($)</Label>
            <Input
              type="number"
              className="text-2xl h-16 text-center font-bold"
              value={received}
              onChange={(e) => setReceived(e.target.value)}
              autoFocus
            />
          </div>
          <div
            className={`p-4 rounded-xl border-2 text-center transition-all ${change >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-muted"}`}
          >
            <p className="text-xs font-bold uppercase">Change Due</p>
            <p
              className={`text-3xl font-black ${change >= 0 ? "text-emerald-600" : ""}`}
            >
              ${Math.max(0, change).toFixed(2)}
            </p>
          </div>
          <Button
            className="w-full h-14 text-lg font-bold"
            disabled={receivedNum < total || loading}
            onClick={handleConfirm}
          >
            Complete Sale & Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
