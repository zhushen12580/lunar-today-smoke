#!/usr/bin/env node
'use strict';
const { parseArgs } = require('node:util');
const { parseDate, formatLunar } = require('../src/lunar');

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: { date: { type: 'string', short: 'd' } },
  strict: true,
  allowPositionals: false,
});

let date;
if (values.date !== undefined) {
  date = parseDate(values.date);
} else {
  const now = new Date();
  date = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}
process.stdout.write(formatLunar(date) + '\n');
