/**
 * Converts a date string into a relative time representation (Indonesian).
 */
export const getRelativeTime = (dateStr: string | Date): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  
  if (isNaN(diffMs)) {
    return 'baru saja';
  }

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) {
    return 'baru saja';
  }
  if (diffMins < 60) {
    return `${diffMins} menit lalu`;
  }
  if (diffHours < 24) {
    return `${diffHours} jam lalu`;
  }
  if (diffDays < 30) {
    return `${diffDays} hari lalu`;
  }
  
  // Fallback to standard Indonesian date format
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default getRelativeTime;
