# Claude Code 本地构建与使用指南

这份文档面向未来的 GitHub 开源读者，目标是把这个仓库当前已经验证过的能力讲清楚：

- 这个仓库现在到底能构建出什么；
- 从 0 到 1 的本地构建流程是什么；
- 构建出来以后如何实际运行；
- 运行失败时应该优先检查什么；
- 如果后续开源发布，README / 仓库说明应该怎样表述才准确。

> 当前结论先写在前面：这个仓库**已经可以构建并启动 full local CLI**，产物为 `dist/full/cli.js`；在当前本地验证中，它可以进入交互式界面与 REPL。与此同时，它**仍然不是上游官方产物的忠实重建**，真实请求是否成功还依赖你的认证、代理和环境配置。

如果你想先看这套构建/运行说明所依赖的工程边界，建议先读 [`docs/ENGINEERING_CONTRACT.md`](./ENGINEERING_CONTRACT.md)。它定义了当前仓库关于 Bun 版本、reduced/full build、`MACRO.*`、`process.env.*`、`file:stubs/*`、vendored ripgrep 与 native/Cargo 范围的基础契约。

如果你是从干净 checkout 第一次进入这个仓库，建议再配合阅读 [`docs/BOOTSTRAP.md`](./BOOTSTRAP.md)。它把 install 后哪些资产必须存在、`bootstrap` / `verify:bootstrap` 应该怎么跑，以及 clean-state CI 应走哪条路径写成了显式入口。

当前仓库也开始提供第一批 canonical maintenance scripts；如果你想优先使用维护入口而不是手拼底层命令，可以直接从 `npm run verify`、`npm run verify:bootstrap`、`npm run verify:status`、`npm run verify:startup`、`npm run verify:typecheck` 与 `npm run verify:restoration` 开始。

如果你想知道这些命令分别覆盖哪一个 verification surface，以及哪些当前仍然只是报告型入口，请继续阅读 [`docs/VERIFICATION_MATRIX.md`](./VERIFICATION_MATRIX.md)。

如果你想知道当前哪些 stub、shim、vendored runtime asset 与 unavailable reduced-build surface 仍然被明确治理，请继续阅读 [`docs/MODULE_RESTORATION_LEDGER.md`](./MODULE_RESTORATION_LEDGER.md)。

如果你准备进一步定位 startup、print mode、inspector、pseudo-TTY 或 request path 问题，请继续阅读 [`docs/DEBUGGING.md`](./DEBUGGING.md)。

---

## 1. 仓库当前状态

### 1.1 这是什么

这个仓库更准确的定位是：

> 一个面向不完整公开源码快照的本地重建与修复工作区。

它不是上游官方发布仓库，也不应被描述为“完整还原版 Claude Code”。

### 1.2 当前已经验证可用的能力

| 能力 | 当前状态 | 说明 |
|---|---|---|
| reduced local build | 可用 | 产物为 `dist/local/cli.local.js` |
| full local build | 可用 | 产物为 `dist/full/cli.js` |
| `--help` / `--version` | 可用 | reduced / full 两条链路都已验证 |
| 进入交互 REPL | 可用 | full local CLI 已验证 |
| 实际发送模型请求 | 取决于环境 | 是否成功取决于认证 / 代理 / 网络环境 |
| 上游官方发布等价物 | 不可宣称 | 当前仍有公开快照与内部构建体系差异 |

### 1.3 两条本地构建链路

这个仓库当前有两条明确的构建路径：

1. **reduced local build**
   - 命令：`bun run build:local`
   - 产物：`dist/local/cli.local.js`
   - 用途：结构检查、诊断、缩减命令面验证。

2. **full local build**
   - 命令：`bun run build:full-local`
   - 产物：`dist/full/cli.js`
   - 用途：启动完整 CLI 主入口、进入交互 REPL，并验证更接近真实使用方式的运行状态。

如果你只是想快速判断仓库“还能不能构建”，先跑 reduced build 即可；如果你想真正启动 Claude CLI 界面，请使用 full local build。

---

## 2. 从 0 到 1 的构建流程

### 2.1 环境准备

已验证的最低要求：

- Bun 1.3.x
- macOS 或类 Unix Shell 环境
- 可正常执行 `bun install`

建议先确认：

```bash
bun --version
```

### 2.2 获取仓库

```bash
git clone <your-repo-url>
cd claude-code
```

### 2.3 安装依赖

```bash
bun install
```

这一步会安装运行 full local build 所需的公开依赖，以及本仓库内的本地 stub 包。

### 2.3.1 更像产品 CLI 的入口

如果你不想直接记忆 `dist/full/cli.js` 和 `dist/local/cli.local.js`，可以把当前仓库当成一个带 `cli:*` 脚本入口的 CLI 项目来使用：

```bash
npm run cli:build
npm run cli:check
npm run cli:status
npm run cli:run -- --help
npm run cli:run
```

它们分别对应：

