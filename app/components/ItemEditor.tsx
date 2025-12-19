"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useReceipt } from "@/context/ReceiptContext";
import { LineItem } from "@/lib/types";
import { Trash2, Plus, AlertCircle } from "lucide-react";

export default function ItemEditor() {
  const {
    items,
    setItems,
    subtotal,
    setSubtotal,
    tipPercentage,
    setTipPercentage,
    tipAmount,
    setTipAmount,
    total,
    setTotal,
    nextStep,
    previousStep,
  } = useReceipt();

  const [newItem, setNewItem] = useState({ quantity: 1, name: "", price: "" });
  const [error, setError] = useState<string | null>(null);

  const calculateTotals = (updatedItems: LineItem[], tipPct: number) => {
    const newSubtotal = updatedItems.reduce((sum, item) => sum + item.price, 0);
    const newTip = (newSubtotal * tipPct) / 100;
    const newTotal = newSubtotal + newTip;

    setSubtotal(newSubtotal);
    setTipAmount(newTip);
    setTotal(newTotal);
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.price) {
      setError("Please enter both item name and price");
      return;
    }

    const price = parseFloat(newItem.price);
    if (isNaN(price) || price <= 0) {
      setError("Please enter a valid price");
      return;
    }

    const item: LineItem = {
      id: crypto.randomUUID(),
      quantity: newItem.quantity,
      name: newItem.name,
      price: price,
    };

    const updatedItems = [...items, item];
    setItems(updatedItems);
    calculateTotals(updatedItems, tipPercentage);

    setNewItem({ quantity: 1, name: "", price: "" });
    setError(null);
  };

  const handleDeleteItem = (id: string) => {
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
    calculateTotals(updatedItems, tipPercentage);
  };

  const handleUpdateItem = (id: string, field: keyof LineItem, value: string | number) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        if (field === "price") {
          const price = parseFloat(value as string);
          return { ...item, [field]: isNaN(price) ? 0 : price };
        }
        return { ...item, [field]: value };
      }
      return item;
    });
    setItems(updatedItems);
    calculateTotals(updatedItems, tipPercentage);
  };

  const handleTipChange = (value: string) => {
    const pct = parseFloat(value);
    if (!isNaN(pct) && pct >= 0) {
      setTipPercentage(pct);
      calculateTotals(items, pct);
    }
  };

  const handleNext = () => {
    if (items.length === 0) {
      setError("Please add at least one item");
      return;
    }
    nextStep();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Items</CardTitle>
          <CardDescription>
            Review and edit the parsed items, or add new ones manually
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Items List */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Items</h3>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No items found. Add items manually below.
              </p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-3 border rounded-lg"
                  >
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateItem(item.id, "quantity", parseInt(e.target.value))
                      }
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(item.id, "name", e.target.value)}
                      className="flex-1"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-sm">£</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.price.toFixed(2)}
                        onChange={(e) => handleUpdateItem(item.id, "price", e.target.value)}
                        className="w-24"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Item */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <h3 className="text-sm font-medium">Add New Item</h3>
            <div className="flex items-end gap-2">
              <div className="space-y-2">
                <Label htmlFor="quantity">Qty</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })
                  }
                  className="w-20"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g., Fish & Chips"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (£)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  placeholder="0.00"
                  className="w-28"
                />
              </div>
              <Button onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          {/* Tip and Total */}
          <div className="space-y-4 p-4 border rounded-lg bg-card">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Subtotal:</span>
              <span className="text-sm">£{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="tip">Tip Percentage:</Label>
                <Input
                  id="tip"
                  type="number"
                  step="1"
                  min="0"
                  value={tipPercentage}
                  onChange={(e) => handleTipChange(e.target.value)}
                  className="w-20"
                />
                <span className="text-sm">%</span>
              </div>
              <span className="text-sm">£{tipAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-semibold">Total:</span>
              <span className="font-semibold text-lg">£{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={previousStep}>
              Back
            </Button>
            <Button onClick={handleNext}>Next</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
