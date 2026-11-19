'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const pkg = require('../package.json');
const { parseDate, formatLunar } = require('../src/lunar');

test('package.json：唯一运行时依赖 lunar-javascript 精确锁定为 1.7.8', () => {
  assert.deepEqual(pkg.dependencies, { 'lunar-javascript': '1.7.8' });
  assert.equal(pkg.devDependencies, undefined);
  assert.equal(require('lunar-javascript/package.json').version, '1.7.8');
  assert.deepEqual(pkg.bin, { 'lunar-today': 'bin/lunar-today.js' });
  assert.deepEqual(pkg.files, ['bin', 'src']);
  assert.equal(pkg.engines.node, '>=20');
  assert.equal(pkg.scripts.test, 'node --test');
});

test('package-lock.json：lunar-javascript 1.7.8 从 registry.npmjs.org 解析', () => {
  assert.deepEqual(require('../package-lock.json').packages['node_modules/lunar-javascript'], {
    version: '1.7.8',
    resolved: 'https://registry.npmjs.org/lunar-javascript/-/lunar-javascript-1.7.8.tgz',
    integrity: 'sha512-T79Lq2t5zjPu7nnkuUn3xFqIMIB5LCVSn6uJXQLvgWEqUGdE4KQXqQOVBaoYsVHY/8MIwFd7ol9dJ5bP2ItXUQ==',
    license: 'MIT',
  });
});

const BASELINE = [
  ['2026-11-19', '2026-11-19 农历丙午年（马年）十月十一'],
  ['2026-02-16', '2026-02-16 农历乙巳年（蛇年）腊月廿九'],
  ['2026-02-17', '2026-02-17 农历丙午年（马年）正月初一'],
  ['2027-02-06', '2027-02-06 农历丁未年（羊年）正月初一'],
  ['2025-07-25', '2025-07-25 农历乙巳年（蛇年）闰六月初一'],
  ['2025-08-22', '2025-08-22 农历乙巳年（蛇年）闰六月廿九'],
  ['2033-12-22', '2033-12-22 农历癸丑年（牛年）闰冬月初一'],
  ['2026-12-31', '2026-12-31 农历丙午年（马年）冬月廿三'],
  ['2057-09-28', '2057-09-28 农历丁丑年（牛年）八月三十'],
  ['1901-01-01', '1901-01-01 农历庚子年（鼠年）冬月十一'],
  ['2100-12-31', '2100-12-31 农历庚申年（猴年）腊月初一'],
];

for (const [ymd, expected] of BASELINE) {
  test(`formatLunar：${ymd}`, () => {
    const [year, month, day] = ymd.split('-').map(Number);
    assert.equal(formatLunar({ year, month, day }), expected);
  });
}

test('parseDate：合法日期返回数字年月日（含边界与闰日）', () => {
  assert.deepEqual(parseDate('2026-02-17'), { year: 2026, month: 2, day: 17 });
  assert.deepEqual(parseDate('1901-01-01'), { year: 1901, month: 1, day: 1 });
  assert.deepEqual(parseDate('2100-12-31'), { year: 2100, month: 12, day: 31 });
  assert.deepEqual(parseDate('2024-02-29'), { year: 2024, month: 2, day: 29 });
  assert.deepEqual(parseDate('2000-02-29'), { year: 2000, month: 2, day: 29 });
});

const FORMAT = '日期格式应为 YYYY-MM-DD，例如 2026-02-17';
const RANGE = '仅支持 1901-01-01 至 2100-12-31 之间的日期';
const REJECTED = [
  ['2026/02/17', FORMAT],
  ['2026-2-17', FORMAT],
  ['20260217', FORMAT],
  ['2026-02-17 ', FORMAT],
  ['', FORMAT],
  ['2026-02-30', '日期不存在：2026-02-30'],
  ['2026-04-31', '日期不存在：2026-04-31'],
  ['2026-13-01', '日期不存在：2026-13-01'],
  ['2026-00-10', '日期不存在：2026-00-10'],
  ['2100-02-29', '日期不存在：2100-02-29'],
  ['1900-12-31', RANGE],
  ['2101-01-01', RANGE],
  ['0099-12-31', RANGE],
  ['9999-12-31', RANGE],
];

for (const [text, message] of REJECTED) {
  test(`parseDate 拒绝 ${JSON.stringify(text)}`, () => {
    assert.throws(() => parseDate(text), { message });
  });
}
