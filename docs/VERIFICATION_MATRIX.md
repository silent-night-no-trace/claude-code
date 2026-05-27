# Verification Matrix

这份文档把当前仓库已经存在的 build / startup / restoration / debug 验证面，整理成一份**显式 verification matrix**。

目标不是制造新的流程，而是把已经落地的 `bootstrap`、`verify:*`、`debug:*`、CI 入口和底层命令对应起来，让维护者知道：

- 每个验证面对应什么命令；
- 哪些入口已经 canonical；
- 哪些仍然只是过渡期底层命令；
- 当前哪些是硬通过条件，哪些只是报告型检查。

本文建立在以下工作之上：

- [`ENGINEERING_CONTRACT.md`](./ENGINEERING_CONTRACT.md)
- [`BOOTSTRAP.md`](./BOOTSTRAP.md)
- 当前 `package.json` 中的 `verify:*` / `debug:*` / `bootstrap` 入口

---

## 1. 如何阅读这张表

- **验证面**：路线图要求必须覆盖的 surface
- **主要命令**：维护者当前应优先运行的命令
- **CI / Gate 状态**：当前是否已由 canonical suite / CI 覆盖
- **通过标准**：当前什么结果算通过
- **备注**：当前边界、已知限制、后续工作项

在当前阶段，优先入口是：

```bash
npm run verify
```

它会串起当前已经落地的 canonical verification surface。

---

## 2. Verification Matrix

| Verification Surface | Primary Command | CI / Gate Status | Pass Criteria | Notes |
|---|---|---|---|---|
| reduced build | `npm run verify:build` | Included in `npm run verify` and CI | `dist/local/cli.local.js` can be built successfully | 当前 `verify:build` 通过 `cli:build` 同时产出 reduced + full，两条链路暂时未拆成独立 gate |
| full build | `npm run verify:build` | Included in `npm run verify` and CI | `dist/full/cli.js` and `dist/full/vendor/ripgrep` exist after build | full build 仍依赖 vendored runtime assets，这一点由 bootstrap / build chain 共同保证 |
| startup path | `npm run verify:startup` | Included in `npm run verify` and CI | `npm run cli:run -- --version` and `npm run cli:run -- --help` both pass | 当前主要是 startup-oriented smoke，不代表真实请求一定成功 |
| pseudo-TTY startup | `npm run verify:pty-startup` | Included in `npm run verify` and CI | `script -q /dev/null bun ./dist/full/cli.js --help` passes under the canonical wrapper | 当前通过 help-mode 探测 pseudo-TTY startup，不把长时间交互会话本身作为 CI gate |
| representative CLI execution | `npm run debug:print` | Included in CI as debug proof | CLI can enter print-mode path; success or explicit auth-boundary warning both count as proof of path reachability | 当前仍受认证 / 环境影响较大，因此它是 debug proof，不是 release-style success gate |
| first-party tests | `npm run test` | Included in CI | Bun test suite passes for script surfaces, startup smoke, build/runtime contracts, and inspector classification | 这是 P0-E 的第一批测试，不替代后续 P0-F / P0-H / P0-I 的治理升级 |
| reduced `doctor` | `npm run verify:status` | Included in `npm run verify` and CI | `cli:status` completes and reduced inspector reports diagnostics successfully | `verify:status` 当前通过 `cli:status` 间接运行 reduced `doctor` |
| reduced `inspect-build` | `npm run debug:inspector` | Manual debug surface only | Inspector runs and prints local source-build report | 这是 **Debug** surface，不是当前合并硬门禁 |
| typecheck no-regression gate | `npm run verify:typecheck` | Included in `npm run verify` and CI | Current normalized diagnostics do not exceed `artifacts/typecheck-baseline.txt` | 允许历史错误继续存在，但不允许新增同类/同路径诊断；后续应显式更新 baseline 来反映收敛 |
| restoration checks | `npm run verify:restoration` | Included in `npm run verify` and CI | missing relative imports / undeclared packages / content gaps all remain `0` | 当前已经是可执行 contract check，但 restoration ledger 仍待 P0-H 补齐 |
| debug checks | `npm run debug:startup && npm run debug:print && npm run debug:inspector` | Included in CI as debug proofs | Startup, print, and inspector probes run through their canonical wrappers without unexpected failures | `debug:typecheck` 目前复用 `verify:typecheck`；更完整 debugging workflow 文档仍待 P0-I |

