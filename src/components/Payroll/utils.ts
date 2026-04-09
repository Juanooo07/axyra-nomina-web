// Utility functions for Payroll components

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatPeriod = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()} - ${end.getDate()} de ${start.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}`;
  }

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

export const initializeFortnightDates = (): { startDate: string; endDate: string } => {
  const today = new Date();
  const day = today.getDate();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  if (day <= 15) {
    return {
      startDate: `${year}-${String(month).padStart(2, '0')}-01`,
      endDate: `${year}-${String(month).padStart(2, '0')}-15`
    };
  } else {
    const lastDay = new Date(year, month, 0).getDate();
    return {
      startDate: `${year}-${String(month).padStart(2, '0')}-16`,
      endDate: `${year}-${String(month).padStart(2, '0')}-${lastDay}`
    };
  }
};