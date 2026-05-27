# Debugging Guide

最后更新：2026-04-13

这份文档把当前仓库已经存在的 `debug:*` / `verify:*` 调试入口整理成一份**可重复执行的 maintainer debugging guide**。

目标不是发明新的调试机制，而是回答下面这些维护者问题：

- reduced build 和 full local build 各自应该怎么调；
- startup / trust / REPL path 出问题时先跑什么；
- print mode / request path 卡住时怎么区分“代码坏了”和“环境没配好”；
- inspector / doctor / restoration 分别适合看什么；
- type-heavy 面（bridge / transport / print）应该先跑哪些入口；
- 普通终端、脚本环境、pseudo-TTY 环境的差异到底在哪里；
- 当前哪些 debug 面已经进入 CI proof，哪些仍然是本地人工调试面。

如果你是第一次接触这个仓库，建议先配合阅读：

- [`ENGINEERING_CONTRACT.md`](./ENGINEERING_CONTRACT.md)
- [`BOOTSTRAP.md`](./BOOTSTRAP.md)
- [`VERIFICATION_MATRIX.md`](./VERIFICATION_MATRIX.md)
- [`MODULE_RESTORATION_LEDGER.md`](./MODULE_RESTORATION_LEDGER.md)

---

## 1. 先记住当前调试入口分层

### 1.1 canonical verify 入口

这些命令更接近“工程护栏”，优先回答的是“仓库有没有退化”：

```bash
npm run verify
npm run verify:startup
npm run verify:pty-startup
npm run verify:typecheck
npm run verify:restoration
```

### 1.2 debug-oriented 入口

这些命令更接近“定位问题”，优先回答的是“哪一层坏了”：

```bash
npm run debug:reduced
npm run debug:full
npm run debug:startup
npm run debug:print
npm run debug:inspector
npm run debug:typecheck
```

### 1.3 两者的关系

- **verify 命令**：应尽量稳定、可进 CI、可作为 gate
- **debug 命令**：应尽量解释性强，帮助你定位 build/startup/request path 的问题

如果你只是想知道“仓库还安全吗”，先跑 `npm run verify`。
如果你已经知道哪里不对劲，才进入 `debug:*`。

---

## 2. reduced CLI 调试入口

reduced local build 的定位不是“完整产品”，而是：

- 结构检查
- 缺口观察
- unavailable boundary 验证
- 快速定位 local rebuild contract 是否退化

### 2.1 主要命令

```bash
npm run debug:reduced
npm run debug:inspector
npm run cli:status
```

### 2.2 这些命令分别做什么

- `npm run debug:reduced`
  - 运行 `build:local --debug`
  - 重点看 reduced build 本身是否还能产物化、是否保留 sourcemap

- `npm run debug:inspector`
  - 确保 reduced artifact 存在后执行 `inspect-build`
  - 输出 local source-build inspector 报告
  - 适合看 missing imports、generated/internal/content gap、`src/*` alias、`bun:bundle`、`MACRO.*`

- `npm run cli:status`
  - 更像 reduced build 的 maintainer-facing 摘要入口
  - 内部会运行 reduced `doctor`
  - 适合快速看 overall / request readiness / quick check

### 2.3 何时优先用 reduced 调试

当你怀疑问题属于：

- build graph
- missing module / compatibility layer
- unavailable reduced-build boundary
- restoration regression
- inspector 分类变化

优先从 reduced 面开始，而不是直接冲 full REPL。

---

## 3. full CLI 调试入口

full local build 的定位是：

- 启动完整 CLI 主入口
- 更接近真实 REPL / startup path
- 更容易暴露 runtime asset、auth、transport、request path 的问题

### 3.1 主要命令

```bash
npm run debug:full
npm run cli:build
npm run cli:run
```

### 3.2 它们分别适合看什么

- `npm run debug:full`
  - 运行 `build:full-local --debug`
  - 适合验证 full build 本身是否还能产物化、是否保留 sourcemap、vendored ripgrep 是否仍被复制

- `npm run cli:build`
  - 同时产出 reduced / full artifact
  - 适合在 debug 前先把 artifact 状态统一到最新

- `npm run cli:run -- --help`
  - 最低风险地探测 full CLI 主入口是否还能启动

- `npm run cli:run`
  - 进入交互式 REPL
  - 适合本地真实终端中的问题复现

