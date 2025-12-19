"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useReceipt } from "@/context/ReceiptContext";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export default function ItemAssignment() {
  const { items, people, assignments, updateAssignment, nextStep, previousStep } = useReceipt();
  const [error, setError] = useState<string | null>(null);

  const handleCheckboxChange = (itemId: string, personId: string, checked: boolean) => {
    const currentAssignments = assignments.get(itemId) || [];
    let newAssignments: string[];

    if (checked) {
      newAssignments = [...currentAssignments, personId];
    } else {
      newAssignments = currentAssignments.filter((id) => id !== personId);
    }

    updateAssignment(itemId, newAssignments);
  };

  const isPersonAssigned = (itemId: string, personId: string): boolean => {
    const itemAssignments = assignments.get(itemId) || [];
    return itemAssignments.includes(personId);
  };

  const isItemFullyAssigned = (itemId: string): boolean => {
    const itemAssignments = assignments.get(itemId) || [];
    return itemAssignments.length > 0;
  };

  const getUnassignedCount = (): number => {
    return items.filter((item) => !isItemFullyAssigned(item.id)).length;
  };

  const handleNext = () => {
    const unassignedCount = getUnassignedCount();
    if (unassignedCount > 0) {
      setError(`Please assign all items to at least one person. ${unassignedCount} item(s) remaining.`);
      return;
    }
    nextStep();
  };

  const unassignedCount = getUnassignedCount();

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Assign Items to People</CardTitle>
          <CardDescription>
            Select which person(s) ordered each item. Items can be shared.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {unassignedCount > 0 && (
            <Alert>
              <AlertDescription>
                {unassignedCount} item(s) not yet assigned. All items must be assigned to proceed.
              </AlertDescription>
            </Alert>
          )}

          {/* Assignment Matrix */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-3 border-b font-semibold">Item</th>
                  <th className="text-left p-3 border-b font-semibold">Qty</th>
                  <th className="text-left p-3 border-b font-semibold">Price</th>
                  {people.map((person) => (
                    <th key={person.id} className="text-center p-3 border-b font-semibold">
                      {person.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isAssigned = isItemFullyAssigned(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        "border-b",
                        !isAssigned && "bg-yellow-50 dark:bg-yellow-900/20"
                      )}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          {!isAssigned && (
                            <span className="text-xs text-yellow-600 dark:text-yellow-400">
                              (Unassigned)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{item.quantity}</td>
                      <td className="p-3 text-muted-foreground">£{item.price.toFixed(2)}</td>
                      {people.map((person) => (
                        <td key={person.id} className="p-3 text-center">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={isPersonAssigned(item.id, person.id)}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(item.id, person.id, checked as boolean)
                              }
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-50 dark:bg-yellow-900/20 border rounded" />
              <span>Unassigned item</span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={true} />
              <span>Person is assigned to item (items can be shared)</span>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={previousStep}>
              Back
            </Button>
            <Button onClick={handleNext} disabled={unassignedCount > 0}>
              Calculate Bills
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
