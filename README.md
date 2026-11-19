# lunar-today

English | [中文](README.zh-CN.md)

Print today's Chinese lunar date in one line.

```
lunar-today  →  2026-11-19 农历丙午年（马年）十月十一
```

It runs offline, needs no configuration or API key, and prints each converted date as exactly one line. That makes it easy to drop into a shell prompt, a tmux or status bar, a daily-notes template, or a reminder script.

## Why

Node's built-in `Intl` Chinese calendar (ICU) gets recent dates wrong. For example, it reports 2027-02-06 as 丙午年腊月三十, but the correct answer is 丁未年正月初一 (Chinese New Year). The new moon falls a few minutes before midnight Beijing time that day, and ICU's approximation puts it on the wrong side of the day boundary.

`lunar-today` uses [`lunar-javascript`](https://github.com/6tail/lunar-javascript) instead, which implements precise astronomical algorithms. It is the only dependency, pinned to exactly `1.7.8`, and the test suite checks a set of publicly verifiable dates (including 2027-02-06) to catch regressions.

## Requirements

Node.js 20 or later.

## Install

Clone this repository and change into the repository root. Then install the dependency:

```
npm install
```

## Usage

Print today's lunar date (uses your computer's local time zone):

```
node bin/lunar-today.js
```

Run on 2026-11-19, this prints:

```
2026-11-19 农历丙午年（马年）十月十一
```

Convert a specific Gregorian date with `--date` (or `-d`):

```
node bin/lunar-today.js --date 2027-02-06
```

```
2027-02-06 农历丁未年（羊年）正月初一
```

```
node bin/lunar-today.js -d 2025-07-25
```

```
2025-07-25 农历乙巳年（蛇年）闰六月初一
```

Show the help text:

```
node bin/lunar-today.js --help
```

```
用法：lunar-today [-d YYYY-MM-DD]

打印今天（或指定公历日期）的农历日期。

选项：
  -d, --date YYYY-MM-DD  换算指定的公历日期（1901-01-01 至 2100-12-31）
  -h, --help             显示本帮助

示例：
  lunar-today
  lunar-today --date 2026-02-17
```

### Optional: global install

To run it as `lunar-today` from anywhere, install it globally from the repository root:

```
npm install -g .
lunar-today
```

To uninstall:

```
npm uninstall -g lunar-today
```

## Output format and range

Each date conversion prints exactly one line (`--help` prints the multi-line help text shown above instead):

```
YYYY-MM-DD 农历<干支>年（<生肖>年）<月名>月<日名>
```

- The line starts with the Gregorian date that was converted, so scripts can tell which day it refers to.
- The stem-branch year (干支) and zodiac animal (生肖) change at Chinese New Year (正月初一), not at 立春.
- Months 11 and 12 are named 冬 and 腊. Leap months get a 闰 prefix, for example 闰六月.
- "Today" is the date in your computer's local time zone. For any other day, use `--date`.
- Only dates from 1901-01-01 to 2100-12-31 are supported.

## Errors

On error, `lunar-today` prints one line starting with `错误：` to stderr, prints nothing to stdout, and exits with code 1. For example:

```
node bin/lunar-today.js --date 2026-02-30
```

```
错误：日期不存在：2026-02-30
```

## Windows note

Chinese text displays correctly when the output goes straight to the terminal. To capture the output in a PowerShell variable or pass it through a pipe, run this first:

```
[Console]::OutputEncoding = [Text.Encoding]::UTF8
```

## Running tests

```
npm test
```

## License

MIT. See [LICENSE](LICENSE).

Built with Claude Code & Codex