### 3.3 何时不要直接从 full CLI 开始

如果你看到的是：

- missing import
- reduced unavailable boundary
- restoration regression
- build artifact 不存在

那通常先跑 reduced inspector 比直接开 full REPL 更划算。

---

## 4. startup / trust / REPL path 调试

当前 startup 相关主要入口有三类：

```bash
npm run verify:startup
npm run verify:pty-startup
npm run debug:startup
```

### 4.1 `verify:startup`

它回答的是：

- full local CLI 的最基本启动 surface 还在不在
- `--version` / `--help` 是否还能通过 wrapper 正常到达 full artifact

适合当作 smoke test，不适合拿来分析细日志。

### 4.2 `verify:pty-startup`

它回答的是：

- pseudo-TTY 环境下，CLI 是否能至少到达 `--help` surface

当前 canonical wrapper 是：

```bash
script -q /dev/null bun ./dist/full/cli.js --help
```

注意它**不是**：

- 真正长时间 interactive session 的 acceptance test
- trust / REPL 全链路成功证明

它只是一个 CI-safe 的 pseudo-TTY startup proof。

### 4.3 `debug:startup`

当前 `debug:startup` 会跑：

```bash
bun run cli:run -- --debug-to-stderr --help
```

它的价值是：

- 带出 startup 早期日志
- 不需要真的进入长时间交互会话
- 既适合本地，也适合 CI proof

如果这里失败，通常优先怀疑：

- build artifact 未更新
- vendored runtime asset 不完整
- 入口 wrapper 变化
- startup 初始化面（配置、MCP、LSP、插件）在早期就崩溃

---

## 5. print mode / request path 调试

这一层最容易误判，因为它已经进入了**真实请求边界**。

### 5.1 主要命令

```bash
npm run debug:print
npm run cli:run -- -p "hello"
```

### 5.2 当前 `debug:print` 的语义

`debug:print` 现在不是简单地把 `401` 当失败，而是这样解释结果：

- **OK**：print path 成功完成
- **WARN**：已经命中 request/auth boundary，但环境缺少可用认证或代理配置
- **FAIL**：出现了和认证边界无关的非预期错误

这意味着它更适合回答：

> “代码是否至少到达了真实请求路径？”

而不是回答：

> “当前机器是否有足够认证让请求一定成功？”

### 5.3 当 print mode 失败时先区分两类问题

#### A. 环境 / 认证边界

常见特征：

- `401`
- `Failed to authenticate`
- `Auth error`
- 代理或 base URL 不可用

这类问题通常不是代码回归。

#### B. 工程回归

常见特征：

- 入口 wrapper 崩溃
- startup 初始化没走完
- runtime 依赖缺失
- request payload / transport 路径代码异常

这类问题才应该视为真正的 debug 失败。

### 5.4 request path 调试建议顺序

```bash
npm run cli:check
npm run debug:startup
npm run debug:print
```

如果 `debug:startup` 都过不去，通常还没到认证问题那一步。

---

## 6. inspector / doctor / restoration 调试

这三者都和 reduced build 关系更紧，但关注点不同。

### 6.1 `doctor`

入口：

```bash
npm run cli:status
```

它更像 maintainer summary：

- overall status
- reduced diagnostics readiness
- full CLI artifact readiness
- request readiness

适合快速判断当前仓库“健康不健康”。

### 6.2 `inspect-build`

入口：

```bash
npm run debug:inspector
```

它更适合定位：

- missing import bucket 变化
- internal feature gap
- content asset gap
- `src/*` alias / `bun:bundle` / `MACRO.*` 依赖面

### 6.3 `verify:restoration`

入口：

```bash
npm run verify:restoration
```

它不是“看报告”，而是当前 restoration hard gate。

如果它失败，默认应理解为：

- local rebuild contract 被破坏了
- 或某个兼容层/边界层退化了

如果改动涉及 restoration 相关对象，还应同步查看：

- [`MODULE_RESTORATION_LEDGER.md`](./MODULE_RESTORATION_LEDGER.md)

---

## 7. type-heavy 面调试

当前最典型的 type-heavy 面包括：

- `bridge/*`
- `cli/transports/*`
- `cli/structuredIO.ts`
- `cli/print.ts`

### 7.1 第一入口不是“盲改代码”，而是先看 gate

优先顺序建议：

```bash
npm run verify:typecheck
npm run cli:check
npm run debug:print
```

