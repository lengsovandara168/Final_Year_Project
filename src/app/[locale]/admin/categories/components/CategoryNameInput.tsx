import { getBrandName } from "@/lib/models";

interface CategoryNameInputProps {
  selectedBrand: string | null;
  selectedModel: string | null;
  useCustomBrand: boolean;
  useCustomModel: boolean;
  useCustomName: boolean;
  customName: string;
  customBrandName: string;
  customModelName: string;
  onUseCustomNameChange: (useCustom: boolean) => void;
  onCustomNameChange: (name: string) => void;
}

export function CategoryNameInput({
  selectedBrand,
  selectedModel,
  useCustomBrand,
  useCustomModel,
  useCustomName,
  customName,
  customBrandName,
  customModelName,
  onUseCustomNameChange,
  onCustomNameChange,
}: CategoryNameInputProps) {
  const hasSelection = selectedBrand || useCustomBrand;

  if (!hasSelection) {
    return null;
  }

  const displayName = useCustomBrand
    ? customBrandName
    : useCustomModel
      ? customModelName
      : selectedModel
        ? `"${selectedModel}"`
        : selectedBrand
          ? `"${getBrandName(selectedBrand)}"`
          : "selected name";

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-zinc-700">
        Category Name
      </label>
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="nameSource"
              checked={!useCustomName}
              onChange={() => onUseCustomNameChange(false)}
              className="h-4 w-4 rounded border-zinc-300 cursor-pointer"
            />
            <span className="text-sm font-medium text-zinc-700">
              Use {displayName} as category name
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="nameSource"
              checked={useCustomName}
              onChange={() => onUseCustomNameChange(true)}
              className="h-4 w-4 rounded border-zinc-300 cursor-pointer"
            />
            <span className="text-sm font-medium text-zinc-700">
              Enter custom name
            </span>
          </label>
        </div>
      </div>

      {useCustomName && (
        <input
          value={customName}
          onChange={(event) => onCustomNameChange(event.target.value)}
          placeholder="e.g. Premium Smartphones"
          className="h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
        />
      )}
    </div>
  );
}
