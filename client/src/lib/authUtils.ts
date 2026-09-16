export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export function formatCurrency(amount: string): string {
  const num = parseFloat(amount);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num);
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR').format(dateObj);
}

export function getDaysUntilDue(dueDate: Date | string): number {
  const dateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const today = new Date();
  const diffTime = dateObj.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getDueDateStatus(dueDate: Date | string): 'critical' | 'warning' | 'normal' {
  const days = getDaysUntilDue(dueDate);
  if (days <= 3) return 'critical';
  if (days <= 7) return 'warning';
  return 'normal';
}
