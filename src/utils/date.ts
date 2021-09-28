import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

export function getTickFromRangeTime(rangeTime: string, index: number) {
  const min = {
    '24h': dayjs().subtract(1, 'days'),
    '7d': dayjs().subtract(7, 'days'),
    '31d': dayjs().subtract(31, 'days'),
  }[rangeTime]!;

  const interval = {
    '24h': dayjs.duration({
      hours: (index + 1) * 1,
    }),
    '7d': dayjs.duration({
      hours: (index + 1) * 6,
    }),
    '31d': dayjs.duration({
      days: (index + 1) * 1,
    }),
  }[rangeTime]!;

  return min.add(interval).toISOString();
}

export function getTickCountFromRangeTime(rangeTime: string) {
  return {
    '24h': 24,
    '7d': 28,
    '31d': 31,
  }[rangeTime]!;
}
