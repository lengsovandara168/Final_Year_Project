import { ChevronDown } from "lucide-react";
import { type ParentCategory } from "@/lib/api";

interface Brand {
  key: string;
  name: string;
}

interface BrandSelectorProps {
  parentCategory: ParentCategory;
  selectedBrand: string | null;
  useCustomBrand: boolean;
  customBrandName: string;
  availableBrands: Brand[];
  onBrandChange: (brand: string | null) => void;
  onUseCustomBrandChange: (useCustom: boolean) => void;
  onCustomBrandNameChange: (name: string) => void;
}

export function BrandSelector({
  parentCategory,
  selectedBrand,
  useCustomBrand,
  customBrandName,
  availableBrands,
  onBrandChange,
  onUseCustomBrandChange,
  onCustomBrandNameChange,
}: BrandSelectorProps) {
  return (
    <>
      {/* Existing Brand Select */}
      <div className="space-y-2">
        <label
          className="text-sm font-semibold text-zinc-700"
          htmlFor="brand"
        >
          Brand
        </label>
        <div className="relative">
          <select
            id="brand"
            value={selectedBrand || ""}
            onChange={(event) => {
              onBrandChange(event.target.value || null);
            }}
            className="h-14 w-full appearance-none rounded-2xl border border-zinc-200 bg-zinc-50 px-5 text-base font-medium text-zinc-900 outline-none transition focus:ring-2 focus:ring-zinc-900/10"
          >
            <option value="">Select a brand</option>
            {availableBrands.map(({ key, name }) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-5 h-5 w-5 -translate-y-1/2 text-zinc-400" />
        </div>
      </div>

      {/* Brand Source Selection */}
      <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="brandSource"
            checked={!useCustomBrand}
            onChange={() => {
              onUseCustomBrandChange(false);
              onCustomBrandNameChange("");
            }}
            className="h-4 w-4 rounded border-zinc-300 cursor-pointer"
          />
          <span className="text-sm font-medium text-zinc-700">
            Use existing brand
          </span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="brandSource"
            checked={useCustomBrand}
            onChange={() => onUseCustomBrandChange(true)}
            className="h-4 w-4 rounded border-zinc-300 cursor-pointer"
          />
          <span className="text-sm font-medium text-zinc-700">
            Add new brand
          </span>
        </label>

        {useCustomBrand && (
          <div className="space-y-2 pt-2 border-t border-zinc-200">
            <label
              className="text-xs font-semibold text-zinc-600"
              htmlFor="customBrand"
            >
              Brand Name
            </label>
            <input
              id="customBrand"
              value={customBrandName}
              onChange={(event) => onCustomBrandNameChange(event.target.value)}
              placeholder="e.g. Realme, Asus, etc."
              className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
            />
          </div>
        )}
      </div>
    </>
  );
}
