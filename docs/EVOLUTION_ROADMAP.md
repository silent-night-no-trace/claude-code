# Claude Code 本地重建演进路线

最后更新：2026-05-27

本文把当前仓库从“不完整公开源码快照”推进到“本地可运行、可调试、可继续维护的 Claude Code CLI 重建工作区”的演进路线整理成一份面向维护者的路线图。

它不是新的承诺清单，也不把本仓库包装成上游官方等价物。它的目标是回答三个问题：

1. 这个仓库已经走过哪些阶段；
2. 当前本地 CLI 能力边界是什么；
3. 后续应该按什么顺序继续收敛。

---

## 1. 当前定位

当前仓库最准确的定位是：

> 一个面向不完整公开源码快照的 Claude Code 本地重建与修复工作区。

已经可以准确描述的能力：

- 通过 Bun 1.3.x 构建 reduced local build：`dist/local/cli.local.js`
- 通过 Bun 1.3.x 构建 full local build：`dist/full/cli.js`
- 启动 full local CLI，并到达 `--version` / `--help` / pseudo-TTY startup surface
- 通过 reduced `doctor` / `inspect-build` 观察源码缺口与 restoration 状态
- 通过 `verify:*`、`debug:*`、`npm run test` 做维护级本地验证

仍然不能准确描述为：

- 上游官方 Claude Code 仓库；
- 与官方发布产物完全等价的重建版；
- 所有内部能力、native 能力、server/bridge/workflow 能力都已恢复的完整产品。

---

## 2. 已完成的演进阶段

### 阶段 A：建立本地构建底座

目标：让公开源码快照从“只能阅读”变成“可以在本地装依赖、构建、运行最小入口”。

关键产物：

- `package.json`
- `bun.lock`
- `tsconfig.json`
- `globals.d.ts`
- `local-stub-modules.d.ts`
- `scripts/build-config.ts`
- `scripts/build-local.ts`
- `scripts/build-full-local.ts`
- `entrypoints/cli.local.ts`

关键决策：

- 以 Bun 1.3.x 作为当前 canonical build tool；
- 用显式 `MACRO.*` / `process.env.*` define 取代不可见的上游私有打包上下文；
- 把 native / 私有依赖先纳入 `file:stubs/*` 兼容层，而不是伪装成完整恢复。

当前验收：

```bash
npm run cli:build
bun ./dist/local/cli.local.js --help
bun ./dist/full/cli.js --help
```

### 阶段 B：补齐 reduced build 诊断能力

目标：让维护者能解释当前源码快照缺什么、哪些缺口已被兼容层治理、哪些缺口重新回升。

关键产物：

- `utils/localBuildInspector.ts`
- `scripts/cli-status.ts`
- `scripts/debug-inspector.ts`
- reduced CLI 的 `inspect-build` / `doctor` 命令

当前能力：

- 扫描 source file 数量；
- 统计 `src/*` alias imports；
- 统计 `bun:bundle` 与 `MACRO.*` 使用；
- 检查 missing relative imports；
- 检查 undeclared external packages；
- 把缺口分桶为 generated artifact、internal feature、content asset、general source gap。

当前验收：

```bash
npm run cli:status
npm run debug:inspector
npm run verify:restoration
```

### 阶段 C：恢复 full local CLI startup surface

目标：让仓库不只停在 reduced diagnostics，而是能构建并启动更接近真实用户入口的 full CLI。

关键产物：

- `scripts/cli-run.ts`
- `scripts/cli-build.ts`
- `scripts/cli-check.ts`
- `scripts/verify-startup.ts`
- `scripts/verify-pty-startup.ts`

关键修复方向：

- 补齐公开快照缺失的生成类型与共享类型；
- 补齐 local-only command boundary；
- 复制 `@anthropic-ai/claude-agent-sdk/vendor/ripgrep` 到 `dist/full/vendor/ripgrep`；
- 将上游内部-only surface 显式转成 unavailable boundary 或 compatibility shell。

