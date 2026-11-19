'use strict';
const { Solar } = require('lunar-javascript');

function formatLunar({ year, month, day }) {
  const lunar = Solar.fromYmd(year, month, day).getLunar();
  const ymd = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return `${ymd} 农历${lunar.getYearInGanZhi()}年（${lunar.getYearShengXiao()}年）${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
}

module.exports = { formatLunar };
