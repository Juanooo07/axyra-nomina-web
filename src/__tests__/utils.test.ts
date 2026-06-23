import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatPeriod, initializeFortnightDates } from '../components/Payroll/utils';

describe('Payroll Utils', () => {
  describe('formatCurrency', () => {
    it('should format currency in Colombian pesos', () => {
      expect(formatCurrency(1000000)).toBe('$1.000.000');
      expect(formatCurrency(500000)).toBe('$500.000');
      expect(formatCurrency(0)).toBe('$0');
    });
  });

  describe('formatDate', () => {
    it('should format date in Spanish locale', () => {
      const date = '2024-01-15';
      const formatted = formatDate(date);
      expect(formatted).toContain('15');
      expect(formatted).toContain('enero');
      expect(formatted).toContain('2024');
    });
  });

  describe('formatPeriod', () => {
    it('should format period within same month', () => {
      const result = formatPeriod('2024-01-01', '2024-01-15');
      expect(result).toContain('1 - 15 de enero de 2024');
    });

    it('should format period across different months', () => {
      const result = formatPeriod('2024-01-25', '2024-02-05');
      expect(result).toContain('25 de enero de 2024');
      expect(result).toContain('5 de febrero de 2024');
    });
  });

  describe('initializeFortnightDates', () => {
    it('should return first fortnight dates when current day is <= 15', () => {
      // Mock current date to be January 10th
      const mockDate = new Date('2024-01-10');
      vi.setSystemTime(mockDate);

      const result = initializeFortnightDates();
      expect(result.startDate).toBe('2024-01-01');
      expect(result.endDate).toBe('2024-01-15');

      vi.useRealTimers();
    });

    it('should return second fortnight dates when current day is > 15', () => {
      // Mock current date to be January 20th
      const mockDate = new Date('2024-01-20');
      vi.setSystemTime(mockDate);

      const result = initializeFortnightDates();
      expect(result.startDate).toBe('2024-01-16');
      expect(result.endDate).toBe('2024-01-31');

      vi.useRealTimers();
    });
  });
});