import { ChevronDown } from "lucide-react";
import { type ParentCategory } from "@/lib/api";

interface Model {
  name: string;
  slug: string;
}

interface ModelSelectorProps {
  selectedBrand: string | null;
  selectedModel: string | null;
  useCustomModel: boolean;
  customModelName: string;
  availableModels: Model[];
  onModelChange: (model: string | null) => void;
  onUseCustomModelChange: (useCustom: boolean) => void;
  onCustomModelNameChange: (name: string) => void;
}

export function ModelSelector({
  selectedBrand,
  selectedModel,
  useCustomModel,
  customModelName,
  availableModels,
  onModelChange,
  onUseCustomModelChange,
  onCustomModelNameChange,
}: ModelSelectorProps) {
  if (!selectedBrand) {
    return null;
  }

  return (
    <>
      {/* Model Select */}
      <div className="space-y-2">
        <label
          className="text-sm font-semibold text-zinc-700"
          htmlFor="model"
        >
          Model
        </label>
        <div className="relative">
          <select
            id="model"
            value={selectedModel || ""}
            onChange={(event) =>
              onModelChange(event.target.value || null)
            }
            className="h-14 w-full appearance-none rounded-2xl border border-zinc-200 bg-zinc-50 px-5 text-base font-medium text-zinc-900 outline-none transition focus:ring-2 focus:ring-zinc-900/10"
          >
            <option value="">Select a model</option>
            {availableModels.map((model) => (
              <option key={model.slug} value={model.name}>
                {model.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-5 h-5 w-5 -translate-y-1/2 text-zinc-400" />
        </div>
      </div>

      {/* Model Source Selection */}
      <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="modelSource"
            checked={!useCustomModel}
            onChange={() => {
              onUseCustomModelChange(false);
              onCustomModelNameChange("");
            }}
            className="h-4 w-4 rounded border-zinc-300 cursor-pointer"
          />
          <span className="text-sm font-medium text-zinc-700">
            Use existing model
          </span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="modelSource"
            checked={useCustomModel}
            onChange={() => onUseCustomModelChange(true)}
            className="h-4 w-4 rounded border-zinc-300 cursor-pointer"
          />
          <span className="text-sm font-medium text-zinc-700">
            Add new model
          </span>
        </label>

        {useCustomModel && (
          <div className="space-y-2 pt-2 border-t border-zinc-200">
            <label
              className="text-xs font-semibold text-zinc-600"
              htmlFor="customModel"
            >
              Model Name
            </label>
            <input
              id="customModel"
              value={customModelName}
              onChange={(event) => onCustomModelNameChange(event.target.value)}
              placeholder="e.g. Galaxy S25, Note 20, etc."
              className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
            />
          </div>
        )}
      </div>
    </>
  );
}
