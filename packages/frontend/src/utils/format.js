import { format, formatDistance } from 'date-fns';

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (date) => {
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatDateDistance = (date) => {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};

export const formatJobType = (type) => {
  return type.replace('_', ' ').toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const formatLocation = (location) => {
  if (!location) return '';
  const parts = location.split(',').map(part => part.trim());
  if (parts.length === 1) return parts[0];
  return `${parts[0]}, ${parts[parts.length - 1]}`;
};

