interface SlugInputProps {
  slug: string;
  onSlugChange: (slug: string) => void;
}

export function SlugInput({ slug, onSlugChange }: SlugInputProps) {
  return (
    <div className="space-y-2">
      <label
        className="text-sm font-semibold text-zinc-700"
        htmlFor="slug"
      >
        Slug (auto-generated)
      </label>
      <input
        id="slug"
        value={slug}
        onChange={(event) => onSlugChange(event.target.value)}
        placeholder="auto-generated from name"
        className="h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 font-mono text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
      />
    </div>
  );
}
