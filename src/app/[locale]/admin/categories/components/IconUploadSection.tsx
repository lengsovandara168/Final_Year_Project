import {
  CheckCircle2,
  ImageIcon,
  ImagePlus,
  Loader2,
} from "lucide-react";

const ICON_ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml,image/avif";
const MAX_ICON_SIZE_BYTES = 5 * 1024 * 1024;

interface IconUploadSectionProps {
  selectedIconName: string | null;
  iconPreviewUrl: string | null;
  iconUrl: string | null;
  iconKey: string | null;
  isUploadingIcon: boolean;
  onFileSelect: (file: File) => Promise<void>;
}

export function IconUploadSection({
  selectedIconName,
  iconPreviewUrl,
  iconUrl,
  iconKey,
  isUploadingIcon,
  onFileSelect,
}: IconUploadSectionProps) {
  return (
    <>
      <div className="space-y-2">
        <label
          className="text-sm font-semibold text-zinc-700"
          htmlFor="icon-upload"
        >
          Icon File (max 5MB)
        </label>
        <input
          id="icon-upload"
          type="file"
          accept={ICON_ACCEPT}
          className="sr-only"
          onChange={async (event) => {
            const inputElement = event.currentTarget;
            const file = event.target.files?.[0] ?? null;
            if (file) {
              await onFileSelect(file);
            }
            inputElement.value = "";
          }}
        />
        <label
          htmlFor="icon-upload"
          className="group flex min-h-32 cursor-pointer flex-col items-center justify-center gap-5 rounded-3xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 text-center transition-colors hover:border-zinc-400"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-200 text-zinc-500 transition-colors group-hover:bg-zinc-300">
            {isUploadingIcon ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <ImageIcon className="h-8 w-8" />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-semibold text-zinc-900">
              {selectedIconName ? "Change Icon" : "Choose Icon"}
            </p>
            <p className="text-base text-zinc-400">
              PNG, JPEG, WEBP, SVG, AVIF. Up to 5MB.
            </p>
          </div>
        </label>
        {selectedIconName ? (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-900">
                  {selectedIconName}
                </p>
                <p className="text-xs text-zinc-500">
                  {isUploadingIcon
                    ? "Uploading..."
                    : iconKey
                      ? "Uploaded and ready"
                      : "Not uploaded"}
                </p>
              </div>
              {iconKey && !isUploadingIcon ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : isUploadingIcon ? (
                <ImagePlus className="h-5 w-5 text-zinc-500" />
              ) : null}
            </div>
            {iconPreviewUrl || iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={iconUrl ?? iconPreviewUrl ?? ""}
                alt="Selected category icon preview"
                className="mt-4 h-20 w-20 rounded-xl border border-zinc-200 bg-white object-contain p-1"
              />
            ) : null}
          </div>
        ) : null}
      </div>

      {iconKey ? (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm">
          <p className="font-semibold text-zinc-800">Uploaded icon key</p>
          <p className="break-all text-zinc-500">{iconKey}</p>
        </div>
      ) : null}
    </>
  );
}
