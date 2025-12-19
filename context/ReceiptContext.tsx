"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ReceiptState, LineItem, Person } from '@/lib/types';

interface ReceiptContextType extends ReceiptState {
  setImage: (file: File | null) => void;
  setImageUrl: (url: string | null) => void;
  setOcrText: (text: string | null) => void;
  setItems: (items: LineItem[]) => void;
  setSubtotal: (subtotal: number) => void;
  setTipPercentage: (percentage: number) => void;
  setTipAmount: (amount: number) => void;
  setTotal: (total: number) => void;
  setPeople: (people: Person[]) => void;
  addPerson: (person: Person) => void;
  removePerson: (id: string) => void;
  setAssignments: (assignments: Map<string, string[]>) => void;
  updateAssignment: (itemId: string, personIds: string[]) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  reset: () => void;
}

const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined);

const initialState: ReceiptState = {
  image: null,
  imageUrl: null,
  ocrText: null,
  items: [],
  subtotal: 0,
  tipPercentage: 10,
  tipAmount: 0,
  total: 0,
  people: [],
  assignments: new Map(),
  currentStep: 1,
};

export function ReceiptProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ReceiptState>(initialState);

  const setImage = (file: File | null) => {
    setState((prev) => ({ ...prev, image: file }));
  };

  const setImageUrl = (url: string | null) => {
    setState((prev) => ({ ...prev, imageUrl: url }));
  };

  const setOcrText = (text: string | null) => {
    setState((prev) => ({ ...prev, ocrText: text }));
  };

  const setItems = (items: LineItem[]) => {
    setState((prev) => ({ ...prev, items }));
  };

  const setSubtotal = (subtotal: number) => {
    setState((prev) => ({ ...prev, subtotal }));
  };

  const setTipPercentage = (percentage: number) => {
    setState((prev) => ({ ...prev, tipPercentage: percentage }));
  };

  const setTipAmount = (amount: number) => {
    setState((prev) => ({ ...prev, tipAmount: amount }));
  };

  const setTotal = (total: number) => {
    setState((prev) => ({ ...prev, total }));
  };

  const setPeople = (people: Person[]) => {
    setState((prev) => ({ ...prev, people }));
  };

  const addPerson = (person: Person) => {
    setState((prev) => ({ ...prev, people: [...prev.people, person] }));
  };

  const removePerson = (id: string) => {
    setState((prev) => ({
      ...prev,
      people: prev.people.filter((p) => p.id !== id),
      // Also remove this person from all assignments
      assignments: new Map(
        Array.from(prev.assignments.entries()).map(([itemId, personIds]) => [
          itemId,
          personIds.filter((pId) => pId !== id),
        ])
      ),
    }));
  };

  const setAssignments = (assignments: Map<string, string[]>) => {
    setState((prev) => ({ ...prev, assignments }));
  };

  const updateAssignment = (itemId: string, personIds: string[]) => {
    setState((prev) => {
      const newAssignments = new Map(prev.assignments);
      newAssignments.set(itemId, personIds);
      return { ...prev, assignments: newAssignments };
    });
  };

  const setCurrentStep = (step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  const nextStep = () => {
    setState((prev) => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, 6) }));
  };

  const previousStep = () => {
    setState((prev) => ({ ...prev, currentStep: Math.max(prev.currentStep - 1, 1) }));
  };

  const reset = () => {
    setState(initialState);
  };

  return (
    <ReceiptContext.Provider
      value={{
        ...state,
        setImage,
        setImageUrl,
        setOcrText,
        setItems,
        setSubtotal,
        setTipPercentage,
        setTipAmount,
        setTotal,
        setPeople,
        addPerson,
        removePerson,
        setAssignments,
        updateAssignment,
        setCurrentStep,
        nextStep,
        previousStep,
        reset,
      }}
    >
      {children}
    </ReceiptContext.Provider>
  );
}

export function useReceipt() {
  const context = useContext(ReceiptContext);
  if (context === undefined) {
    throw new Error('useReceipt must be used within a ReceiptProvider');
  }
  return context;
}
