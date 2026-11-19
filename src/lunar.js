'use strict';

function parseDate(text) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new Error('日期格式应为 YYYY-MM-DD，例如 2026-02-17');
  }
  const [year, month, day] = text.split('-').map(Number);
  // setUTCFullYear avoids Date.UTC mapping years 0-99 to 1900-1999
  const d = new Date(Date.UTC(2000, 0, 1));
  d.setUTCFullYear(year, month - 1, day);
  if (d.getUTCFullYear() !== year || d.getUTCMonth() + 1 !== month || d.getUTCDate() !== day) {
    throw new Error(`日期不存在：${text}`);
  }
  if (year < 1901 || year > 2100) {
    throw new Error('仅支持 1901-01-01 至 2100-12-31 之间的日期');
  }
  return { year, month, day };
}

// Loaded lazily so --help and input errors still work before `npm install`
function loadSolar() {
  try {
    return require('lunar-javascript').Solar;
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      throw new Error('未安装依赖 lunar-javascript，请先在项目目录运行 npm install');
    }
    throw err;
  }
}

function formatLunar({ year, month, day }) {
  const lunar = loadSolar().fromYmd(year, month, day).getLunar();
  const ymd = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return `${ymd} 农历${lunar.getYearInGanZhi()}年（${lunar.getYearShengXiao()}年）${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
}

module.exports = { parseDate, formatLunar };
