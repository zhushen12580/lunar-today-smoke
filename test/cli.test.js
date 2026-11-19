'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');

function run(args, env = {}, cwd = ROOT) {
  return spawnSync(process.execPath, ['bin/lunar-today.js', ...args], {
    cwd,
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

const INVALID_ARGS = '错误：参数无效，运行 lunar-today --help 查看用法';
const ERROR_CASES = [
  [['--date', '2026/02/17'], '错误：日期格式应为 YYYY-MM-DD，例如 2026-02-17'],
  [['--date', '2026-02-30'], '错误：日期不存在：2026-02-30'],
  [['--date', '1900-12-31'], '错误：仅支持 1901-01-01 至 2100-12-31 之间的日期'],
  [['--date', '2101-01-01'], '错误：仅支持 1901-01-01 至 2100-12-31 之间的日期'],
  [['--foo'], INVALID_ARGS],
  [['--date'], INVALID_ARGS],
  [['x'], INVALID_ARGS],
  [['--date', 'bad', '--date', '2026-02-17'], INVALID_ARGS],
  [['--date', '2026-02-17', '-d', '2026-02-17'], INVALID_ARGS],
];

for (const [args, line] of ERROR_CASES) {
  test(`CLI 错误：${args.join(' ')}`, () => {
    const r = run(args);
    assert.equal(r.status, 1);
    assert.equal(r.stdout, '');
    assert.equal(r.stderr, line + '\n');
  });
}

const HELP = [
  '用法：lunar-today [-d YYYY-MM-DD]',
  '',
  '打印今天（或指定公历日期）的农历日期。',
  '',
  '选项：',
  '  -d, --date YYYY-MM-DD  换算指定的公历日期（1901-01-01 至 2100-12-31）',
  '  -h, --help             显示本帮助',
  '',
  '示例：',
  '  lunar-today',
  '  lunar-today --date 2026-02-17',
  '',
].join('\n');

const HELP_CASES = [
  ['--help'],
  ['-h'],
  ['--help', '--date', '2026/02/17'],
  ['--help', '--date', 'bad', '--date', '2026-02-17'],
];

for (const args of HELP_CASES) {
  test(`CLI ${args.join(' ')} 只输出帮助`, () => {
    const r = run(args);
    assert.equal(r.stderr, '');
    assert.equal(r.status, 0);
    assert.equal(r.stdout, HELP);
  });
}

test('CLI 未安装依赖：帮助照常输出，换算日期提示运行 npm install', async (t) => {
  // 模拟刚克隆、还没 npm install 的项目
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lunar-today-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  for (const name of ['bin', 'src', 'package.json']) {
    fs.cpSync(path.join(ROOT, name), path.join(dir, name), { recursive: true });
  }
  assert.throws(() => require.resolve('lunar-javascript', { paths: [path.join(dir, 'src')] }));

  for (const args of [['--help'], ['-h']]) {
    await t.test(args.join(' '), () => {
      const r = run(args, {}, dir);
      assert.equal(r.stderr, '');
      assert.equal(r.status, 0);
      assert.equal(r.stdout, HELP);
    });
  }
  for (const args of [['--date', '2026-02-17'], []]) {
    await t.test(args.join(' ') || '无参数', () => {
      const r = run(args, {}, dir);
      assert.equal(r.status, 1);
      assert.equal(r.stdout, '');
      assert.equal(r.stderr, '错误：未安装依赖 lunar-javascript，请先在项目目录运行 npm install\n');
    });
  }
});
