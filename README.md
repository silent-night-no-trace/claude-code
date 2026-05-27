# Claude Code Local Rebuild

Claude Code Local Rebuild 是一个面向开发者的本地重建项目，用来把一份不完整的 Claude Code 公开源码快照整理成可以构建、启动、调试和继续修复的 CLI 工作区。

这个仓库适合你用来：

- 研究 Claude Code CLI 的本地构建链路和运行时结构；
- 产出可诊断的 reduced local build：`dist/local/cli.local.js`；
- 产出可启动的 full local CLI：`dist/full/cli.js`；
- 在本地验证 CLI startup、help/version、doctor、pseudo-TTY 和基础 request path；
- 继续收敛 stub、shim、unavailable surface 与缺失模块。

这个仓库不是 Anthropic 官方发布仓库，也不是上游官方产物的 1:1 等价重建版。当前目标是提供一个可运行、可调试、边界清晰的开发者工作区。

## 当前能力

| 能力 | 状态 |
|---|---|
| 包管理 / 构建工具 | Bun 1.3.x |
| reduced local build | 可用 |
| full local build | 可用 |
| full CLI help/version | 可用 |
| 交互式 CLI / REPL 启动 | 可用 |
| pseudo-TTY startup 验证 | 可用 |
| 真实消息请求 | 取决于认证、代理和 base URL |
| 上游官方等价重建 | 否 |

主要产物：

- `dist/local/cli.local.js`：缩减诊断构建，适合 doctor、结构检查和快速验证；
- `dist/full/cli.js`：完整本地 CLI 入口，适合启动、交互和调试更接近真实使用的路径。

## 快速开始

环境要求：

- Bun 1.3.x；
- macOS 或类 Unix shell 环境；
- 如需真实请求 Claude，准备可用的 `ANTHROPIC_API_KEY`、现有登录态 / OAuth 状态，或正确的 `ANTHROPIC_BASE_URL` / 代理端点。

安装依赖：

```bash
bun install
```

构建并执行最小 CLI 验收：

```bash
npm run cli:build
npm run cli:check
```

查看本地状态：

```bash
npm run cli:status
```

运行 full local CLI：

```bash
npm run cli:run -- --help
npm run cli:run
```

如果要走真实请求路径，可以使用 print 模式：

```bash
npm run cli:run -- -p "Reply with exactly: OK"
```

这条命令能否返回 `OK` 取决于你的认证、代理、网络和 base URL 配置。若 CLI 能启动但请求失败，优先检查运行环境，而不是先怀疑构建链路。

## 常用命令

### 构建

```bash
bun run build:local
bun run build:full-local
npm run cli:build
```

- `bun run build:local`：生成 `dist/local/cli.local.js`。
- `bun run build:full-local`：生成 `dist/full/cli.js`。
- `npm run cli:build`：准备 reduced 状态产物和 full 运行产物，是日常使用的推荐入口。

### 运行

```bash
npm run cli:run -- --help
npm run cli:run
bun ./dist/full/cli.js --version
bun ./dist/full/cli.js --help
```

### 诊断

```bash
npm run cli:status
bun ./dist/local/cli.local.js inspect-build
bun ./dist/local/cli.local.js doctor
```

### 调试

```bash
npm run debug:startup
npm run debug:print
npm run debug:inspector
npm run debug:typecheck
```

- `debug:startup`：验证 full CLI startup path。
- `debug:print`：验证 print mode request path；无可用认证或网络较慢时会按 timeout 边界退出。
- `debug:inspector`：验证 inspector/debug 入口。
- `debug:typecheck`：运行当前 typecheck regression gate。

### 验证

```bash
npm run test
npm run verify
npm run verify:typecheck
npm run verify:pty-startup
```

`npm run verify` 是更完整的项目验证入口；如果只想快速确认 CLI 仍能构建和启动，优先用 `npm run cli:check`。

## 构建链路

### reduced local build

reduced build 聚焦“仓库是否还能被构建、诊断和结构检查”。它适合：

- 快速确认源码快照的修复状态；
- 运行 `doctor` / `inspect-build`；
- 跟踪 stub、shim、unavailable surface 的治理进度。

产物：

```bash
dist/local/cli.local.js
```

### full local build

full build 聚焦“完整 CLI 主入口是否能启动和被调试”。它适合：

- 验证 `--help`、`--version` 和 startup path；
- 启动交互式 CLI / REPL；
- 调试更接近真实使用的 request path。

产物：

```bash
dist/full/cli.js
```

## 项目边界

当前 full local build 已经可以启动 CLI，但以下能力仍受环境或源码快照完整度影响：

- 真实消息请求依赖认证、代理、网络和 base URL；
- 部分 native package、runtime asset 或内部集成仍通过 stub/shim/unavailable boundary 治理；
- 当前验证目标是“本地可构建、可启动、可调试”，不是声明与官方发布产物完全等价。

如果你准备继续恢复模块，请先阅读 [`docs/MODULE_RESTORATION_LEDGER.md`](./docs/MODULE_RESTORATION_LEDGER.md) 和 [`docs/ENGINEERING_CONTRACT.md`](./docs/ENGINEERING_CONTRACT.md)。

## 文档入口

- [`docs/README.md`](./docs/README.md)：文档中心和阅读顺序。
- [`docs/BUILD_AND_USAGE.md`](./docs/BUILD_AND_USAGE.md)：从干净 checkout 到构建、运行、验证的完整说明。
- [`docs/DEBUGGING.md`](./docs/DEBUGGING.md)：startup、print、inspector、pseudo-TTY 等调试入口。
- [`docs/VERIFICATION_MATRIX.md`](./docs/VERIFICATION_MATRIX.md)：验证命令、CI surface 和硬门禁 / 报告型检查边界。
- [`docs/EVOLUTION_ROADMAP.md`](./docs/EVOLUTION_ROADMAP.md)：从源码快照到可运行可调试 CLI 工作区的演进路线。
- [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md)：贡献原则、最小验证集和文档更新要求。
- [`docs/REPO_SHAPE.md`](./docs/REPO_SHAPE.md)：目录结构、主体实现、兼容层和生成产物说明。
- [`docs/SECURITY.md`](./docs/SECURITY.md)：安全边界和问题披露建议。

## 贡献

欢迎围绕以下方向提交改进：

- 修复构建、启动、TTY、request path 或调试体验；
- 收敛 stub/shim/unavailable surface；
- 补齐模块恢复记录和验证矩阵；
- 改善文档、bootstrap 流程和贡献者体验。

提交前建议至少运行：

```bash
npm run cli:check
npm run test
```

涉及 build/runtime boundary、stub 或调试入口的改动，请同时参考 [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md) 中的最小验证要求。

## License

本仓库基于公开源码快照进行本地重建与修复整理。使用、分发或继续开发前，请自行确认上游源码、依赖包和相关资产的许可边界。
