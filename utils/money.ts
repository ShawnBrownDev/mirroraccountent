export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  
  export function formatCurrencyCompact(amount: number): string {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return formatCurrency(amount);
  }
  
  export function parseCurrencyInput(input: string): number {
    const cleaned = input.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
  }
  
  export function formatCurrencyInput(value: number): string {
    if (value === 0) return '';
    return value.toFixed(2);
  }