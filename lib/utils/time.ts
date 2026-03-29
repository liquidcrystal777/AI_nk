export function minutesFromNow(minutes: number, now = Date.now()) {
  return now + minutes * 60 * 1000;
}

export function hoursFromNow(hours: number, now = Date.now()) {
  return now + hours * 60 * 60 * 1000;
}

export function daysFromNow(days: number, now = Date.now()) {
  return now + days * 24 * 60 * 60 * 1000;
}

export function formatRelativeTime(timestamp?: number) {
  if (!timestamp) {
    return "未复习";
  }

  const diff = timestamp - Date.now();
  const absDiff = Math.abs(diff);

  if (absDiff < 60 * 1000) {
    return diff >= 0 ? "即将开始" : "刚刚复习";
  }

  const minutes = Math.round(absDiff / (60 * 1000));
  if (minutes < 60) {
    return diff >= 0 ? `${minutes} 分钟后` : `${minutes} 分钟前`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return diff >= 0 ? `${hours} 小时后` : `${hours} 小时前`;
  }

  const days = Math.round(hours / 24);
  return diff >= 0 ? `${days} 天后` : `${days} 天前`;
}
