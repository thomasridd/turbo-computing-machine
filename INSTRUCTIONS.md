Great! Here are the finalized Claude Code instructions:

-----

# Receipt Splitter App - Build Instructions

Build a Next.js 14+ web application for splitting restaurant bills from receipt photos.

## Tech Stack

- Next.js 14 with App Router and TypeScript
- Tailwind CSS
- shadcn/ui components
- Tesseract.js for OCR
- React Context for state management

## Application Flow

### Step 1: Receipt Upload

- Single page application with step-based navigation (use a step indicator showing 5 steps)
- File upload component accepting image files (jpg, png, jpeg)
- Preview uploaded image with responsive sizing
- “Process Receipt” button to trigger OCR
- Optional: Manual rotate buttons (90° left/right) for image correction

### Step 2: OCR Processing

- Use Tesseract.js (client-side) to extract text from image
- Show progress indicator during processing (Tesseract provides progress callbacks)
- Display raw OCR text in a collapsible section for debugging/verification
- Handle errors gracefully with retry option

### Step 3: Parse and Edit Items

Parse UK receipt format: `[quantity] [item name] [£total]`

Expected format example:

```
2 Fish & Chips £18.00
1 Mushy Peas £3.50
3 Coke £7.50

Subtotal: £29.00
10% Service: £2.90
Total: £31.90
```

**Parsing Requirements:**

- Extract line items using regex: `^(\d+)\s+(.+?)\s+£([\d.]+)$`
- Extract subtotal (look for “Subtotal:”, “Sub Total:”, or similar)
- Extract service charge/tip (look for “Service:”, “Tip:”, or percentage patterns)
- Extract total (look for “Total:”)
- If service charge exists in receipt, use it; otherwise calculate based on user-specified tip percentage

**Manual Editing UI:**

- Display parsed items in editable table/list
- Allow add new item (quantity, name, price)
- Allow edit existing items
- Allow delete items
- Input field for tip percentage (default 10%, can be 0)
- Show calculated tip amount
- Show total
- Validation: ensure all prices are valid numbers
- “Reparse” button to re-run OCR if needed

**Fallback:**

- If parsing fails completely, show empty item list and allow full manual entry
- Provide helpful error message explaining what went wrong

### Step 4: Add People

- Input field with “Add Person” button
- Display list of added people with remove button (trash icon)
- Minimum 2 people required to proceed to next step
- Clear visual indication if trying to proceed with < 2 people

### Step 5: Assign Items to People

- Display matrix/grid view:
  - Rows: each line item with quantity, name, and price
  - Columns: checkbox for each person
- Allow multiple checkboxes per item (for sharing)
- Visual indicators:
  - Unassigned items highlighted (e.g., yellow background)
  - Fully assigned items (normal styling)
- Validation: All items must be assigned to at least one person before proceeding
- Show count of unassigned items

### Step 6: Calculate and Display Bills

**Individual Bill Calculation:**
For each person:

1. Sum their assigned item costs divided by number of people sharing each item

- If item shared by N people, each person gets (item price / N)

1. Calculate their subtotal
1. Calculate their percentage of the total subtotal: `(person subtotal / overall subtotal) * 100`
1. Apply that percentage to the tip amount: `(tip total * person percentage)`
1. Person total = person subtotal + proportional tip

**Display:**

- Card/section for each person showing:
  - Person’s name as header
  - List of their items with quantities (show fractional if shared, e.g., “0.5 × Fish & Chips”)
  - Their subtotal
  - Their proportional tip with percentage shown (e.g., “Tip (34.5% of £2.90): £1.00”)
  - Their total amount
  - Clear visual separation between people
- Summary section showing:
  - Overall subtotal
  - Overall tip
  - Overall total
  - Validation check: sum of individual totals should equal overall total (within £0.02 tolerance for rounding)
  - If validation fails, show warning message
- Note: “Settlement to be arranged outside this app”
- “Start Over” button to reset entire flow

## Technical Implementation Details

### File Structure

```
app/
  page.tsx                    # Main app with step management
  layout.tsx                  # Root layout
  components/
    StepIndicator.tsx         # Progress stepper (1-5)
    ReceiptUpload.tsx         # Step 1: Image upload
    OCRProcessor.tsx          # Step 2: OCR processing
    ItemEditor.tsx            # Step 3: Parse & edit items
    PeopleManager.tsx         # Step 4: Add people
    ItemAssignment.tsx        # Step 5: Assign items
    BillSummary.tsx           # Step 6: Display bills
  lib/
    ocr.ts                    # Tesseract.js wrapper
    parser.ts                 # Receipt parsing logic
    calculator.ts             # Split calculation logic
    types.ts                  # TypeScript interfaces
  context/
    ReceiptContext.tsx        # Global state management
```

### State Management (React Context)

Create ReceiptContext with the following state:

```typescript
interface ReceiptState {
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

interface LineItem {
  id: string;
  quantity: number;
  name: string;
  price: number;
}

interface Person {
  id: string;
  name: string;
}
```

### OCR Implementation (lib/ocr.ts)

```typescript
import Tesseract from 'tesseract.js';

export async function processImage(
  imageFile: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const worker = await Tesseract.createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(m.progress);
      }
    },
  });
  
  const { data: { text } } = await worker.recognize(imageFile);
  await worker.terminate();
  
  return text;
}
```