当前验收：

```bash
npm run cli:check
npm run verify:startup
npm run verify:pty-startup
script -q /dev/null bun ./dist/full/cli.js --debug-to-stderr --help
```

### 阶段 D：建立维护级验证与 CI 护栏

目标：让“本地能跑”变成“后续改动不容易把它改坏”。

关键产物：

- `scripts/bootstrap.ts`
- `scripts/verify-bootstrap.ts`
- `scripts/verify.ts`
- `scripts/verify-typecheck.ts`
- `scripts/verify-restoration.ts`
- `tests/cli/*`
- `tests/build/*`
- `tests/contracts/*`
- `tests/inspector/*`
- `.github/workflows/local-build-verification.yml`
- `artifacts/typecheck-baseline.txt`

当前验证面：

- clean checkout bootstrap；
- reduced/full build；
- full CLI version/help startup；
- pseudo-TTY startup；
- restoration contract；
- typecheck no-regression；
- first-party script/build/contract/inspector tests。

当前验收：

```bash
npm run verify
npm run test
```

### 阶段 E：调试路径产品化

目标：让维护者遇到 startup、request、diagnostics、type-heavy 问题时有可重复入口，而不是靠口头经验。

关键产物：

- `docs/DEBUGGING.md`
- `scripts/debug-startup.ts`
- `scripts/debug-print.ts`
- `scripts/debug-inspector.ts`

本阶段新增的重要收敛：

- `debug:print` 现在直接运行 full CLI artifact，而不是套 `bun run cli:run`；
- `debug:print` timeout 后会终止并等待子进程退出；
- 无认证、慢网络或不可用代理环境下，`debug:print` 能输出明确 WARN 并干净退出；
- `tests/cli/script-surfaces.test.ts` 覆盖 success、auth-boundary、timeout cleanup 三类路径。

当前验收：

```bash
npm run debug:startup
npm run debug:print
npm run debug:inspector
```

---

## 3. 当前能力边界

### 3.1 可以作为 hard gate 的部分

这些命令失败时，应默认视为当前本地重建工程退化：

```bash
npm run verify:bootstrap
npm run cli:check
npm run verify:startup
npm run verify:pty-startup
npm run verify:typecheck
npm run verify:restoration
npm run test
```

### 3.2 应作为 debug proof 的部分

这些命令证明路径可达，但不等同于 release-style 功能成功：

```bash
npm run debug:startup
npm run debug:print
npm run debug:inspector
```

其中 `debug:print` 的语义是：

- 成功返回模型输出：OK；
- 走到认证或请求边界但环境不可用：WARN；
- startup、transport、runtime asset 等非环境问题崩溃：FAIL。

### 3.3 仍然明确受环境约束的部分

真实请求是否成功仍取决于：

- `ANTHROPIC_API_KEY`
- OAuth / 登录态
- `ANTHROPIC_BASE_URL`
- 代理和网络环境
- 组织策略、provider 配置与模型可用性

因此当前默认验证不能写成“真实 Claude 请求已成功”。

### 3.4 仍然明确未完整恢复的部分

下面这些对象仍应按 compatibility / unavailable boundary 理解：

- `file:stubs/*` native / computer-use / audio / image / URL handler 依赖；
- server / direct-connect surface；
- daemon / self-hosted / environment-runner surface；
- workflow / monitor / task 类 surface；
- peer / remote-control bridge surface；
-部分 internal-only command surface。

它们由 `docs/MODULE_RESTORATION_LEDGER.md` 继续治理。

---

## 4. 后续演进顺序

### P0：收口当前本地可运行/可调试基线

目标：把“核心 CLI 本地可运行、可调试”从当前状态推进到更可重复的工程基线。

建议顺序：

1. 补最小 interactive TUI acceptance
   - 启动 full CLI；
   - 等待首屏或输入框；
   - 发送退出输入；
   - 断言进程干净退出。

