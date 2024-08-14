export function calculateTimeDifference(date: string) {
  const now = new Date();
  const diffInMs = now.getTime() - Date.parse(date);

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

export function snakeToCamel(obj: Record<string, any>) {
  return Object.keys(obj).reduce<Record<string, any>>((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (match, group1) =>
      group1.toUpperCase()
    );
    acc[camelKey] = obj[key];
    return acc;
  }, {});
}
