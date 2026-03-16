"use client";

import React from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { cn } from "@/lib/utils";

type FileUploadDemoProps = {
  onFilesChange?: (files: File[]) => void;
  className?: string;
};

export default function FileUploadDemo({
  onFilesChange,
  className,
}: FileUploadDemoProps) {
  return (
    <div
      className={cn(
        "mx-auto min-h-96 w-full max-w-4xl rounded-lg border border-dashed border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black",
        className,
      )}
    >
      <FileUpload onChange={(files) => onFilesChange?.(files)} />
    </div>
  );
}
