'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');

function run(args, env = {}) {
  return spawnSync(process.execPath, ['bin/lunar-today.js', ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

function localToday(timeZone) {
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date());
}

const DATE_CASES = [
  [['--date', '2026-02-17'], '2026-02-17 农历丙午年（马年）正月初一'],
  [['-d', '2026-02-16'], '2026-02-16 农历乙巳年（蛇年）腊月廿九'],
  [['--date', '2025-07-25'], '2025-07-25 农历乙巳年（蛇年）闰六月初一'],
  [['--date', '2027-02-06'], '2027-02-06 农历丁未年（羊年）正月初一'],
  [['--date=2026-02-17'], '2026-02-17 农历丙午年（马年）正月初一'],
  [['-d2026-02-17'], '2026-02-17 农历丙午年（马年）正月初一'],
];

for (const [args, line] of DATE_CASES) {
  test(`CLI ${args.join(' ')}`, () => {
    const r = run(args);
    assert.equal(r.stderr, '');
    assert.equal(r.status, 0);
    assert.equal(r.stdout, line + '\n');
  });
}

test('CLI 无参数：输出本机今天，且与 --date <今天> 的输出完全相同', () => {
  const before = localToday();
  const r = run([]);
  const after = localToday();
  assert.equal(r.stderr, '');
  assert.equal(r.status, 0);
  assert.match(r.stdout, /^\d{4}-\d{2}-\d{2} 农历[^\n]+\n$/);
  const date = r.stdout.slice(0, 10);
  assert.ok([before, after].includes(date), `${date} 不是本机今天 ${before}`);
  assert.equal(r.stdout, run(['--date', date]).stdout);
});

for (const tz of ['Pacific/Kiritimati', 'Etc/GMT+12']) {
  test(`CLI 无参数：TZ=${tz} 时取该时区的今天，而不是 UTC 日期`, () => {
    const before = localToday(tz);
    const r = run([], { TZ: tz });
    const after = localToday(tz);
    assert.equal(r.status, 0);
    assert.ok([before, after].includes(r.stdout.slice(0, 10)), r.stdout);
  });
}
