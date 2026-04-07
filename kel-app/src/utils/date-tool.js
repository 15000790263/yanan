import dayjs from 'dayjs';

import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// 获取某年偶数月份的最后一天
export function getLastDaysOfEvenMonths(year) {
  const evenMonths = [2, 4, 6, 8, 10, 12];
  const lastDays = evenMonths.map(month => {
    return dayjs(new Date(year, month, 0)).format('YYYY-MM-DD');
  });
  return lastDays;
}

// 判断某一天是否在时间段内的函数
export function isDateInRange(date, range) {
  const [startDate, endDate] = range.map(d => dayjs(d));
  const targetDate = dayjs(date);
  return targetDate.isSameOrAfter(startDate) && targetDate.isBefore(endDate);
}
