"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter as useLocaleRouter } from "@/i18n/routing";
import {
  useProductSearch,
  type SearchSuggestion,
} from "@/hooks/use-product-search";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2, Search as SearchIcon, X } from "lucide-react";

type SearchSuggestionsDropdownProps = {
  accessToken: string;
  placeholder?: string;
  onSelect?: (suggestion: SearchSuggestion) => void;
  className?: string;
};

export default function SearchSuggestionsDropdown({
  accessToken,
  placeholder = "Search by brand or product name...",
  onSelect,
  className = "",
}: SearchSuggestionsDropdownProps) {
  const MIN_QUERY_LENGTH = 2;
  const router = useLocaleRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { suggestions, isLoading, search, clear } =
    useProductSearch(accessToken);

  const handleInputChange = (value: string) => {
    setQuery(value);
    const normalized = value.trim();

    if (normalized.length < MIN_QUERY_LENGTH) {
      clear();
      setIsOpen(false);
      return;
    }

    search(normalized);
    setIsOpen(true);
  };

  const handleClear = () => {
    setQuery("");
    clear();
    setIsOpen(false);
  };

  const buildSearchParams = (value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", "1");

    const trimmed = value.trim();
    if (trimmed) {
      nextParams.set("search", trimmed);
    } else {
      nextParams.delete("search");
    }

    return nextParams.toString();
  };

  const pushSearch = (value: string) => {
    const query = buildSearchParams(value);
    router.push(query ? `/users?${query}` : "/users", { scroll: false });
  };

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    if (onSelect) {
      onSelect(suggestion);
    }
    pushSearch(suggestion.name);
    setQuery("");
    clear();
    setIsOpen(false);
  };

  const handleSearch = () => {
    if (query.trim()) {
      pushSearch(query);
      setQuery("");
      clear();
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      handleClear();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className={cn("relative w-full", className)} onClick={(e) => e.stopPropagation()}>
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <SearchIcon className="h-4 w-4" />
        </div>

        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length >= MIN_QUERY_LENGTH && setIsOpen(true)}
          className="h-10 rounded-xl border-gray-300 bg-white pl-10 pr-10 shadow-xs transition-all focus-visible:border-gray-400 focus-visible:ring-1 focus-visible:ring-black/20"
        />

        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-xl">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 p-5">
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
              <span className="text-sm text-gray-500">Searching...</span>
            </div>
          )}

          {!isLoading && suggestions.length === 0 && query && (
            <div className="p-5 text-center text-sm text-gray-500">
              {query.trim().length < MIN_QUERY_LENGTH
                ? `Type at least ${MIN_QUERY_LENGTH} characters`
                : `No products found for "${query.trim()}"`}
            </div>
          )}

          {!isLoading && suggestions.length > 0 && (
            <>
              <div className="border-b border-gray-300 bg-gray-50/80 px-3 py-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                {suggestions.length} suggestion
                {suggestions.length > 1 ? "s" : ""}
              </div>

              <div className="max-h-80 overflow-y-auto p-1.5">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="group flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-gray-50"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-300 bg-gray-100">
                      {suggestion.image ? (
                        <img
                          src={suggestion.image}
                          alt={suggestion.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          <SearchIcon className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {suggestion.name}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="text-xs font-semibold text-gray-700">
                          ${suggestion.price.toFixed(2)}
                        </p>
                        {suggestion.brandName && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                            {suggestion.brandName}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500" />
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-300 bg-gray-50 p-2">
                <Button
                  onClick={handleSearch}
                  className="h-9 w-full rounded-lg bg-black text-sm text-white hover:bg-gray-800"
                  size="sm"
                >
                  View all results for "{query}"
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
