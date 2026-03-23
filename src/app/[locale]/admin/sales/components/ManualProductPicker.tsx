import { PosCatalogItem } from "@/lib/api/pos";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type ManualProductPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search: string;
  onSearchChange: (value: string) => void;
  loading: boolean;
  products: PosCatalogItem[];
  onAdd: (product: PosCatalogItem) => void;
  triggerLabel?: string;
  searchPlaceholder?: string;
  loadingText?: string;
  emptyText?: string;
  addButtonText?: string;
};

export function ManualProductPicker({
  open,
  onOpenChange,
  search,
  onSearchChange,
  loading,
  products,
  onAdd,
  triggerLabel = "+ Add Manually",
  searchPlaceholder = "Search product name or IMEI...",
  loadingText = "Loading products...",
  emptyText = "No products found.",
  addButtonText = "Add",
}: ManualProductPickerProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" type="button" className="h-10">
          {triggerLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={onSearchChange}
          />
          <CommandList>
            {loading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {loadingText}
              </div>
            )}

            {!loading && products.length === 0 && (
              <CommandEmpty>{emptyText}</CommandEmpty>
            )}

            {!loading && (
              <CommandGroup>
                {products.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.id}
                    onSelect={() => onAdd(product)}
                    className="flex cursor-pointer items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {product.imei}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 text-xs"
                      type="button"
                    >
                      {addButtonText}
                    </Button>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
