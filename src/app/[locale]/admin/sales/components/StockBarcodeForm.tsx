"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Loader2, Barcode, AlertCircle } from "lucide-react";
import {
  getModelsByCategory,
  getBrandName,
  type BrandModels,
  type Model,
} from "../../../../../lib/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StockBarcodeFormProps {
  onAddToBatchAction: (item: {
    productId: string;
    category: CategoryType;
    brand: string;
    model: string;
    quantity: number;
    imei?: string;
  }) => void;
  isLoading: boolean;
}

type CategoryType = "phones" | "tablets" | "accessories";

export function StockBarcodeForm({
  onAddToBatchAction,
  isLoading,
}: StockBarcodeFormProps) {
  const [barcode, setBarcode] = useState<string>("");
  const [barcodeError, setBarcodeError] = useState<string>("");
  const [category, setCategory] = useState<CategoryType>("phones");
  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [resolvedProductId, setResolvedProductId] = useState<string>("");
  const [scannedImei, setScannedImei] = useState<string>("");

  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);

  const categoryModels: BrandModels = getModelsByCategory(category);
  const brands = Object.keys(categoryModels);
  const selectedBrandModels = brand ? categoryModels[brand] || [] : [];

  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Parse barcode to extract product details
  const handleBarcodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const barcodeValue = e.target.value.trim();
    setBarcode(barcodeValue);
    setBarcodeError("");
    setResolvedProductId("");
    setScannedImei("");

    if (!barcodeValue) {
      return;
    }

    // IMEI format (most commonly 15 digits)
    if (/^\d{14,17}$/.test(barcodeValue)) {
      setScannedImei(barcodeValue);
      setCategory("phones");
      setBrand("");
      setModel("");
      setQuantity(1);

      setTimeout(() => {
        barcodeInputRef.current?.blur();
      }, 0);
      return;
    }

    // Barcode format: brand#model-slug (e.g., apple#iphone-15)
    const parts = barcodeValue.split("#");
    if (parts.length === 2) {
      const [brandKey, modelSlug] = parts;

      // Verify brand exists in any category
      let foundCategory: CategoryType | null = null;
      const categories: CategoryType[] = ["phones", "tablets", "accessories"];

      for (const cat of categories) {
        const models = getModelsByCategory(cat);
        if (models[brandKey]) {
          foundCategory = cat;
          break;
        }
      }

      if (!foundCategory) {
        setBarcodeError(`Brand "${brandKey}" not found`);
        return;
      }

      // Verify model exists for the brand
      const brandCategoryModels = getModelsByCategory(foundCategory);
      const brandModels = brandCategoryModels[brandKey] || [];
      const matchedModel = brandModels.find((m: Model) => m.slug === modelSlug);

      if (!matchedModel) {
        setBarcodeError(
          `Model "${modelSlug}" not found for brand "${brandKey}"`,
        );
        return;
      }

      // Auto-fill form
      setCategory(foundCategory);
      setBrand(brandKey);
      setModel(matchedModel.name);
      setQuantity(1);
      setResolvedProductId(`${brandKey}#${matchedModel.slug}`);
      setScannedImei("");

      // Focus quantity input
      setTimeout(() => {
        quantityInputRef.current?.focus();
      }, 0);
    } else {
      setBarcodeError(
        "Invalid barcode format. Use IMEI (digits) or brand#model-slug",
      );
    }
  };

  const handleAddToBatch = () => {
    if (!brand || !model || quantity < 1) {
      return;
    }

    if (!scannedImei) {
      setBarcodeError("Please scan IMEI first before adding to batch.");
      barcodeInputRef.current?.focus();
      return;
    }

    const productId =
      resolvedProductId ||
      `${brand}#${selectedBrandModels.find((m: Model) => m.name === model)?.slug ?? ""}`;

    if (!productId || productId.endsWith("#")) {
      setBarcodeError("Unable to resolve product ID. Please scan again.");
      return;
    }

    onAddToBatchAction({
      productId,
      category,
      brand: getBrandName(brand),
      model,
      quantity: scannedImei ? 1 : quantity,
      imei: scannedImei || undefined,
    });

    // Reset form
    setBarcode("");
    setBarcodeError("");
    setBrand("");
    setModel("");
    setQuantity(1);
    setResolvedProductId("");
    setScannedImei("");
    barcodeInputRef.current?.focus();
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setQuantity(Math.max(1, value));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!scannedImei) {
      return;
    }
    setCategory(e.target.value as CategoryType);
    setBrand("");
    setModel("");
    setResolvedProductId("");
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBrand(e.target.value);
    setModel("");
    setResolvedProductId("");
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModel(e.target.value);
  };

  const isFormValid = Boolean(
    brand &&
    model &&
    (scannedImei ? true : quantity >= 1) &&
    Boolean(scannedImei),
  );

  return (
    <div className="space-y-4">
      {/* Barcode Input */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Barcode className="h-4 w-4 text-gray-600" />
          <label className="text-sm font-medium text-gray-700">
            Scan Barcode
          </label>
        </div>
        <Input
          ref={barcodeInputRef}
          type="text"
          value={barcode}
          onChange={handleBarcodeInput}
          placeholder="Scan IMEI digits or brand#model-slug, or enter manually..."
          className="h-10 font-mono text-sm"
          autoFocus
        />
        {barcodeError && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{barcodeError}</p>
          </div>
        )}
        {barcode && !barcodeError && (
          <p className="text-xs text-green-600">
            ✓ Barcode recognized
            {scannedImei ? " (IMEI detected — now select brand/model)" : ""}
          </p>
        )}
        {!scannedImei && (
          <p className="text-xs text-amber-600">You must scan IMEI first.</p>
        )}
      </div>

      {/* Manual Selection Fallback */}
      {(!barcode || !!scannedImei) && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-4">Or select manually:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                value={category}
                onChange={handleCategoryChange}
                disabled={!scannedImei}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="phones">Phones</option>
                <option value="tablets">Tablets</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>

            {/* Brand Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Brand</label>
              <select
                value={brand}
                onChange={handleBrandChange}
                disabled={!scannedImei}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">Select brand...</option>
                {brands.map((brandKey) => (
                  <option key={brandKey} value={brandKey}>
                    {getBrandName(brandKey)}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Model</label>
              <select
                value={model}
                onChange={handleModelChange}
                disabled={!scannedImei || !brand}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">Select model...</option>
                {selectedBrandModels.map((m: Model) => (
                  <option key={m.slug} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            {!scannedImei && (
              <p className="text-xs text-gray-500 md:col-span-2">
                Scan IMEI first to unlock category, brand, and model selection.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Quantity Input (when barcode is scanned) */}
      {barcode && !barcodeError && !scannedImei && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Quantity</label>
          <Input
            ref={quantityInputRef}
            type="number"
            min="1"
            value={quantity}
            onChange={handleQuantityChange}
            placeholder="1"
            className="h-10"
          />
        </div>
      )}

      {/* Add to Batch Button */}
      <Button
        onClick={handleAddToBatch}
        disabled={isLoading || !isFormValid}
        className="w-full h-11 bg-blue-600 hover:bg-blue-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Add to Batch
          </>
        )}
      </Button>
    </div>
  );
}
