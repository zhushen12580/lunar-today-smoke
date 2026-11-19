#!/usr/bin/env node
'use strict';
const { parseArgs } = require('node:util');
const { parseDate, formatLunar } = require('../src/lunar');

const HELP = `用法：lunar-today [-d YYYY-MM-DD]

打印今天（或指定公历日期）的农历日期。

选项：
  -d, --date YYYY-MM-DD  换算指定的公历日期（1901-01-01 至 2100-12-31）
  -h, --help             显示本帮助

示例：
  lunar-today
  lunar-today --date 2026-02-17
`;

function main() {
  let values;
  try {
    let tokens;
    ({ values, tokens } = parseArgs({
      args: process.argv.slice(2),
      options: {
        date: { type: 'string', short: 'd' },
        help: { type: 'boolean', short: 'h' },
      },
      strict: true,
      allowPositionals: false,
      tokens: true,
    }));
    // parseArgs 对重复选项只保留最后一个值；一次只换算一个日期，重复就算参数无效
    if (tokens.filter((t) => t.kind === 'option' && t.name === 'date').length > 1) {
      throw new Error();
    }
  } catch {
    throw new Error('参数无效，运行 lunar-today --help 查看用法');
  }

  if (values.help) {
    process.stdout.write(HELP);
    return;
  }

  let date;
  if (values.date !== undefined) {
    date = parseDate(values.date);
  } else {
    const now = new Date();
    date = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  }
  process.stdout.write(formatLunar(date) + '\n');
}

try {
  main();
} catch (err) {
  process.stderr.write('错误：' + err.message + '\n');
  process.exitCode = 1;
}
