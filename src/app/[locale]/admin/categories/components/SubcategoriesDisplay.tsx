import { Loader2, ImageIcon } from "lucide-react";
import { type CategoryBoardGroup } from "@/lib/api";

interface SubcategoriesDisplayProps {
  groups: CategoryBoardGroup[];
  isFetching: boolean;
}

export function SubcategoriesDisplay({
  groups,
  isFetching,
}: SubcategoriesDisplayProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
        Current Subcategories
      </h2>
      {isFetching ? (
        <div className="flex items-center text-sm text-zinc-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading categories...
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {groups.map((group) => (
            <div
              key={group.key}
              className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-6 py-5">
                <h3 className="text-2xl font-bold text-zinc-900">
                  {group.name}
                </h3>
                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-zinc-200 bg-white px-2 text-sm font-medium text-zinc-400">
                  {group.total}
                </span>
              </div>
              <div className="min-h-35 space-y-3 px-6 py-5">
                {group.total === 0 ? (
                  <p className="text-base italic text-zinc-400">
                    No subcategories yet.
                  </p>
                ) : (
                  group.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      {item.iconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.iconUrl}
                          alt={`${item.name} icon`}
                          className="h-8 w-8 rounded-lg border border-zinc-100 bg-zinc-50 object-contain p-1"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-100 bg-zinc-50 text-zinc-400">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">
                          {item.name}
                        </p>
                        <p className="text-[11px] font-mono text-zinc-400">
                          {item.slug}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
