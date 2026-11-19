# lunar-today

[English](README.md) | 中文

一行打印今天的农历日期。

```
lunar-today  →  2026-11-19 农历丙午年（马年）十月十一
```

不联网，不要 API key，也不用配置；每换算一个日期，输出恰好一行。可以直接放进 shell 提示符、tmux 或状态栏、每日笔记模板和提醒脚本。

## 为什么不用 `Intl`

Node 内置的 `Intl` 中国历（ICU）会算错近期日期。例如它把 2027-02-06 算成丙午年腊月三十，正确结果是丁未年正月初一（春节）。这一天的朔出现在北京时间午夜前几分钟，ICU 的近似算法把这个农历月的开始推迟了一天，算成 2 月 7 日。

`lunar-today` 改用 [`lunar-javascript`](https://github.com/6tail/lunar-javascript)，它实现了精确的天文算法。这是唯一的依赖，版本精确锁定为 `1.7.8`。测试用一组公开可查的基准日期做回归检查，2027-02-06 也在其中。

## 环境要求

Node.js 20 或更高版本。

## 安装

克隆本仓库并进入仓库根目录，然后安装依赖：

```
npm install
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

## 输出格式与日期范围

每次换算日期都输出恰好一行（`--help` 则输出上面的多行帮助文本）：

```
YYYY-MM-DD 农历<干支>年（<生肖>年）<月名>月<日名>
```

- 行首是被换算的公历日期，脚本可以据此判断这一行对应哪一天。
- 干支年和生肖在春节（正月初一）切换，不在立春切换。
- 十一月、十二月写作冬月、腊月。闰月带"闰"字前缀，例如闰六月。
- "今天"指本机时区的日期。要查其他日期，用 `--date`。
- 只支持 1901-01-01 至 2100-12-31 之间的日期。

## 错误

出错时，`lunar-today` 在标准错误输出一行以 `错误：` 开头的提示，标准输出为空，退出码为 1。例如：

```
node bin/lunar-today.js --date 2026-02-30
```

```
错误：日期不存在：2026-02-30
```

## Windows 编码提示

输出直接显示在终端时，中文正常。要在 PowerShell 中把输出捕获到变量，或通过管道传给 PowerShell 命令（cmdlet），先运行：

```
[Console]::OutputEncoding = [Text.Encoding]::UTF8
```

要通过管道传给其他命令行程序，还要再运行下面这行，否则 Windows PowerShell 5.1 会把中文变成 `?` 再传过去。这个编码输出的 UTF-8 不带 BOM。

```
$OutputEncoding = New-Object System.Text.UTF8Encoding
```

## 运行测试

```
npm test
```

## 许可证

MIT，见 [LICENSE](LICENSE)。

Built with Claude Code & Codex