---

## 3. Canonical Script Mapping

### 3.1 Current maintainer-first commands

```bash
npm run bootstrap
npm run verify:bootstrap
npm run verify
npm run verify:build
npm run verify:status
npm run verify:startup
npm run verify:typecheck
npm run verify:restoration
```

### 3.2 Current debug-oriented commands

```bash
npm run debug:reduced
npm run debug:full
npm run debug:startup
npm run debug:print
npm run debug:inspector
npm run debug:typecheck
```

### 3.3 Current CI entrypoint

当前 `.github/workflows/local-build-verification.yml` 使用：

```bash
clean-state bootstrap job -> npm run verify:bootstrap
maintenance guardrails job -> npm run verify && npm run test
explicit maintenance job -> npm run cli:build / cli:check / verify:typecheck / verify:restoration / verify:pty-startup
debug proofs job -> npm run debug:startup / debug:print / debug:inspector
```

这意味着 CI 当前覆盖的是：

- bootstrap reproducibility
- build verification
- status / doctor-style diagnostics
- startup smoke
- pseudo-TTY startup
- first-party script / startup / contract tests
- typecheck no-regression gate
- restoration contract checks
- debug startup / print / inspector proofs

与 restoration 相关的治理对象清单现在单独登记在 [`docs/MODULE_RESTORATION_LEDGER.md`](./MODULE_RESTORATION_LEDGER.md)。`verify:restoration` 继续负责硬门禁，而 ledger 负责说明这些对象为什么存在、风险是什么、谁应该继续收敛它们。

而以下内容仍未作为独立 CI gate 固化：

- richer debug acceptance checks
- richer interactive TUI acceptance beyond help/debug probes

---

## 4. 当前通过标准与边界

### 4.1 什么是当前的硬通过条件

当前更接近 hard gate 的项目是：

- `npm run verify:bootstrap`
- `npm run verify:build`
- `npm run verify:status`
- `npm run verify:startup`
- `npm run verify:pty-startup`
- `npm run verify:restoration`
- `npm run test`

如果改动涉及 `file:stubs/*`、vendored ripgrep、inspector 分类或明显的 reduced-build unavailable surface，除命令通过外，还应同步更新 [`docs/MODULE_RESTORATION_LEDGER.md`](./MODULE_RESTORATION_LEDGER.md)。

这些命令失败时，应默认视为当前本地重建工程的维护契约被破坏。

### 4.2 什么仍然是报告型 / 过渡型验证

当前仍应按“报告型”理解的项目：

- `npm run debug:print`

原因分别是：

- representative CLI execution 仍明显依赖认证与环境；

另外请注意：

- `debug:startup`、`debug:print` 与任何 `--debug-to-stderr` 路径都更适合在本地终端中运行；
- 不要把这类调试输出原样贴到公开 issue / PR / CI 日志里；
- 如果必须分享，请先去掉 token、base URL、request ID、路径和其他环境相关细节。

---

## 5. 对 PR / 合并判断意味着什么

在当前阶段，PR 合并至少应能回答：

1. `npm run verify` 是否仍可通过？
2. `npm run test` 是否仍可通过？
3. 如果这次改动触及 restoration / assets / inspector 逻辑，`npm run verify:restoration` 是否仍然通过？
4. 如果这次改动触及调试路径，CI 与本地是否至少跑过相关 `debug:*` / `verify:pty-startup` 命令？
5. 如果这次改动触及类型面，`npm run verify:typecheck` 是否仍保持 no-regression？

这还不是完整的“最终工程门禁”，但它已经足以让 PR 判断从“凭感觉”提升到“基于明确验证面”。

---

## 6. 与后续路线图项的关系

这份 matrix 落地后，后续项的衔接关系应当是：

- P0-H restoration ledger：已经把 `verify:restoration` 对应的治理对象显式登记出来；后续应继续细化 owner / status / 收敛顺序
- P0-I debugging workstream：当前 `docs/DEBUGGING.md` 已把 debug proofs、TTY/pseudo-TTY 差异与入口命令显式写出；后续可继续加强 acceptance granularity

换句话说，这份文档不是路线图终点，而是把“当前已有验证面（现在已包含第一批第一方测试、typecheck no-regression gate 与 maintenance-grade CI job 拆分）”和“后续要补强的验证面”放进同一张可维护地图里。
