#!/usr/bin/env node
'use strict';
const { parseArgs } = require('node:util');
const { parseDate, formatLunar } = require('../src/lunar');

function main() {
  let values;
  try {
    ({ values } = parseArgs({
      args: process.argv.slice(2),
      options: { date: { type: 'string', short: 'd' } },
      strict: true,
      allowPositionals: false,
    }));
  } catch {
    throw new Error('参数无效，运行 lunar-today --help 查看用法');
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
