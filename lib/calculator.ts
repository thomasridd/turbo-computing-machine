import { LineItem, Person, PersonBill, AssignedItem } from './types';

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