### Parsing Logic (lib/parser.ts)

```typescript
const ITEM_REGEX = /^(\d+)\s+(.+?)\s+£([\d.]+)$/gm;
const SUBTOTAL_REGEX = /(?:sub\s*total|subtotal)[:\s]*£?([\d.]+)/i;
const SERVICE_REGEX = /(?:service|tip|gratuity).*?[:\s]*£?([\d.]+)/i;
const TOTAL_REGEX = /(?:^|\n)total[:\s]*£?([\d.]+)/i;

export function parseReceipt(text: string): ParsedReceipt {
  const items: LineItem[] = [];
  let match;
  
  // Extract line items
  while ((match = ITEM_REGEX.exec(text)) !== null) {
    items.push({
      id: crypto.randomUUID(),
      quantity: parseInt(match[1]),
      name: match[2].trim(),
      price: parseFloat(match[3]),
    });
  }
  
  // Extract subtotal
  const subtotalMatch = text.match(SUBTOTAL_REGEX);
  const subtotal = subtotalMatch 
    ? parseFloat(subtotalMatch[1]) 
    : items.reduce((sum, item) => sum + item.price, 0);
  
  // Extract service charge
  const serviceMatch = text.match(SERVICE_REGEX);
  const serviceCharge = serviceMatch ? parseFloat(serviceMatch[1]) : null;
  
  // Extract total
  const totalMatch = text.match(TOTAL_REGEX);
  const total = totalMatch ? parseFloat(totalMatch[1]) : null;
  
  return { items, subtotal, serviceCharge, total };
}
```

### Calculator Logic (lib/calculator.ts)

```typescript
export function calculateBills(
  items: LineItem[],
  people: Person[],
  assignments: Map<string, string[]>,
  subtotal: number,
  tipAmount: number
): PersonBill[] {
  const bills: PersonBill[] = [];
  
  for (const person of people) {
    const personItems: AssignedItem[] = [];
    let personSubtotal = 0;
    
    for (const item of items) {
      const assignedPeople = assignments.get(item.id) || [];
      if (assignedPeople.includes(person.id)) {
        const shareCount = assignedPeople.length;
        const itemShare = item.price / shareCount;
        const quantityShare = item.quantity / shareCount;
        
        personItems.push({
          name: item.name,
          quantity: quantityShare,
          price: itemShare,
        });
        
        personSubtotal += itemShare;
      }
    }
    
    const tipPercentage = personSubtotal / subtotal;
    const personTip = tipAmount * tipPercentage;
    const personTotal = personSubtotal + personTip;
    
    bills.push({
      person,
      items: personItems,
      subtotal: personSubtotal,
      tipPercentage,
      tip: personTip,
      total: personTotal,
    });
  }
  
  return bills;
}

export function validateBills(
  bills: PersonBill[],
  expectedTotal: number
): { valid: boolean; difference: number } {
  const calculatedTotal = bills.reduce((sum, bill) => sum + bill.total, 0);
  const difference = Math.abs(calculatedTotal - expectedTotal);
  return {
    valid: difference < 0.02, // £0.02 tolerance
    difference,
  };
}
```

## UI/UX Requirements

### Styling

- Mobile-first responsive design
- Use shadcn/ui components: Button, Card, Input, Label, Checkbox, Alert
- Clear visual hierarchy with step indicator at top
- Adequate spacing and padding for touch targets
- Loading states for async operations
- Error states with helpful messages

### Accessibility

- Proper semantic HTML
- Label all form inputs
- Keyboard navigation support
- Focus management between steps
- ARIA labels where needed
- Screen reader friendly

### Validation & Error Handling

- Image upload: validate file type and size (< 10MB)
- OCR: handle failures with retry option and manual entry fallback
- Parsing: gracefully handle malformed receipts
- Step transitions: prevent advancing without required data
- Calculate: warn if totals don’t match

### Navigation

- “Next” button to advance (disabled until step requirements met)
- “Back” button to return to previous step
- “Start Over” button on final step to reset app
- Step indicator showing current position (1 of 5, 2 of 5, etc.)

## Development Notes

1. Install dependencies:
   
   ```bash
   npm install tesseract.js
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add button card input label checkbox alert
   ```
1. Start with basic structure and step navigation
1. Implement each step component incrementally
1. Test with sample receipt images
1. OCR quality will vary - prioritize good manual editing UX
1. Consider adding image preprocessing (contrast, rotation) if initial OCR results are poor
1. All calculations should use fixed-point arithmetic or round to 2 decimal places
1. No backend or database needed - everything is client-side and session-based

## Testing Checklist

- [ ] Upload various image formats (jpg, png)
- [ ] OCR processes and extracts text
- [ ] Parser correctly identifies items, subtotal, tip, total
- [ ] Manual editing adds/removes/updates items correctly
- [ ] Cannot proceed without minimum 2 people
- [ ] Items can be assigned to multiple people (sharing)
- [ ] Cannot proceed with unassigned items
- [ ] Bill calculations are mathematically correct
- [ ] Proportional tip distribution works correctly
- [ ] Validation catches mismatched totals
- [ ] Start Over resets all state
- [ ] Mobile responsive layout works
- [ ] Keyboard navigation functions

-----

**Save these instructions to a file and provide them to Claude Code to build the application. The instructions are comprehensive and should result in a fully functional receipt splitting app.**