import { DateTime } from 'luxon';

export function formatTimeDifference(date: Date | string) {
  const now = new Date();
  const diffInMs = now.getTime() - new Date(date).getTime();

  if (isNaN(diffInMs)) {
    return '';
  }

  const diffInSeconds = Math.floor(diffInMs / 1000);
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w`;
  }

  const diffInMonths = Math.floor(diffInWeeks / 4);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}y`;
}

export function formatTime(date: string | Date) {
  const jsDate = new Date(date);
  const isToday = jsDate.toDateString() === new Date().toDateString();
  const format = isToday ? DateTime.TIME_SIMPLE : DateTime.DATETIME_SHORT;
  const userLocale = navigator.language || 'en-US';
  return DateTime.fromJSDate(jsDate)
    .setLocale(userLocale)
    .toLocaleString(format);
}

export function snakeToCamel(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/_([a-z])/g, (_, group1) => group1.toUpperCase()),
      snakeToCamel(value),
    ])
  );
}
