import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export type PageAlertState = {
  title: string;
  description: string;
  variant?: "default" | "destructive";
};

type PageAlertMessageProps = {
  alert: PageAlertState | null;
};

export function PageAlertMessage({ alert }: PageAlertMessageProps) {
  if (!alert) return null;

  return (
    <Alert variant={alert.variant} className="mb-6">
      {alert.variant === "destructive" ? (
        <AlertCircle className="h-4 w-4" />
      ) : (
        <CheckCircle2 className="h-4 w-4" />
      )}
      <AlertTitle>{alert.title}</AlertTitle>
      <AlertDescription>{alert.description}</AlertDescription>
    </Alert>
  );
}
