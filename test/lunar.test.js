'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const pkg = require('../package.json');
const { formatLunar } = require('../src/lunar');

test('package.json：唯一运行时依赖 lunar-javascript 精确锁定为 1.7.8', () => {
  assert.deepEqual(pkg.dependencies, { 'lunar-javascript': '1.7.8' });
  assert.equal(pkg.devDependencies, undefined);
  assert.equal(require('lunar-javascript/package.json').version, '1.7.8');
  assert.deepEqual(pkg.bin, { 'lunar-today': 'bin/lunar-today.js' });
  assert.deepEqual(pkg.files, ['bin', 'src']);
  assert.equal(pkg.engines.node, '>=20');
  assert.equal(pkg.scripts.test, 'node --test');
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
