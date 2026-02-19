"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Scan, Camera, Keyboard, CheckCircle, XCircle, Plus } from "lucide-react";

// Mock product lookup
const productDatabase: Record<string, { name: string; price: number; stock: number }> = {
  "8901234567890": { name: "iPhone 15 Pro Max", price: 1199, stock: 45 },
  "8901234567891": { name: "Samsung Galaxy S24", price: 899, stock: 32 },
  "8901234567892": { name: "AirPods Pro", price: 249, stock: 67 },
  "8901234567893": { name: "MagSafe Charger", price: 39, stock: 100 },
  "8901234567894": { name: "Apple Watch Ultra", price: 799, stock: 12 },
};

interface ScanResult {
  barcode: string;
  product: { name: string; price: number; stock: number } | null;
  timestamp: Date;
}

export default function ScanPage() {
  const [manualBarcode, setManualBarcode] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);

  // Simulate barcode scan
  const handleScan = (barcode: string) => {
    const product = productDatabase[barcode] || null;
    const result: ScanResult = {
      barcode,
      product,
      timestamp: new Date(),
    };
    setLastScan(result);
    setScanHistory((prev) => [result, ...prev].slice(0, 10));
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleScan(manualBarcode.trim());
      setManualBarcode("");
    }
  };

  // Simulate periodic scanning for demo
  useEffect(() => {
    if (!isScanning) return;

    const barcodes = Object.keys(productDatabase);
    const interval = setInterval(() => {
      // 20% chance of scanning something
      if (Math.random() < 0.2) {
        const randomBarcode = barcodes[Math.floor(Math.random() * barcodes.length)];
        handleScan(randomBarcode);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isScanning]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Barcode Scanner</h1>
        <p className="text-gray-500">Scan products to add them to the cart</p>
      </div>

      {/* Camera/Scanner View */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
            {/* Simulated camera view */}
            <div className="absolute inset-0 flex items-center justify-center">
              {isScanning ? (
                <div className="text-center text-white">
                  <div className="relative w-64 h-40 border-2 border-white/50 rounded-lg mb-4">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-0.5 bg-red-500 animate-pulse" />
                    </div>
                    {/* Corner markers */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br" />
                  </div>
                  <p className="text-sm opacity-75">Position barcode within frame</p>
                </div>
              ) : (
                <div className="text-center text-white">
                  <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Scanner paused</p>
                </div>
              )}
            </div>

            {/* Scanner controls */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              <Button
                variant={isScanning ? "destructive" : "default"}
                onClick={() => setIsScanning(!isScanning)}
              >
                {isScanning ? "Pause Scanner" : "Start Scanner"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Entry */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Keyboard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Enter barcode manually..."
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-6">
              <Scan className="h-5 w-5 mr-2" />
              Lookup
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Last Scan Result */}
      {lastScan && (
        <Card className={`mb-6 border-2 ${lastScan.product ? "border-green-500" : "border-red-500"}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  lastScan.product ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {lastScan.product ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-mono">{lastScan.barcode}</p>
                {lastScan.product ? (
                  <>
                    <h3 className="text-lg font-bold">{lastScan.product.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xl font-bold">${lastScan.product.price}</span>
                      <Badge variant="secondary">Stock: {lastScan.product.stock}</Badge>
                    </div>
                  </>
                ) : (
                  <h3 className="text-lg font-bold text-red-600">Product not found</h3>
                )}
              </div>
              {lastScan.product && (
                <Button size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold mb-4">Recent Scans</h3>
            <div className="space-y-2">
              {scanHistory.map((scan, index) => (
                <div
                  key={`${scan.barcode}-${index}`}
                  className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                >
                  <div
                    className={`h-2 w-2 rounded-full ${
                      scan.product ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span className="font-mono text-sm text-gray-500">{scan.barcode}</span>
                  <span className="flex-1 font-medium truncate">
                    {scan.product?.name || "Not found"}
                  </span>
                  {scan.product && (
                    <span className="font-bold">${scan.product.price}</span>
                  )}
                  <span className="text-xs text-gray-400">
                    {scan.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo Barcodes */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <h3 className="font-bold mb-2">Demo Barcodes (for testing)</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(productDatabase).map(([barcode, product]) => (
              <Button
                key={barcode}
                variant="outline"
                size="sm"
                onClick={() => handleScan(barcode)}
              >
                {product.name.split(" ")[0]}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
