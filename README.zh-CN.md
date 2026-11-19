# lunar-today

一条命令，一行打印今天的农历日期。不联网、零配置，只有一个依赖。

[English](README.md) | 简体中文

```console
$ lunar-today
2026-11-19 农历丙午年（马年）十月十一
$ lunar-today --date 2027-02-06
2027-02-06 农历丁未年（羊年）正月初一
$ lunar-today -d 2025-07-25
2025-07-25 农历乙巳年（蛇年）闰六月初一
```

Node 内置的 `Intl` 中国历把 2027-02-06 算成腊月三十，也就是除夕。这一天其实是春节，`lunar-today` 算对了。

## 特性

- **每个日期一行**：`YYYY-MM-DD 农历<干支>年（<生肖>年）<月名>月<日名>`。可以直接放进 shell 提示符、tmux 或状态栏、每日笔记模板和提醒脚本。
- **今天，或 1901 至 2100 年间的任意一天**：不带参数时按本机时区取今天；用 `--date` / `-d` 可以换算 1901-01-01 至 2100-12-31 之间的任意日期。
- **闰月和年界都处理好了**：闰月带"闰"字（闰六月、闰冬月）；干支年和生肖在春节切换，不在立春切换。
- **精确算法，不是近似**：换算用 [`lunar-javascript`](https://github.com/6tail/lunar-javascript) 的天文算法，不用 Node 的 ICU 日历。测试覆盖 11 个基准日期，2027-02-06 也在其中。
- **离线、零配置**：不联网，不要 API key，没有配置文件，也不读环境变量。只有一个运行时依赖，版本精确锁定，lockfile 已提交。
- **方便脚本处理的错误**：输入有误时，标准错误输出一行 `错误：…`，标准输出为空，退出码为 1。

## 快速开始

需要 Node.js 20 或更高版本。

```
git clone https://github.com/zhushen12580/lunar-today-smoke.git
cd lunar-today-smoke
npm install
node bin/lunar-today.js
```

## 用法

打印今天的农历日期（按本机时区）：

```
node bin/lunar-today.js
```

在 2026-11-19 运行，输出：

```
2026-11-19 农历丙午年（马年）十月十一
```

用 `--date`（或 `-d`）换算指定的公历日期：

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

查看帮助：

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

### 可选：全局安装

想在任意目录直接运行 `lunar-today`，在仓库根目录全局安装：

```
npm install -g .
lunar-today
```

卸载：

```
npm uninstall -g lunar-today
```

### 输出格式与日期范围

每次换算日期都输出恰好一行（`--help` 则输出上面的多行帮助文本）：

```
YYYY-MM-DD 农历<干支>年（<生肖>年）<月名>月<日名>
```

- 行首是被换算的公历日期，脚本可以据此判断这一行对应哪一天。
- 干支年和生肖在春节（正月初一）切换，不在立春切换。
- 十一月、十二月写作冬月、腊月。闰月带"闰"字前缀，例如闰六月。
- "今天"指本机时区的日期。要查其他日期，用 `--date`。
- 只支持 1901-01-01 至 2100-12-31 之间的日期。

### 错误

出错时，`lunar-today` 在标准错误输出一行以 `错误：` 开头的提示，标准输出为空，退出码为 1。例如：

```
node bin/lunar-today.js --date 2026-02-30
```

```
错误：日期不存在：2026-02-30
```

### Windows 编码提示

输出直接显示在终端时，中文正常。要在 PowerShell 中把输出捕获到变量，或通过管道传给 PowerShell 命令（cmdlet），先运行：

```
[Console]::OutputEncoding = [Text.Encoding]::UTF8
```

要通过管道传给其他命令行程序，还要再运行下面这行，否则 Windows PowerShell 5.1 会把中文变成 `?` 再传过去。这个编码输出的 UTF-8 不带 BOM。

```
$OutputEncoding = New-Object System.Text.UTF8Encoding
```

## 实现原理

整个工具只有两个短文件：

- `bin/lunar-today.js` 用 Node 内置的 `util.parseArgs`（严格模式）解析参数，从 `--date` 或本机时钟取年、月、日，然后输出结果或一行错误提示。
- `src/lunar.js` 校验日期（格式、日期是否存在、是否在 1901–2100 年之间），调用 `lunar-javascript` 的 `Solar.fromYmd(year, month, day).getLunar()` 换算，再拼出干支年、生肖、月和日。

既然 Node 自带 `Intl`，为什么还要依赖一个库？因为 `Intl` 会算错近期的日期。在 Node 22.20（ICU 77.1）上：

```console
$ node -e "console.log(new Intl.DateTimeFormat('zh-CN-u-ca-chinese', {year: 'numeric', month: 'long', day: 'numeric'}).format(new Date(2027, 1, 6)))"
2026丙午年腊月30
$ lunar-today --date 2027-02-06
2027-02-06 农历丁未年（羊年）正月初一
```

丁未年正月的朔出现在 2 月 6 日北京时间午夜前几分钟，ICU 的近似算法把它算到了第二天，于是春节被推迟到 2 月 7 日。`lunar-javascript` 算得对，所以 `lunar-today` 依赖它，版本精确锁定为 `1.7.8`。

## 运行测试

```
npm test
```

测试用 Node 内置的 `node:test` 运行，不需要任何开发依赖。覆盖 11 个基准日期（2026、2027 年春节，2025 年和 2033 年的闰月，支持范围的两端等）、每一条错误提示，以及 CLI 的端到端行为。

## 许可证

MIT，见 [LICENSE](LICENSE)。

Built with Claude Code & Codex
