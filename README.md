# Claude Code 本地重建工作区

这个仓库是一个**面向不完整公开源码快照的本地重建与修复工作区**。

它当前已经可以：

- 产出一个 **reduced local build**：`dist/local/cli.local.js`
- 产出一个 **full local build**：`dist/full/cli.js`
- 启动 full local CLI，并进入交互式界面 / REPL

它当前**不能**被描述为：

- 上游官方发布仓库；
- 与上游官方产物完全等价的重建版；
- 所有内部功能都已 1:1 恢复的完整产品。

如果你只想知道“这个仓库现在到底能不能构建并跑起来”，答案是：**可以**。如果你想知道“是否已经和上游官方产物完全等价”，答案是：**不是**。

---

## 当前状态

| 项目 | 当前状态 |
|---|---|
| 顶层构建工具 | Bun |
| reduced local build | 可用 |
| full local build | 可用 |
| 交互式 REPL 启动 | 可用 |
| 实际消息请求路径 | 取决于环境 |
| 请求是否成功 | 取决于认证 / 代理 / 环境 |
| 上游官方等价重建 | 否 |

### 主要构建产物

- reduced build：`dist/local/cli.local.js`
- full build：`dist/full/cli.js`

---

## 快速开始

### 环境要求

- Bun 1.3.x
- macOS 或类 Unix Shell 环境

### 安装依赖

```bash
bun install
```

### 常用 CLI 入口

如果你更希望把这个仓库当成一个可运行的 CLI，而不是手动记忆 `dist/...` 路径，优先使用下面五条命令：

```bash
npm run cli:build
npm run cli:check
npm run cli:status
npm run cli:run -- --help
npm run cli:run
```

- `npm run cli:build`：准备 reduced 状态产物和 full 运行产物。
- `npm run cli:check`：执行一轮最小 CLI 验收，覆盖 build、status、version 和 help。
- `npm run cli:status`：运行当前仓库的本地状态检查，底层复用 reduced build 的 `doctor` 能力。
- `npm run cli:run -- --help`：检查完整 CLI 主入口是否可执行。
- `npm run cli:run`：直接进入 full local CLI 的交互界面。

如果你想走真实请求路径，也可以这样调用：

```bash
npm run cli:run -- -p "Reply with exactly: OK"
```

这条命令是否真的返回 `OK`，仍然取决于你当前环境是否具备可用认证 / 代理 / base URL 配置。

### 构建 reduced local build

```bash
bun run build:local
```

### 构建 full local build

```bash
bun run build:full-local
```

### 运行 full local CLI

```bash
bun ./dist/full/cli.js
```

### 基础验证命令

```bash
npm run cli:build
npm run cli:check
npm run cli:status
npm run test
npm run cli:run -- --help

bun ./dist/full/cli.js --version
bun ./dist/full/cli.js --help

bun ./dist/local/cli.local.js --version
bun ./dist/local/cli.local.js --help
bun ./dist/local/cli.local.js inspect-build
bun ./dist/local/cli.local.js doctor

npm run test
```

---

## 两条构建链路的区别

### `build:local`

适合：

- 快速验证仓库还能否构建
- 跑诊断与结构检查
- 跟踪 reduced build 的修复进度

产物：

```bash
dist/local/cli.local.js
```

### `build:full-local`

适合：

- 启动完整 CLI 主入口
- 验证完整 CLI 主入口与交互式界面
- 继续向更接近真实使用的本地 CLI 修复推进

产物：

```bash
dist/full/cli.js
```

---

## 运行时说明

当前 full local build 已经能：

- 启动 CLI
- 进入交互式 REPL

但**实际请求是否成功**，依赖你的运行环境是否具备：

- 可用的 `ANTHROPIC_API_KEY`，或
- 可用的现有登录态 / OAuth 状态，或
- 一个正确可用的 `ANTHROPIC_BASE_URL` / 代理端点

如果 CLI 已经进了 REPL，但请求失败，优先检查环境，而不是先怀疑构建链路。

---

## 文档索引

- [docs/README.md](./docs/README.md) —— 文档总入口，以及哪些 Markdown 属于真正项目文档、哪些属于 GitHub/运行时资产的边界说明
- [docs/ENGINEERING_CONTRACT.md](./docs/ENGINEERING_CONTRACT.md) —— 当前工程契约：Bun 版本、reduced/full build 定义、stub、构建期宏与 runtime assets 的边界
- [docs/BOOTSTRAP.md](./docs/BOOTSTRAP.md) —— 干净 checkout 的安装、资产检查、bootstrap 验证路径与 CI 入口
- [docs/VERIFICATION_MATRIX.md](./docs/VERIFICATION_MATRIX.md) —— 当前 verification surface、canonical scripts、CI 覆盖与报告型/硬门禁边界
- [docs/BUILD_AND_USAGE.md](./docs/BUILD_AND_USAGE.md) —— 从 0 到 1 的完整构建流程、使用方式、环境要求、限制和开源发布建议
- [docs/EVOLUTION_ROADMAP.md](./docs/EVOLUTION_ROADMAP.md) —— 从源码快照到本地可运行、可调试 CLI 工作区的演进阶段、能力边界与后续收敛顺序
- [docs/ROADMAP.md](./docs/ROADMAP.md) —— 将仓库推进为可持续编译、启动、调试、补模块和二次开发工程的优先级路线图
- [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) —— 贡献原则、最小验证集、reduced/full 两条链路各自的修改注意事项
- [docs/SECURITY.md](./docs/SECURITY.md) —— 这个重建仓库的安全边界、问题报告方式和公开披露建议
- [docs/REPO_SHAPE.md](./docs/REPO_SHAPE.md) —— 哪些目录更接近主体实现，哪些是 stub、shim、兼容层和生成产物
- [docs/OPEN_SOURCE_RELEASE_CHECKLIST.md](./docs/OPEN_SOURCE_RELEASE_CHECKLIST.md) —— 后续整理到 GitHub 时的最小发布检查清单
- [docs/LOCAL_BUILD_STATUS.md](./docs/LOCAL_BUILD_STATUS.md) —— 更细的修复历史、doctor 状态与阶段性收敛记录

补充说明：并不是仓库里的所有 `.md` 都属于“可移动的普通文档”。根目录 `README.md`、`.github/*.md` 模板，以及 `skills/**/*.md` 运行时资产都需要保留在原位。详见 [`docs/README.md`](./docs/README.md)。

---

## 当前最准确的对外表述

如果后续将这个仓库开源到 GitHub，建议使用类似下面的描述：

> A local rebuild and repair workspace for a public but incomplete Claude Code source snapshot. It can produce a reduced diagnostic build and a runnable full local CLI build, but it should not be described as a faithful upstream-equivalent release.

中文也可以写成：

> 一个面向不完整公开源码快照的 Claude Code 本地重建与修复工作区。当前已经可以产出缩减诊断构建和可启动的 full local CLI，但不应被描述为与上游官方发布完全等价的版本。
