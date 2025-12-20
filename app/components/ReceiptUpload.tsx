"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useReceipt } from "@/context/ReceiptContext";
import { Upload, RotateCcw, RotateCw, X } from "lucide-react";

export default function ReceiptUpload() {
  const { image, imageUrl, setImage, setImageUrl, nextStep } = useReceipt();
  const [error, setError] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a JPG or PNG image");
      return;
    }

    // Validate file size (< 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setError("File size must be less than 10MB");
      return;
    }

    setError(null);
    setImage(file);
    setImageUrl(URL.createObjectURL(file));
    setRotation(0);
  };

  const rotateLeft = () => {
    setRotation((prev) => (prev - 90) % 360);
  };

  const rotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const clearImage = () => {
    setImage(null);
    setImageUrl(null);
    setRotation(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleNext = () => {
    if (image) {
      nextStep();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Upload Receipt</CardTitle>
          <CardDescription>
            Upload a photo of your receipt to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col items-center justify-center space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileChange}
              className="hidden"
              id="receipt-upload"
            />

            {!imageUrl ? (
              <label htmlFor="receipt-upload" className="cursor-pointer w-full">
                <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors">
                  <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG (max 10MB)
                  </p>
                </div>
              </label>
            ) : (
              <div className="w-full space-y-4">
                <div className="relative w-full max-h-96 overflow-hidden rounded-lg border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Receipt preview"
                    className="w-full h-auto object-contain"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: "transform 0.3s ease",
                    }}
                  />
                </div>

                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={rotateLeft}
                    type="button"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Rotate Left
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={rotateRight}
                    type="button"
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    Rotate Right
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearImage}
                    type="button"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Image
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleNext} disabled={!image}>
              Process Receipt
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
