import { LineItem, ParsedReceipt } from './types';

const ITEM_REGEX = /^(\d+)\s+(.+)\s+£([\d.]+)$/gm;
const ITEM_WITHOUT_QUANTITY_REGEX = /^(?!\d+\s)(.+)\s+£([\d.]+)$/gm;
const SUBTOTAL_REGEX = /(?:sub\s*total|subtotal)[:\s]*£?([\d.]+)/i;
const SERVICE_REGEX = /(?:service|tip|gratuity).*?[:\s]*£?([\d.]+)/i;
const TOTAL_REGEX = /(?:^|\n)total[:\s]*£?([\d.]+)/i;

export function parseReceipt(text: string): ParsedReceipt {
  const items: LineItem[] = [];
  let match;
  const processedLines = new Set<string>();

  // Reset regex lastIndex
  ITEM_REGEX.lastIndex = 0;

  // Extract line items with quantity
  while ((match = ITEM_REGEX.exec(text)) !== null) {
    const fullMatch = match[0];
    processedLines.add(fullMatch);
    items.push({
      id: crypto.randomUUID(),
      quantity: parseInt(match[1]),
      name: match[2].trim(),
      price: parseFloat(match[3]),
    });
  }

  // Reset regex lastIndex
  ITEM_WITHOUT_QUANTITY_REGEX.lastIndex = 0;

  // Extract line items without quantity (default to 1)
  while ((match = ITEM_WITHOUT_QUANTITY_REGEX.exec(text)) !== null) {
    const fullMatch = match[0];

    // Skip if we already processed this line or if it matches subtotal/service/total patterns
    if (
      processedLines.has(fullMatch) ||
      SUBTOTAL_REGEX.test(fullMatch) ||
      SERVICE_REGEX.test(fullMatch) ||
      TOTAL_REGEX.test(fullMatch)
    ) {
      continue;
    }

    items.push({
      id: crypto.randomUUID(),
      quantity: 1, // Default quantity to 1
      name: match[1].trim(),
      price: parseFloat(match[2]),
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
