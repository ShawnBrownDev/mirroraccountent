export function getCurrentMonth(): number {
    return new Date().getMonth();
  }
  
  export function getCurrentYear(): number {
    return new Date().getFullYear();
  }
  
  export function getMonthName(month: number): string {
    const date = new Date(2024, month, 1);
    return date.toLocaleDateString('en-US', { month: 'long' });
  }
  
  export function getShortMonthName(month: number): string {
    const date = new Date(2024, month, 1);
    return date.toLocaleDateString('en-US', { month: 'short' });
  }
  
  export function getDaysInMonth(month: number, year: number): number {
    return new Date(year, month + 1, 0).getDate();
  }
  
  export function getDueDateForMonth(dueDay: number, month: number, year: number): Date {
    const daysInMonth = getDaysInMonth(month, year);
    const adjustedDay = Math.min(dueDay, daysInMonth);
    return new Date(year, month, adjustedDay);
  }
  
  export function getDaysUntilDue(dueDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  export function isOverdue(dueDate: Date): boolean {
    return getDaysUntilDue(dueDate) < 0;
  }
  
  export function formatDueDate(dueDate: Date): string {
    const daysUntil = getDaysUntilDue(dueDate);
    
    if (daysUntil === 0) return 'Due today';
    if (daysUntil === 1) return 'Due tomorrow';
    if (daysUntil === -1) return 'Due yesterday';
    if (daysUntil < -1) return `${Math.abs(daysUntil)} days overdue`;
    if (daysUntil <= 7) return `Due in ${daysUntil} days`;
    
    return dueDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  export function getOrdinalSuffix(day: number): string {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }
  
  export function formatDayOfMonth(day: number): string {
    return `${day}${getOrdinalSuffix(day)}`;
  }
  