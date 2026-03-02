import { ChevronDown } from "lucide-react";
import { type ParentCategory } from "@/lib/api";

interface ParentCategorySelectProps {
  parentCategory: ParentCategory;
  onParentCategoryChange: (category: ParentCategory) => void;
}

export function ParentCategorySelect({
  parentCategory,
  onParentCategoryChange,
}: ParentCategorySelectProps) {
  return (
    <div className="space-y-2">
      <label
        className="text-sm font-semibold text-zinc-700"
        htmlFor="parentCategory"
      >
        Parent Category
      </label>
      <div className="relative">
        <select
          id="parentCategory"
          value={parentCategory}
          onChange={(event) => {
            onParentCategoryChange(event.target.value as ParentCategory);
          }}
          className="h-14 w-full appearance-none rounded-2xl border border-zinc-200 bg-zinc-50 px-5 text-base font-medium text-zinc-900 outline-none transition focus:ring-2 focus:ring-zinc-900/10"
        >
          <option value="phones">Phones</option>
          <option value="tablets">Tablets</option>
          <option value="accessories">Accessories</option>
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-5 h-5 w-5 -translate-y-1/2 text-zinc-400" />
      </div>
    </div>
  );
}
