"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Loader2, Barcode, AlertCircle, X, Camera } from "lucide-react";
import {
  getModelsByCategory,
  getBrandName,
  type BrandModels,
} from "@/lib/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StockBarcodeFormProps {
  onAddToBatchAction: (item: {
    productId: string;
    brand: string;
    model: string;
    quantity: number;
  }) => void;
  isLoading: boolean;
}

type CategoryType = "phones" | "tablets" | "accessories";

// Quagga2 result type
interface QuaggaResult {
  codeResult?: {
    code?: string | null;
  };
}

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
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [isScanningQuagga, setIsScanningQuagga] = useState(false);
  const [inputMode, setInputMode] = useState<"camera" | "manual">("camera");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const quaggaRef = useRef<any>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);

  const categoryModels: BrandModels = getModelsByCategory(category);
  const brands = Object.keys(categoryModels);
  const selectedBrandModels = brand ? categoryModels[brand] || [] : [];

  // Load and initialize Quagga2 for barcode scanning
  const initializeCamera = async () => {
    try {
      setCameraError("");
      setShowCamera(true);

      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera not supported in this browser");
        setShowCamera(false);
        return;
      }

      // First, get the user media stream directly
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { min: 640 },
            height: { min: 480 },
            facingMode: "environment",
          },
          audio: false,
        });
      } catch (error: any) {
        if (error.name === "NotAllowedError") {
          setCameraError("Camera permission denied. Please allow camera access.");
        } else if (error.name === "NotFoundError") {
          setCameraError("No camera found on this device.");
        } else {
          setCameraError(`Failed to access camera: ${error.message || error.name}`);
        }
        setShowCamera(false);
        return;
      }

      // Wait for video element to be ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (!videoRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        setCameraError("Video element not ready");
        setShowCamera(false);
        return;
      }

      // Set the stream to the video element
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsScanningQuagga(true);

      console.log("Camera stream started successfully");

      // Now initialize Quagga for barcode detection
      const QuaggaModule = await import("@ericblade/quagga2");
      const Quagga = QuaggaModule.default;
      quaggaRef.current = Quagga;

      // Use the existing stream with Quagga
      Quagga.init(
        {
          inputStream: {
            type: "LiveStream",
            constraints: {
              width: { min: 640 },
              height: { min: 480 },
              facingMode: "environment",
            },
            target: videoRef.current,
          },
          decoder: {
            readers: [
              "code_128_reader",
              "ean_reader",
              "ean_8_reader",
              "code_39_reader",
              "upc_reader",
              "upc_e_reader",
            ],
          },
          locate: true,
        },
        (err: any) => {
          if (err) {
            console.error("Quagga initialization error:", err);
            // Camera is working even if Quagga fails, that's okay
            return;
          }

          try {
            Quagga.start();
            console.log("Quagga barcode detection started");
            // Listen for detected barcodes
            Quagga.onDetected(handleQuaggaDetection);
          } catch (e) {
            console.warn("Quagga start failed, but camera is working", e);
          }
        },
      );
    } catch (error) {
      setCameraError("Barcode scanner library not available. Please install quagga2.");
      console.error(error);
    }
  };

  const handleQuaggaDetection = (result: any) => {
    if (result && result.codeResult && result.codeResult.code) {
      const detectedBarcode = result.codeResult.code;
      processBarcode(detectedBarcode);
    }
  };

  const stopCamera = () => {
    try {
      // Stop Quagga if running
      if (quaggaRef.current) {
        try {
          quaggaRef.current.offDetected(handleQuaggaDetection);
          quaggaRef.current.stop();
        } catch (e) {
          console.warn("Error stopping Quagga", e);
        }
      }

      // Stop the media stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      // Clear video element
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setShowCamera(false);
      setIsScanningQuagga(false);
      setCameraError("");
      console.log("Camera stopped");
    } catch (error) {
      console.error("Error stopping camera:", error);
    }
  };

  // Parse barcode to extract product details
  const processBarcode = (barcodeValue: string) => {
    const trimmedBarcode = barcodeValue.trim();
    setBarcode(trimmedBarcode);
    setBarcodeError("");

    // Simply capture the barcode, don't auto-parse
    // User will manually select product details
    console.log("Barcode scanned:", trimmedBarcode);
    
    // Stop camera so user can see the scanned barcode and select details
    stopCamera();
  };

  const handleAddToBatch = () => {
    if (!brand || !model || quantity < 1) {
      return;
    }

    const productId = `${brand}#${selectedBrandModels.find((m) => m.name === model)?.slug}`;

    onAddToBatchAction({
      productId,
      brand: getBrandName(brand),
      model,
      quantity,
    });

    // Reset form
    setBarcode("");
    setBarcodeError("");
    setBrand("");
    setModel("");
    setQuantity(1);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setQuantity(Math.max(1, value));
  };

  const isFormValid = brand && model && quantity >= 1;

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Input Mode Toggle - Cleaner Design */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => {
            setInputMode("camera");
            stopCamera();
            setBarcode("");
            setBarcodeError("");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
            inputMode === "camera"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Camera className="h-4 w-4" />
          Scan
        </button>
        <button
          onClick={() => {
            setInputMode("manual");
            stopCamera();
            setBarcode("");
            setBarcodeError("");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
            inputMode === "manual"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Plus className="h-4 w-4" />
          Manual
        </button>
      </div>

      {/* Manual Selection Mode */}
      {inputMode === "manual" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as CategoryType);
                  setBrand("");
                  setModel("");
                }}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="phones">📱 Phones</option>
                <option value="tablets">📱 Tablets</option>
                <option value="accessories">🎧 Accessories</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Brand
              </label>
              <select
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value);
                  setModel("");
                }}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Select brand...</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {getBrandName(b)}
                  </option>
                ))}
              </select>
            </div>

            {brand && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Select model...</option>
                  {selectedBrandModels.map((m) => (
                    <option key={m.slug} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {model && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Quantity
                </label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                  placeholder="1"
                  className="h-11 text-center"
                />
              </div>
            )}
          </div>

          {isFormValid && (
            <Button
              onClick={handleAddToBatch}
              disabled={isLoading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Batch
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Camera Mode */}
      {inputMode === "camera" && (
        <>
      {/* Camera Scanner Section */}
      {!barcode && !showCamera && (
        <Button
          onClick={initializeCamera}
          disabled={isLoading}
          className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-base"
        >
          <Camera className="h-5 w-5 mr-2" />
          Tap to Start Camera
        </Button>
      )}

      {/* Camera Feed */}
      {showCamera && !barcode && (
        <div className="space-y-3">
          <div className="relative bg-black rounded-xl overflow-hidden shadow-lg">
            {/* Responsive video container with 16:9 aspect ratio */}
            <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
                muted
                autoPlay
              />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ display: 'none' }} />

              {!isScanningQuagga && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-white" />
                    <p className="text-white text-sm font-medium">Initializing camera...</p>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={stopCamera}
                className="absolute top-3 right-3 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg z-10 transition-colors shadow-md"
                title="Close camera"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Scanner frame overlay */}
              {isScanningQuagga && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-1/4 border-2 border-green-500 rounded-lg opacity-75">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-500"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-500"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-500"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-500"></div>
                  </div>
                </div>
              )}
            </div>

            {isScanningQuagga && (
              <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-green-900 to-emerald-900 text-green-300 text-sm font-medium">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p>Point camera at barcode...</p>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700 font-medium">{cameraError}</p>
            </div>
          )}
        </div>
      )}

      {/* Scanned Barcode Display */}
      {barcode && !barcodeError && (
        <div className="space-y-4">
          {/* Barcode Success Card */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="text-2xl">✓</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900">
                  Barcode Scanned
                </p>
                <p className="text-xs text-green-700 mt-3 font-mono bg-white p-3 rounded border border-green-300 break-all">
                  {barcode}
                </p>
              </div>
            </div>
          </div>

          {/* Product Details Selection */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-900">Select Product Details:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value as CategoryType);
                    setBrand("");
                    setModel("");
                  }}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                >
                  <option value="phones">📱 Phones</option>
                  <option value="tablets">📱 Tablets</option>
                  <option value="accessories">🎧 Accessories</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                  Brand
                </label>
                <select
                  value={brand}
                  onChange={(e) => {
                    setBrand(e.target.value);
                    setModel("");
                  }}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                >
                  <option value="">Select brand...</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {getBrandName(b)}
                    </option>
                  ))}
                </select>
              </div>

              {brand && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                    Model
                  </label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select model...</option>
                    {selectedBrandModels.map((m) => (
                      <option key={m.slug} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {model && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                    Quantity
                  </label>
                  <Input
                    ref={quantityInputRef}
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={handleQuantityChange}
                    placeholder="1"
                    className="h-11 text-center font-semibold"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {isFormValid && (
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleAddToBatch}
                  disabled={isLoading}
                  className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Batch
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => {
                    setBarcode("");
                    setBrand("");
                    setModel("");
                    setQuantity(1);
                    initializeCamera();
                  }}
                  variant="outline"
                  className="h-12 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Scan More
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {barcodeError && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-900">Invalid Barcode</p>
            <p className="text-sm text-red-700 mt-1">{barcodeError}</p>
          </div>
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
        </>
      )}
    </div>
  );
}
