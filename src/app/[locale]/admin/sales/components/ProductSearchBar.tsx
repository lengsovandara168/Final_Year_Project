import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon } from "lucide-react";
import React, { useRef, useEffect } from "react";

interface ProductSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onBarcodeScan: (barcode: string) => void;
  onFocusNext?: () => void;
  placeholder?: string;
  ariaLabel?: string;
}

export const ProductSearchBar: React.FC<ProductSearchBarProps> = ({
  value,
  onChange,
  onBarcodeScan,
  onFocusNext,
  placeholder = "Search or scan barcode...",
  ariaLabel = "Product search or barcode",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle Enter for barcode scan
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      onBarcodeScan(value.trim());
      onChange("");
      if (onFocusNext) onFocusNext();
    }
  };

  return (
    <InputGroup>
      <InputGroupInput
        ref={inputRef}
        className="flex-1 border rounded px-3 py-2 text-base"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
      />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
    </InputGroup>
  );
};