### 7.2 如何理解 `debug:typecheck`

当前：

```bash
npm run debug:typecheck
```

实际上复用的是：

```bash
npm run verify:typecheck
```

也就是 baseline-backed no-regression gate。

它回答的是：

- 当前有没有新增类型错误

它**不回答**：

- 当前所有历史类型问题是否已经收敛完成

### 7.3 type-heavy 调试时最常见的误区

- 看到大量历史 TS errors 就误以为“这次改动全坏了”
- 不先跑 baseline gate，就直接肉眼看完整 `tsc` 输出
- 把 auth / request path 问题和 transport / typing 问题混在一起

正确做法通常是：

1. 先看 `verify:typecheck` 是否 regression
2. 再看 `cli:check` / `debug:print` 是否暴露运行期问题
3. 必要时再下钻到具体文件

---

## 8. TTY 与 pseudo-TTY 的区别

这部分非常重要，因为很多“本地能跑、CI 不稳定”都出在这里。

### 8.1 普通 TTY

特点：

- 你真的在终端里交互
- 适合观察真实 REPL / trust / prompt 行为

典型入口：

```bash
npm run cli:run
npm run debug:startup
```

### 8.2 pseudo-TTY

特点：

- 更接近脚本和 CI 环境
- 适合验证“程序至少能在 TTY-like 环境启动”

典型入口：

```bash
npm run verify:pty-startup
script -q /dev/null bun ./dist/full/cli.js --help
```

### 8.3 当前 pseudo-TTY 还不能证明什么

当前它**不能证明**：

- 完整 interactive TUI 长时间稳定
- trust / REPL / auth / request path 在 pseudo-TTY 下全链路可用

它只能证明：

- full CLI 在 pseudo-TTY 环境下仍能安全到达 startup/help surface

---

## 9. 当前支持与不支持的 debug 模式

### 9.1 当前支持的

- reduced build with debug sourcemap：`npm run debug:reduced`
- full build with debug sourcemap：`npm run debug:full`
- startup log probe：`npm run debug:startup`
- print-mode request-path probe：`npm run debug:print`
- reduced inspector report：`npm run debug:inspector`
- typecheck no-regression probe：`npm run debug:typecheck`
- pseudo-TTY startup proof：`npm run verify:pty-startup`

### 9.2 当前仍不应过度承诺的

- 无认证环境下的 print-mode 成功执行
- pseudo-TTY 下的完整 interactive REPL acceptance
- 更深层的 bridge / transport / print debugging workflow 自动化
- 一份完全独立的 maintainer workflow 文档（这是后续项）

### 9.3 什么时候该把结果当“warning”而不是“failure”

当前最典型的 warning case 是：

- `debug:print` 已经到达 auth boundary，但因为 API key / OAuth / proxy 配置失败而退出

这种情况说明：

- 代码路径是活的
- 环境未必可用

它不应被描述成“构建回归”。

---

## 10. 推荐的 day-2 debugging loop

### 10.1 startup / entrypoint / build 问题

```bash
npm run cli:build
npm run verify:startup
npm run verify:pty-startup
npm run debug:startup
```

### 10.2 request path / auth / proxy 问题

```bash
npm run cli:check
npm run debug:startup
npm run debug:print
```

### 10.3 restoration / missing-module / compatibility 问题

```bash
npm run debug:inspector
npm run verify:restoration
```

必要时同时查看：

```bash
docs/MODULE_RESTORATION_LEDGER.md
```

### 10.4 type-heavy 核心面问题

```bash
npm run verify:typecheck
npm run debug:print
npm run cli:check
```

---

## 11. 当前调试工作流的边界结论

截至当前阶段，可以比较准确地说：

- 仓库已经有一套**可重复执行**的 debug entrypoints；
- startup / print / inspector 已经进入 CI 作为 debug proof；
- pseudo-TTY startup 已经有 canonical wrapper；
- typecheck 与 restoration 已经分别有 no-regression / hard gate；
- 但更完整的 interactive TUI acceptance、bridge/transport 深度调试与更正式的 maintainer workflow 仍然不是最终形态。

因此当前最准确的表述不是“debugging 已彻底完成”，而是：

> 这个仓库已经从“靠口头经验调试”推进到了“有可执行 debug surfaces 和文档化入口”，但更细粒度的 day-2 maintainer workflow 仍值得继续收口。