- `cli:build`：同时准备 reduced status 产物和 full runtime 产物。
- `cli:check`：跑一轮最小 CLI 验收，确认 build、status、version、help 都是通的。
- `cli:status`：复用 reduced build 的 `doctor` 输出，快速看当前仓库和构建状态。
- `cli:run -- --help`：验证 full CLI 主入口是否可执行。
- `cli:run`：直接进入 full local CLI 的交互式界面。

如果你要验证真实请求链路，也可以使用：

```bash
npm run cli:run -- -p "Reply with exactly: OK"
```

但这条路径是否成功，依赖认证、代理和环境配置，而不是只取决于构建是否成功。

### 2.4 构建 reduced local build

```bash
bun run build:local
```

预期产物：

```bash
dist/local/cli.local.js
```

这条链路适合做基础体检：

```bash
bun ./dist/local/cli.local.js --help
bun ./dist/local/cli.local.js --version
bun ./dist/local/cli.local.js inspect-build
bun ./dist/local/cli.local.js doctor
```

### 2.5 构建 full local build

```bash
bun run build:full-local
```

预期产物：

```bash
dist/full/cli.js
```

这一步除了打出 `cli.js`，还会把 vendored ripgrep 复制到：

```bash
dist/full/vendor/ripgrep/
```

这对 full CLI 的文件索引与搜索能力是必要的。

### 2.6 基础验证

构建完成后，建议先跑这几条：

```bash
npm run cli:build
npm run cli:check
npm run cli:status
npm run cli:run -- --help

bun ./dist/full/cli.js --version
bun ./dist/full/cli.js --help
```

如果 `--help` 和 `--version` 正常，就说明：

- 入口脚本可运行；
- commander 参数定义已通过；
- full build 产物本身是可执行的。

---

## 3. 如何实际运行

### 3.1 启动交互式 CLI

在正常终端中运行：

```bash
npm run cli:build
npm run cli:run

# 或者继续直接运行底层产物
bun ./dist/full/cli.js
```

CLI 启动后会进入交互式界面；首次运行时具体看到的前置界面可能因本地状态而不同，但在当前仓库验证中，交互式 REPL 已可进入。

### 3.2 在非交互环境里验证 TUI

如果你是在脚本、CI 或工具环境里验证，而不是真正的人类 TTY，建议用伪终端：

```bash
script -q /dev/null bun ./dist/full/cli.js
```

调试模式可以用：

```bash
script -q /dev/null bun ./dist/full/cli.js --debug-to-stderr
```

### 3.3 非交互模式（print mode）

```bash
npm run cli:run -- -p "hello"

# 或者继续直接运行底层产物
bun ./dist/full/cli.js -p "hello"
```

这条链路适合验证：

- headless 请求路径是否已打通；
- 当前环境是否有可用认证；
- 当前代理或 base URL 是否能正常响应 `/v1/messages`。

### 3.4 调试模式

如果你要诊断启动、认证、代理、插件或文件索引问题，推荐：

```bash
bun ./dist/full/cli.js --debug-to-stderr
```

它会把启动日志直接输出到 stderr，更适合定位问题。

---

## 4. 运行时需要什么认证 / 环境

当前 full local build 已经能把请求真正送到消息 API 路径，但**请求是否成功**取决于你的环境。

至少需要下面二者之一：

1. **可用的 API Key**
   - 典型是 `ANTHROPIC_API_KEY`

2. **可用的现有登录态 / OAuth 状态**

如果你还配置了代理或兼容网关，还要确认：

- `ANTHROPIC_BASE_URL` 指向的是一个真正可用的端点；
- 它能正确处理 `/v1/messages`；
- 不会在请求初期直接返回 `429 Service Unavailable`。

### 4.1 当前已经验证到的环境边界

在当前这套代码上，下面这些都已经不是代码问题：

- CLI 能启动；
- REPL 能挂载；
- print mode 能走到实际 API 请求路径。

如果你继续卡住，优先检查的是：

1. API key 是否存在；
2. OAuth 是否有效；
3. `ANTHROPIC_BASE_URL` 是否可用；
4. 代理是否把请求正确转发到了真实后端。

---

## 5. 当前已解决的关键问题

为了让 full local build 真正能跑到交互式 REPL，这个仓库当前已经补齐了几类关键缺口：

- full local build 入口与脚本：`build:full-local`
- `jsonc-parser` 依赖补齐
- `color-diff-napi` 的本地 stub
- `filePersistence` 相关类型/常量导出补齐
- 非法 CLI 选项定义修复（`-d2e` 兼容处理）
- `0.0.0-local` 的本地版本门禁放行
- `useEffectEvent` 在当前运行时不可用的问题，改为兼容回调模式
- vendored ripgrep 打包进 `dist/full/vendor/ripgrep`
- `execa` 的 `signal` → `cancelSignal` 兼容
- 缺失 `~/.claude/...` 目录导致的 ripgrep 启动噪音清理

