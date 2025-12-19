export interface LineItem {
  id: string;
  quantity: number;
  name: string;
  price: number;
}

export interface Person {
  id: string;
  name: string;
}

export interface ReceiptState {
  // Step 1-2
  image: File | null;
  imageUrl: string | null;
  ocrText: string | null;

  // Step 3
  items: LineItem[];
  subtotal: number;
  tipPercentage: number;
  tipAmount: number;
  total: number;

  // Step 4
  people: Person[];

  // Step 5
  assignments: Map<string, string[]>; // itemId -> personIds[]

  // Navigation
  currentStep: number;
}

export interface ParsedReceipt {
  items: LineItem[];
  subtotal: number;
  serviceCharge: number | null;
  total: number | null;
}

export interface AssignedItem {
  name: string;
  quantity: number;
  price: number;
}

export interface PersonBill {
  person: Person;
  items: AssignedItem[];
  subtotal: number;
  tipPercentage: number;
  tip: number;
  total: number;
}
