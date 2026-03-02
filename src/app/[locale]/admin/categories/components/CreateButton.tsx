import { Loader2 } from "lucide-react";

interface CreateButtonProps {
  isLoading: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

export function CreateButton({
  isLoading,
  isDisabled,
  onClick,
}: CreateButtonProps) {
  return (
    <div className="pt-1">
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading || isDisabled}
        className="inline-flex h-14 items-center justify-center rounded-2xl bg-zinc-900 px-10 text-lg font-semibold text-white shadow-lg shadow-zinc-900/10 transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : null}
        Create Subcategory
      </button>
    </div>
  );
}
