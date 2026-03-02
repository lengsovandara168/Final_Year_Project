interface FormMessageProps {
  message: string | null;
  type: "error" | "success";
}

export function FormMessage({ message, type }: FormMessageProps) {
  if (!message) {
    return null;
  }

  const styles =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <div className={`rounded-2xl border ${styles} px-4 py-3 text-sm`}>
      {message}
    </div>
  );
}