这也是为什么现在仓库已经可以从“只能做 reduced build”推进到“能进入 full REPL”。

---

## 6. 当前仍然要诚实说明的限制

虽然 full local build 已可运行，但这仍然**不是**一个可以对外宣称为“官方等价重建版”的仓库。

建议明确保留以下边界：

### 6.1 仍然不是上游官方发布产物

- 版本号仍是 `0.0.0-local`
- 仓库包含多个本地 stub / shim
- 一些内部构建假设仍然被本地兼容层替代，而不是 1:1 恢复

### 6.2 某些能力仍然依赖环境或上游体系

- 真正的模型请求依赖认证、代理、网络
- 一部分私有 / 内部能力仍通过占位层处理
- 部分内部开关、组织策略、Provider 行为仍与公开环境不同

### 6.3 这更适合作为“可运行的本地重建工作区”

更准确的描述不是：

> 完整复刻 Claude Code 官方仓库

而是：

> 一个可构建、可启动、可继续修复的 Claude Code 本地重建工作区

---

## 7. 推荐写进 GitHub README 的最小信息

如果后续要正式开源到 GitHub，README 至少应该覆盖下面这些信息：

### 7.1 项目定位

- 仓库是什么
- 仓库不是什么
- 当前最可信的能力边界是什么

### 7.2 快速开始

至少包含：

```bash
bun install
bun run build:full-local
bun ./dist/full/cli.js
```

### 7.3 reduced / full 两条链路的区别

- `build:local`：偏诊断、偏体检
- `build:full-local`：偏真实 CLI 使用路径

### 7.4 已知限制

- 需要认证 / API key / 可用代理
- 不应宣称与官方发布完全等价
- 某些 stub / shim 是为了开源场景下的可构建性

### 7.5 贡献入口

当前已经补充：

- `docs/CONTRIBUTING.md`
- `docs/SECURITY.md`
- `.github/ISSUE_TEMPLATE/*`
- `.github/pull_request_template.md`
- `docs/REPO_SHAPE.md`
- `docs/OPEN_SOURCE_RELEASE_CHECKLIST.md`

仍然建议后续补充：

- `LICENSE`
- 一份清晰的“哪些模块是真实现，哪些是兼容层”的说明

---

## 8. 建议的开源发布文案

如果你要给这个仓库写一句最准确的介绍，建议使用类似下面的表述：

> A local rebuild and repair workspace for a public but incomplete Claude Code source snapshot. It can produce a reduced diagnostic build and a runnable full local CLI build, but it should not be described as a faithful upstream-equivalent release.

对应中文可以写成：

> 一个面向不完整公开源码快照的 Claude Code 本地重建与修复工作区。当前已经可以产出缩减诊断构建和可启动的 full local CLI，但不应被描述为与上游官方发布完全等价的版本。

---

## 9. 推荐的文档阅读顺序

第一次接触这个仓库，建议按这个顺序阅读：

1. `README.md` —— 看仓库定位和快速入口
2. `docs/README.md` —— 看文档总导航，以及哪些 Markdown 属于普通项目文档、哪些属于 GitHub / 运行时资产
3. `docs/ENGINEERING_CONTRACT.md` —— 看当前工程契约与 build/runtime 边界
4. `docs/BOOTSTRAP.md` —— 看干净 checkout 的安装与 bootstrap 验证路径
5. `docs/BUILD_AND_USAGE.md` —— 看从 0 到 1 的完整构建与使用方式
6. `docs/REPO_SHAPE.md` —— 看哪些目录更接近主体实现，哪些是兼容层和 stub
7. `docs/CONTRIBUTING.md` —— 看如何以正确方式参与修复与验证
8. `docs/SECURITY.md` —— 看这个重建仓库的安全边界与披露方式
9. `docs/LOCAL_BUILD_STATUS.md` —— 看修复过程、遗留边界和历史演进

---

## 10. 一组可直接复制的命令

### canonical maintenance scripts

```bash
npm run bootstrap
npm run verify:bootstrap
npm run verify
npm run verify:status
npm run verify:startup
npm run verify:typecheck
npm run verify:restoration
```

如果你要做面向维护的构建 / 验证工作，优先使用这组入口，而不是手拼底层命令。

### reduced build

```bash
bun install
bun run build:local
bun ./dist/local/cli.local.js --help
bun ./dist/local/cli.local.js --version
bun ./dist/local/cli.local.js inspect-build
bun ./dist/local/cli.local.js doctor
```

### full build

```bash
bun install
bun run build:full-local
bun ./dist/full/cli.js --version
bun ./dist/full/cli.js --help
bun ./dist/full/cli.js
```

### 调试 full build

```bash
bun ./dist/full/cli.js --debug-to-stderr
bun ./dist/full/cli.js -p "hello"
```

### 非交互环境验证 TUI

```bash
script -q /dev/null bun ./dist/full/cli.js
script -q /dev/null bun ./dist/full/cli.js --debug-to-stderr
```
