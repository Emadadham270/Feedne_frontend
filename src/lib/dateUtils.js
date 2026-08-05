/**
 * Format a date string into a relative "time ago" string.
 * e.g. "45 mins ago", "3 hours ago", "2 days ago"
 */
export function timeAgo(dateStr) {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = Math.floor((now - date) / 1000); // seconds

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;

  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Format a date for display in messages: "Today 3:45 PM" or "Jun 12, 3:45 PM" */
export function formatMessageTime(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (isToday) return time;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + time;
}
