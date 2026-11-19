# lunar-today

Print today's Chinese lunar date (农历) in one line. Offline, zero config, one dependency.

English | [简体中文](README.zh-CN.md)

```console
$ lunar-today
2026-11-19 农历丙午年（马年）十月十一
$ lunar-today --date 2027-02-06
2027-02-06 农历丁未年（羊年）正月初一
$ lunar-today -d 2025-07-25
2025-07-25 农历乙巳年（蛇年）闰六月初一
```

Node's built-in `Intl` Chinese calendar says 2027-02-06 is 腊月三十, the last day of the old year. It is actually Chinese New Year, and `lunar-today` gets it right.

## Features

- **One line per date**: `YYYY-MM-DD 农历<干支>年（<生肖>年）<月名>月<日名>`. Easy to drop into a shell prompt, a tmux or status bar, a daily-notes template, or a reminder script.
- **Today or any day from 1901 to 2100**: no options means today in your local time zone; `--date` / `-d` converts any date from 1901-01-01 to 2100-12-31.
- **Leap months and year boundaries**: leap months get a 闰 prefix (闰六月, 闰冬月), and the stem-branch year and zodiac animal change at Chinese New Year, not at 立春.
- **Precise, not approximate**: conversions use the astronomical algorithms in [`lunar-javascript`](https://github.com/6tail/lunar-javascript) instead of Node's ICU calendar. The tests check 11 benchmark dates, including 2027-02-06.
- **Offline and zero config**: no network, no API key, no config file, no environment variables. One runtime dependency, pinned to an exact version, with the lockfile committed.
- **Script-friendly errors**: bad input prints one `错误：…` line to stderr, nothing to stdout, and exits with code 1.

## Quick start

Requires Node.js 20 or later.

```
git clone https://github.com/zhushen12580/lunar-today-smoke.git
cd lunar-today-smoke
npm install
node bin/lunar-today.js
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

### Output format and range

Each date conversion prints exactly one line (`--help` prints the multi-line help text shown above instead):

```
YYYY-MM-DD 农历<干支>年（<生肖>年）<月名>月<日名>
```

- The line starts with the Gregorian date that was converted, so scripts can tell which day it refers to.
- The stem-branch year (干支) and zodiac animal (生肖) change at Chinese New Year (正月初一), not at 立春.
- Months 11 and 12 are named 冬 and 腊. Leap months get a 闰 prefix, for example 闰六月.
- "Today" is the date in your computer's local time zone. For any other day, use `--date`.
- Only dates from 1901-01-01 to 2100-12-31 are supported.

### Errors

On error, `lunar-today` prints one line starting with `错误：` to stderr, prints nothing to stdout, and exits with code 1. For example:

```
node bin/lunar-today.js --date 2026-02-30
```

```
错误：日期不存在：2026-02-30
```

### Windows note

Chinese text displays correctly when the output goes straight to the terminal. To capture the output in a PowerShell variable or pipe it to a PowerShell cmdlet, run this first:

```
[Console]::OutputEncoding = [Text.Encoding]::UTF8
```

To pipe the output into another command-line program, also run the line below. Otherwise Windows PowerShell 5.1 sends the Chinese characters to that program as `?`. This encoding writes UTF-8 without a byte-order mark.

```
$OutputEncoding = New-Object System.Text.UTF8Encoding
```

## How it works

The whole tool is two short files:

- `bin/lunar-today.js` parses the options with Node's built-in `util.parseArgs` in strict mode, takes the year, month and day from `--date` or from your local clock, and writes either the result or a one-line error.
- `src/lunar.js` checks the date (format, that the day exists, and the 1901–2100 range), converts it with `Solar.fromYmd(year, month, day).getLunar()` from `lunar-javascript`, and formats the year, zodiac animal, month and day.

Why not use `Intl` and have no dependency at all? Because it gets recent dates wrong. On Node 22.20 (ICU 77.1):

```console
$ node -e "console.log(new Intl.DateTimeFormat('zh-CN-u-ca-chinese', {year: 'numeric', month: 'long', day: 'numeric'}).format(new Date(2027, 1, 6)))"
2026丙午年腊月30
$ lunar-today --date 2027-02-06
2027-02-06 农历丁未年（羊年）正月初一
```

The new moon that begins the lunar year falls a few minutes before midnight Beijing time on February 6, and ICU's approximation puts it on the wrong side of the day boundary. `lunar-javascript` gets it right, so `lunar-today` depends on it, pinned to exactly `1.7.8`.

## Running tests

```
npm test
```

This runs Node's built-in test runner (`node:test`); there are no dev dependencies. The tests cover the 11 benchmark dates (Chinese New Year in 2026 and 2027, the 2025 and 2033 leap months, both ends of the supported range, and more), every error message, and the CLI end to end.

## License

MIT. See [LICENSE](LICENSE).

Built with Claude Code & Codex
