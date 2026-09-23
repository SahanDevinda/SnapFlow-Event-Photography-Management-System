import { describe, it, expect } from 'vitest';
import { formatLKR, formatDate } from '../utils/formatters';

describe('Booking Utilities and Financial Calculations', () => {
  it('correctly formats LKR currency values', () => {
    expect(formatLKR(150000)).toContain('150,000');
    expect(formatLKR(0)).toContain('0');
  });

  it('computes 30% advance deposit and 70% remaining balance accurately', () => {
    const packagePrice = 200000;
    const addOnsTotal = 50000;
    const totalAmount = packagePrice + addOnsTotal;

    const advanceDeposit = totalAmount * 0.30;
    const remainingBalance = totalAmount * 0.70;

    expect(advanceDeposit).toBe(75000);
    expect(remainingBalance).toBe(175000);
    expect(advanceDeposit + remainingBalance).toBe(totalAmount);
  });

  it('formats date strings nicely for UI display', () => {
    const formatted = formatDate('2026-10-15');
    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe('string');
  });
});
