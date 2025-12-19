"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useReceipt } from "@/context/ReceiptContext";
import { Person } from "@/lib/types";
import { Trash2, UserPlus, AlertCircle } from "lucide-react";

export default function PeopleManager() {
  const { people, addPerson, removePerson, nextStep, previousStep } = useReceipt();
  const [newPersonName, setNewPersonName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAddPerson = () => {
    if (!newPersonName.trim()) {
      setError("Please enter a name");
      return;
    }

    // Check for duplicate names
    if (people.some((p) => p.name.toLowerCase() === newPersonName.trim().toLowerCase())) {
      setError("A person with this name already exists");
      return;
    }

    const person: Person = {
      id: crypto.randomUUID(),
      name: newPersonName.trim(),
    };

    addPerson(person);
    setNewPersonName("");
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddPerson();
    }
  };

  const handleNext = () => {
    if (people.length < 2) {
      setError("Please add at least 2 people to split the bill");
      return;
    }
    nextStep();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add People</CardTitle>
          <CardDescription>
            Add the people who will be splitting the bill (minimum 2)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Add Person Input */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="personName">Person Name</Label>
                <Input
                  id="personName"
                  type="text"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., John"
                />
              </div>
              <Button
                onClick={handleAddPerson}
                className="self-end"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Person
              </Button>
            </div>
          </div>

          {/* People List */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">
              People ({people.length})
              {people.length < 2 && (
                <span className="text-destructive ml-2">
                  (Need at least 2)
                </span>
              )}
            </h3>
            {people.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No people added yet. Add at least 2 people to continue.
              </p>
            ) : (
              <div className="space-y-2">
                {people.map((person, index) => (
                  <div
                    key={person.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {index + 1}
                        </span>
                      </div>
                      <span className="font-medium">{person.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePerson(person.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={previousStep}>
              Back
            </Button>
            <Button onClick={handleNext} disabled={people.length < 2}>
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
