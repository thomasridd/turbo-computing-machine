"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useReceipt } from "@/context/ReceiptContext";
import { processImage } from "@/lib/ocr";
import { parseReceipt } from "@/lib/parser";
import { Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function OCRProcessor() {
  const {
    image,
    ocrText,
    setOcrText,
    setItems,
    setSubtotal,
    setTipAmount,
    setTotal,
    tipPercentage,
    nextStep,
    previousStep,
  } = useReceipt();

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showRawText, setShowRawText] = useState(false);

  useEffect(() => {
    // Auto-process when component mounts if we don't have OCR text yet
    if (image && !ocrText) {
      handleProcess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProcess = async () => {
    if (!image) return;

    setProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const text = await processImage(image, (p) => {
        setProgress(Math.round(p * 100));
      });

      setOcrText(text);

      // Parse the receipt
      const parsed = parseReceipt(text);
      setItems(parsed.items);
      setSubtotal(parsed.subtotal);

      // Calculate tip and total
      const calculatedTip = parsed.serviceCharge || (parsed.subtotal * tipPercentage) / 100;
      setTipAmount(calculatedTip);

      const calculatedTotal = parsed.total || parsed.subtotal + calculatedTip;
      setTotal(calculatedTotal);

      // Auto-advance to next step after a short delay
      setTimeout(() => {
        nextStep();
      }, 500);
    } catch (err) {
      setError("Failed to process receipt. Please try again or enter items manually.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Process Receipt</CardTitle>
          <CardDescription>
            Extracting text from your receipt using OCR
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {processing ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Processing receipt... {progress}%
              </p>
              <div className="w-full max-w-xs h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : ocrText ? (
            <div className="space-y-4">
              <Alert>
                <AlertTitle>Processing Complete</AlertTitle>
                <AlertDescription>
                  Receipt text has been extracted. Proceeding to edit items...
                </AlertDescription>
              </Alert>

              <div className="border rounded-lg">
                <Button
                  variant="ghost"
                  className="w-full flex justify-between items-center"
                  onClick={() => setShowRawText(!showRawText)}
                >
                  <span className="text-sm font-medium">
                    View Raw OCR Text (for debugging)
                  </span>
                  {showRawText ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                {showRawText && (
                  <div className="p-4 border-t">
                    <pre className="text-xs whitespace-pre-wrap bg-muted p-4 rounded overflow-x-auto">
                      {ocrText}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-sm text-muted-foreground mb-4">
                Ready to process your receipt
              </p>
              <Button onClick={handleProcess}>Start Processing</Button>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={previousStep}>
              Back
            </Button>
            {error && (
              <Button onClick={nextStep}>Skip to Manual Entry</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