2. 增加可选 authenticated request smoke
   - 仅在检测到可用 API key / base URL 时运行；
   - 默认 CI 不强制真实请求成功；
   - 无认证时明确 skip 或 WARN。

3. 统一 roadmap 与 restoration ledger 的状态模型
   - 明确 `active / in_progress / planned / retired` 是否继续使用；
   - 或迁移到 `permanent-local-only / temporary-shim / candidate-restore / remove-later`；
   - 避免 roadmap 和 ledger 对同一治理项出现 completed/planned 口径冲突。

4. 补独立 maintainer workflow 文档
   - 从 clean checkout 到 debug loop；
   - 从 restoration 改动到 ledger 更新；
   - 从 typecheck baseline 到逐步收敛。

### P1：收敛 compatibility layer 与 unavailable boundary

目标：降低“能启动但某些 surface 实际不可用”的误解成本。

建议顺序：

1. server / direct-connect boundaries
2. workflow / task / monitor 类 placeholder surface
3. CLI background session 与 template job surface
4. peer / remote-control bridge surface
5. daemon / self-hosted / environment-runner surface
6. native / computer-use / audio / image / URL handler stub layer

每个 boundary 的迁移都应满足：

- 更新 `docs/MODULE_RESTORATION_LEDGER.md`；
- 增加或调整对应测试；
- 通过 `npm run verify:restoration`；
- 不把 placeholder 删除误写成真实功能恢复。

### P2：降低 TypeScript baseline 与 native/tooling 风险

目标：把当前 no-regression 型类型护栏推进成真正的类型健康改善。

建议顺序：

1. 先收敛 scripts / entrypoints / tests 相关类型；
2. 再收敛 CLI transport / structured IO / print path；
3. 再收敛 bridge / server / workflow / daemon 等高风险 surface；
4. 每轮下降后更新 `artifacts/typecheck-baseline.txt`；
5. 对 native / Cargo / platform integration 形成单独 strategy 文档。

### P3：准备长期公开维护

目标：让仓库适合长期多人协作，而不是只作为一次性修复工作区。

建议补齐：

- `LICENSE`
- `CODEOWNERS`
- ADR / decision records
- release notes / changelog 规则
- issue triage 标签
- security disclosure 流程
- “官方等价性”与“local rebuild compatibility”边界说明

---

## 5. 推荐维护循环

### 普通源码或文案修改

```bash
npm run cli:status
npm run cli:run -- --help
npm run verify:typecheck
npm run cli:check
```

### build / startup / entrypoint 修改

```bash
npm run cli:build
npm run cli:check
npm run verify:startup
npm run verify:pty-startup
npm run debug:startup
```

### request / print / auth 边界修改

```bash
npm run cli:check
npm run debug:startup
npm run debug:print
npm run verify:typecheck
```

### restoration / stub / unavailable boundary 修改

```bash
npm run debug:inspector
npm run verify:restoration
npm run cli:check
```

### 合并或推送前建议最小集

```bash
npm run verify
npm run test
npm run debug:startup
npm run debug:print
npm run debug:inspector
```

---

## 6. 当前下一步建议

如果只选最有杠杆的后续工作，建议按下面顺序推进：

1. 增加最小 interactive TUI acceptance；
2. 把真实请求 smoke 设计成可选 gate；
3. 统一 `ROADMAP` 与 `MODULE_RESTORATION_LEDGER` 的状态模型；
4. 编写 `docs/MAINTAINER_WORKFLOW.md`；
5. 从 server / direct-connect boundary 开始做第一轮 P1 收敛；
6. 按目录降低 `verify:typecheck` baseline。

这条路线保持了当前最重要的工程原则：

- 先保证本地能构建、能启动、能诊断；
- 再保证维护者能复现和定位问题；
- 最后才扩大功能恢复范围。
