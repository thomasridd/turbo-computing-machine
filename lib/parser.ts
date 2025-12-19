import { LineItem, ParsedReceipt } from './types';

const ITEM_REGEX = /^(\d+)\s+(.+?)\s+£([\d.]+)$/gm;
const SUBTOTAL_REGEX = /(?:sub\s*total|subtotal)[:\s]*£?([\d.]+)/i;
const SERVICE_REGEX = /(?:service|tip|gratuity).*?[:\s]*£?([\d.]+)/i;
const TOTAL_REGEX = /(?:^|\n)total[:\s]*£?([\d.]+)/i;

export function parseReceipt(text: string): ParsedReceipt {
  const items: LineItem[] = [];
  let match;

  // Reset regex lastIndex
  ITEM_REGEX.lastIndex = 0;

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
