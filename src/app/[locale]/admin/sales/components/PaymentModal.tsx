import { Clock3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { KhqrCode } from "@/components/khqr-code";

export type PosPaymentSession = {
  paymentId: string;
  orderNumber: string;
  amount: number;
  currency: "USD" | "KHR";
  qrString: string;
  expiresAt: string;
  status: string;
};

interface PaymentModalProps {
  paymentSession: PosPaymentSession | null;
  remainingMs: number | null;
  isCancelling?: boolean;
  onCheckStatus: (paymentId: string) => void;
  onCancel: () => void | Promise<void>;
}

export function PaymentModal({
  paymentSession,
  remainingMs,
  isCancelling = false,
  onCheckStatus,
  onCancel,
}: PaymentModalProps) {
  if (!paymentSession) return null;
  const amount = paymentSession.amount || 0;

  return (
    <Dialog
      open={!!paymentSession}
      onOpenChange={(isOpen) => !isOpen && onCancel()}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl">Bakong Checkout</DialogTitle>
          <DialogDescription>
            Scan the QR code below to complete the payment.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          <div className="rounded-xl border-2 p-4 bg-white shadow-sm">
            <KhqrCode
              value={paymentSession.qrString}
              size={240}
              amountLabel={`$${paymentSession.amount.toFixed(2)}`}
            />
          </div>

          <div className="text-center space-y-1 w-full">
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
              Amount Due
            </p>
            <p className="text-4xl font-bold text-primary">
              ${amount.toFixed(2)}
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-medium mt-2">
              <Clock3 className="h-4 w-4" /> Expires in{" "}
              {Math.ceil((remainingMs || 0) / 1000)}s
            </div>
          </div>

          <div className="w-full space-y-3 pt-4 border-t">
            <Button
              className="w-full h-12 text-md"
              onClick={() => onCheckStatus(paymentSession.paymentId)}
              disabled={isCancelling}
            >
              Check Payment Status
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 text-md"
              onClick={onCancel}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Cancel Transaction"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
