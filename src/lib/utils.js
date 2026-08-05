import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely (handles conflicts) */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Format large numbers: 4200 → "4.2k", 1200000 → "1.2M" */
export function formatCount(num) {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return String(num);
}

/** Truncate text to maxLength with ellipsis */
export function truncate(str, maxLength = 100) {
  if (!str || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

/** Get initials from display name */
export function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Random element from an array */
export function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
