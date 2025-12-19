"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useReceipt } from "@/context/ReceiptContext";
import { calculateBills, validateBills } from "@/lib/calculator";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function BillSummary() {
  const { items, people, assignments, subtotal, tipAmount, total, previousStep, reset } = useReceipt();

  const bills = useMemo(() => {
    return calculateBills(items, people, assignments, subtotal, tipAmount);
  }, [items, people, assignments, subtotal, tipAmount]);

  const validation = useMemo(() => {
    return validateBills(bills, total);
  }, [bills, total]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Bill Summary</CardTitle>
          <CardDescription>
            Here&apos;s how the bill is split among everyone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Validation Alert */}
          {!validation.valid ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning: Totals Don&apos;t Match</AlertTitle>
              <AlertDescription>
                The sum of individual bills (£{bills.reduce((sum, bill) => sum + bill.total, 0).toFixed(2)})
                differs from the expected total (£{total.toFixed(2)}) by £{validation.difference.toFixed(2)}.
                This may be due to rounding.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Validation Successful</AlertTitle>
              <AlertDescription>
                All calculations are correct. The sum of individual bills matches the total.
              </AlertDescription>
            </Alert>
          )}

          {/* Individual Bills */}
          <div className="grid gap-4 md:grid-cols-2">
            {bills.map((bill) => (
              <Card key={bill.person.id} className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">{bill.person.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Items */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground">Items:</h4>
                    {bill.items.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No items</p>
                    ) : (
                      <div className="space-y-1">
                        {bill.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>
                              {item.quantity === 1 ? (
                                <span>{item.name}</span>
                              ) : item.quantity % 1 === 0 ? (
                                <span>{item.quantity} × {item.name}</span>
                              ) : (
                                <span>{item.quantity.toFixed(2)} × {item.name}</span>
                              )}
                            </span>
                            <span>£{item.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="font-medium">Subtotal:</span>
                    <span>£{bill.subtotal.toFixed(2)}</span>
                  </div>

                  {/* Tip */}
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      Tip ({(bill.tipPercentage * 100).toFixed(1)}% of £{tipAmount.toFixed(2)}):
                    </span>
                    <span>£{bill.tip.toFixed(2)}</span>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>£{bill.total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Overall Summary */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Overall Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Subtotal:</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tip:</span>
                <span>£{tipAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span>£{total.toFixed(2)}</span>
              </div>
              <div className="pt-4 text-sm text-muted-foreground italic">
                Note: Settlement to be arranged outside this app
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={previousStep}>
              Back
            </Button>
            <Button onClick={reset} variant="default">
              Start Over
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
