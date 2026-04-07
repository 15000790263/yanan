const defaultRangeDays = 30;

const formatDateString = date => {
  return [
    date.getFullYear(),
    date.getMonth() + 1, // 月份是从0开始的，所以要加1
    date.getDate(),
  ]
    .join('-')
    .replace(/\b(\d)\b/g, '0$1'); // 填充前导0
};

export function getDateRange(rangeDays = defaultRangeDays) {
  const now = new Date();
  const before = new Date(now);
  const nextDay = new Date(now);
  nextDay.setDate(now.getDate() + 1);
  before.setDate(now.getDate() - rangeDays);

  return {
    today: formatDateString(now),
    before: formatDateString(before),
    nextDay: formatDateString(nextDay),
    todayDate: now,
    nextDayDate: nextDay,
    beforeDate: before,
  };
}

export function getTodayDateString() {
  const now = new Date();

  return formatDateString(now);
}

export function getMonthInfo(date = new Date()) {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const str = [
    year,
    month, // 月份是从0开始的，所以要加1
  ]
    .join('-')
    .replace(/\b(\d)\b/g, '0$1'); // 填充前导0

  return {
    str,
    year,
    month,
  };
}

/**
 * 某月的第一天和最后一天
 */
export function getMonthRange(inputDate) {
  // 解析输入的日期字符串
  let [year, month] = inputDate
    ? inputDate.split('-')
    : [new Date().getFullYear(), new Date().getMonth() + 1];

  month = parseInt(month, 10); // 确保月份是数字类型

  // 如果月份小于1或大于12，使用当前月份
  if (isNaN(month) || month < 1 || month > 12) {
    month = new Date().getMonth() + 1;
  }

  // 创建当前月份第一天的日期对象
  const firstDay = new Date(year, month - 1, 1);
  // 计算当前月份的最后一天
  const lastDay = new Date(year, month, 0);

  // 计算下一个月的第一天（当前月份的最后一天加一天）
  const endPlusOne = new Date(year, month, 1);
  // 格式化日期为 YYYY-MM-DD 格式
  const formatDate = date => {
    const d = new Date(date);
    let day = d.getDate();
    const formattedDate = [
      d.getFullYear(),
      ('0' + (d.getMonth() + 1)).slice(-2), // 月份从0开始，需要+1
      ('0' + day).slice(-2),
    ].join('-');

    return formattedDate;
  };

  return {
    beforeDate: firstDay,
    endDate: lastDay,
    endPlusOneDate: endPlusOne,
    before: formatDate(firstDay), // 当前月份第一天
    end: formatDate(lastDay), // 当前月份最后一天
    endPlusOne: formatDate(endPlusOne),
  };
}
