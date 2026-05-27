# Claude Code 本地重建工程维护路线图

状态：**当前维护路线图（可持续更新）**

> 说明：本文包含一批**计划中的**文档、脚本、CI gate 与治理产物。除非仓库中已经实际存在对应文件或命令，否则应将它们理解为 roadmap deliverables，而不是“当前树中已落地资产”。

这份路线图的目标不是把仓库包装成“已经完全恢复的官方工程”，而是把它推进成一个**可持续编译、启动、调试、补模块和二次开发**的维护型工程。

它基于当前仓库已经验证的事实：

- reduced / full local build 已能构建；
- full local CLI 已能启动并进入交互界面；
- `inspect-build` / `doctor` 已把缺失相对导入、未声明外部依赖、缺失内容资源清到 `0`；
- 仓库仍依赖 Bun、`MACRO.*`、`file:stubs/*`、vendored runtime 资产与兼容层；
- `bun x tsc --noEmit -p tsconfig.json` 仍会报大量类型错误；
- 主体源码目录里几乎没有第一方测试；
- 当前 CI 已通过 `npm run verify` 覆盖 bootstrap、build、status / `doctor`、startup smoke、typecheck 快照与 restoration checks；但 pseudo-TTY startup、代表性请求执行与更完整 debug acceptance checks 仍未独立固化。

因此，这份路线图把重点放在：

1. **先建立维护契约与 no-regression 护栏**；
2. **再收口 Bun / macro / stub / asset 边界**；
3. **最后推进类型与 native/tooling 的长期工程化**。

---

## 1. 目标与范围

### 1.1 目标

把当前仓库从“可运行的本地重建工作区”推进到“可持续维护的工程底座”，具体体现在：

- 新维护者可以从干净 checkout 启动并进入工作状态；
- 维护者修改后有明确的 build / run / debug / verify 门槛；
- 模块恢复、stub/shim 维护、资产契约和 native 边界不再依赖口头知识；
- 类型错误不会继续无边界增长；
- CI 可以对“工程可维护性”而不只是“仓库没死”负责。

### 1.2 非目标

这份路线图**不**承诺：

- 把仓库恢复成上游官方等价工程；
- 立即移除所有兼容层；
- 立即清零所有 TypeScript 错误；
- 立即恢复完整 native / Rust 工作区；
- 立即把所有内部功能 1:1 开源化。

---

## 2. P0 / P1 / P2 总览

### P0：维护契约与硬护栏

优先建立：

- 工程契约；
- bootstrap / reproducibility；
- verification matrix；
- canonical maintenance scripts；
- 第一批第一方测试；
- typecheck no-regression gate；
- maintenance-grade CI；
- module restoration ledger；
- 显式 debugging workstream；
- Oracle closure / finalization 机制。

### P1：边界收口与维护流程产品化

推进：

- Bun / macro / runtime asset boundary 的集中化；
- 文档规则与机器规则对齐；
- debug / verify / restoration 工作流进一步固化。

### P2：长期工程化

推进：

- TypeScript 错误按目录收敛；
- native / Cargo / vendored tooling 路线明确；
- LICENSE / CODEOWNERS / templates / ADR 等治理元信息补齐。

---

## 3. P0 明确执行顺序

P0 必须按下面顺序推进，而不是并行乱推：

1. `docs/ENGINEERING_CONTRACT.md`
2. `docs/BOOTSTRAP.md` + `bootstrap` / `verify:bootstrap`
3. `package.json` canonical maintenance scripts
4. `docs/VERIFICATION_MATRIX.md`
5. 第一批第一方测试 scaffold
6. typecheck baseline + no-regression gate
7. `.github/workflows/local-build-verification.yml` 扩展
8. `docs/MODULE_RESTORATION_LEDGER.md` seeding
9. `docs/DEBUGGING.md` + debug commands + debug acceptance checks
10. Oracle closure / finalization

### 为什么这样排

- 没有 `ENGINEERING_CONTRACT`，后续 bootstrap 和 verification 没有可信依据；
- 没有 bootstrap 与 canonical scripts，CI 无法验证“新维护者从 0 到 1”路径；
- 没有 tests / typecheck gate，不应先扩大量构建和 restoration 工作；
- 没有 restoration ledger，后续补模块和删除 shim 的动作会失去治理边界；
- 没有 Oracle closure table，就不能把路线图标记为 finalized。

---

## 4. P0 交付物、done-when 与验收命令

### P0-A `docs/ENGINEERING_CONTRACT.md`

**必须覆盖：**

- 支持的 Bun 版本；
- reduced / full build 的定义；
- `MACRO.*` / `process.env.*` build-time contract；
- `file:stubs/*` 的角色；
- full build runtime assets，尤其是 `dist/full/vendor/ripgrep`；
- native / Cargo 当前是 out-of-scope 还是后续恢复范围。

**Done when：**

- `docs/ENGINEERING_CONTRACT.md` 已存在；
- `README.md`、`docs/CONTRIBUTING.md`、`docs/BUILD_AND_USAGE.md` 都链接到它；
- reduced / full 的差异与当前边界不再需要口头解释。

**验收：**

```bash
grep -n "ENGINEERING_CONTRACT" README.md docs/CONTRIBUTING.md docs/BUILD_AND_USAGE.md
npm run cli:build
```

---

### P0-B `docs/BOOTSTRAP.md` + `bootstrap` / `verify:bootstrap`

**必须覆盖：**

- 干净 checkout 的安装与验证路径；
- 平台 / Bun 版本要求；
- install 后哪些资产应存在；
- 从 0 到 “可 build / run / debug” 的标准流程；
- clean-state CI bootstrap job。

**建议最低路径：**

```bash
bun install
npm run bootstrap
npm run cli:build
npm run cli:check
npm run verify:typecheck
```

**Done when：**

- 新维护者只看 `docs/BOOTSTRAP.md` 就能进入工作状态；
- clean-state CI job 能重复通过；
- bootstrap 不再依赖隐含知识。

**验收：**

```bash
npm run bootstrap
npm run verify:bootstrap
```

---

### P0-C `package.json` canonical maintenance scripts

**至少应存在：**

- `bootstrap`
- `verify:bootstrap`
- `verify`
- `verify:build`
- `verify:startup`
- `verify:status`
- `verify:typecheck`
- `verify:restoration`
- `debug:reduced`
- `debug:full`
- `debug:startup`
- `debug:print`
- `debug:inspector`
- `debug:typecheck`

**Done when：**

- 维护者只看 `package.json` 就能知道怎么 build / run / debug / verify；
- 文档主要引用这些 scripts，而不是要求维护者手拼低层命令；
- CI 主要调用这些 scripts。

**验收：**

```bash
npm run
```

---

### P0-D `docs/VERIFICATION_MATRIX.md`

**必须列出的验证面：**

- reduced build
- full build
- startup path
- pseudo-TTY startup
- representative CLI execution
- reduced `doctor`
- reduced `inspect-build`
- typecheck no-regression
- restoration checks
- debug checks

**Done when：**

- verification matrix 中每项都有对应命令；
- package scripts 与 CI 对应 matrix；
- PR 合并可以基于 matrix 判定。

**验收：**

```bash
grep -n "Debug" docs/VERIFICATION_MATRIX.md
grep -n "verify:typecheck" docs/VERIFICATION_MATRIX.md
grep -n "verify:restoration" docs/VERIFICATION_MATRIX.md
```

---

### P0-E 第一批第一方测试

**建议目录：**

- `tests/inspector/*`
- `tests/cli/*`
- `tests/build/*`
- `tests/contracts/*`

**必须覆盖的第一批对象：**

1. `utils/localBuildInspector.ts`
2. `scripts/cli-build.ts`
3. `scripts/cli-check.ts`
4. `scripts/cli-status.ts`
5. reduced/full startup smoke
6. ripgrep / stubs / macros contract checks

**Done when：**

- 仓库中出现第一方测试文件；
- `npm run test` 可跑；
- CI 执行这些测试。

**验收：**

```bash
npm run test
```

---

### P0-F typecheck baseline + no-regression gate

**交付物：**

- `scripts/verify-typecheck.ts`
- `artifacts/typecheck-baseline.txt` 或等价文档/产物
- `verify:typecheck`

**目标：**

- 不要求立刻清零所有类型错误；
- 先禁止新增类型错误；
- 后续按目录逐步收敛。

**Done when：**

- baseline 已生成；
- `verify:typecheck` 能比较当前结果和 baseline；
- CI 会拦截新增 type errors。

**验收：**

```bash
bun x tsc --noEmit -p tsconfig.json
npm run verify:typecheck
```

---

### P0-G maintenance-grade CI 扩展

**目标：**

让 `.github/workflows/local-build-verification.yml` 从“烟雾验证”升级到“维护护栏”。

**必须新增：**

- `npm run cli:build`
- `npm run cli:check`
- `npm run verify:typecheck`
- `npm run verify:restoration`
- pseudo-TTY startup check
- clean-state bootstrap job
- reduced inspector contract check
- debug-related checks（至少覆盖 startup / print / inspector）

**Done when：**

- PR 进入时 CI 能回答“这次修改是否仍然维护安全”；
- workflow 不再只验证 help/version。

**验收：**

- 对应 workflow job 存在并通过
- 本地 `npm run verify` 能与 CI 主要步骤对齐

---

### P0-H `docs/MODULE_RESTORATION_LEDGER.md`

**每个条目必须包含：**

- 名称
- 路径
- 类别
- 当前替代目标
- 风险
- 优先级
- 验证方法
- owner / owner-role
- 当前状态

**第一批必须进入 ledger 的对象：**

- `package.json` 中所有 `file:stubs/*`
- `stubs/*`
- vendored ripgrep runtime contract
- 所有明显的 `unavailable in local reduced build` surface
- reduced/full 兼容层与可选功能门控项

**Done when：**

- 关键 stubs / shims / vendored assets 已登记；
- CONTRIBUTING / BUILD_AND_USAGE 链接到 ledger；
- `verify:restoration` 引用 ledger 对应的 contract。

**验收：**

```bash
grep -n "MODULE_RESTORATION_LEDGER" docs/CONTRIBUTING.md docs/BUILD_AND_USAGE.md
npm run verify:restoration
```

---

### P0-I `docs/DEBUGGING.md` + debug acceptance gate

**必须覆盖：**

1. reduced CLI 调试入口
2. full CLI 调试入口
3. startup / trust / REPL path 调试
4. print mode / request path 调试
5. inspector / doctor / restoration 调试
6. bridge / transport / print 这类 type-heavy 面调试
7. TTY / pseudo-TTY 差异
8. 当前支持与不支持的调试模式

**package scripts 必须包括：**

- `debug:reduced`
- `debug:full`
- `debug:startup`
- `debug:print`
- `debug:inspector`
- `debug:typecheck`

**Done when：**

- 调试入口不再靠口头经验；
- verification matrix 明确 debug checks；
- maintainer workflow 里有 day-2 debugging loop；
- P0 completion gate 包含 debug proof。

**验收：**

```bash
npm run debug:startup
npm run debug:print
npm run debug:inspector
```

---

### P0-J Oracle closure / finalization

路线图必须包含一张**真实的** closure table，而不是“后续可以整理 Oracle findings”。

建议单独放在：

- `docs/ROADMAP_CLOSURE.md`

或作为 `docs/ROADMAP.md` 的附录。

**每行必须包含：**

- Oracle finding
- source
- mapped roadmap item
- priority
- exact fix action
- acceptance check
- closure state

**至少要显式映射的 findings：**

1. build contract 必须进 P0
2. typecheck 必须先有 no-regression gate
3. module restoration 必须独立成工作流
4. bootstrap reproducibility 必须进 P0
5. Oracle incorporation 必须显式化
6. P0 需要明确执行顺序
7. day-2 maintainer workflow 必须明确
8. restoration governance 必须可执行
9. debugging 必须成为独立 workstream

**Done when：**

- closure table 已写明并完整映射；
- 路线图状态明确是 `Finalized after Oracle incorporation`；
- 不再需要口头说明“这份路线图已经参考过 Oracle”。

---

## 5. P0 最终 completion gate

只有在下面这些都成立时，P0 才算完成：

```bash
npm run bootstrap
npm run verify:bootstrap
npm run cli:build
npm run cli:check
npm run test
npm run verify:typecheck
npm run verify:restoration
npm run debug:startup
npm run debug:print
npm run debug:inspector
```

并且：

- CI 有 clean-state bootstrap job；
- CI 有 verify / typecheck / restoration / debug checks；
- 核心文档已互相链接；
- Oracle closure table 已填充；
- 路线图状态更新为 finalized。

---

## 6. Day-2 Maintainer Workflow

### 6.1 普通源码改动

适用于：

- 文本/UI/局部逻辑修改；
- 不直接影响 startup、build、restoration 的改动。

**建议命令：**

```bash
npm run cli:status
npm run cli:run -- --help
npm run verify:typecheck
```

**合并前门槛：**

```bash
npm run cli:check
```

---

### 6.2 startup / entrypoint / build / CLI surface 改动

适用于：

- `entrypoints/*`
- `scripts/build-*`
- `scripts/cli-*`
- `main.tsx`
- trust / REPL / startup path

**建议命令：**

```bash
npm run bootstrap
npm run cli:build
npm run cli:check
script -q /dev/null npm run cli:run
npm run verify:typecheck
```

**合并前门槛：**

```bash
npm run verify
```

---

### 6.3 stubs / shims / restoration 改动

适用于：

- `stubs/*`
- `file:stubs/*`
- reduced unavailable surfaces
- vendored runtime assets

**建议命令：**

```bash
npm run verify:restoration
npm run cli:status
npm run cli:check
```

**额外要求：**

- 必须同步更新 `docs/MODULE_RESTORATION_LEDGER.md`

---

### 6.4 type-heavy core 面改动

适用于：

- `bridge/*`
- `cli/structuredIO.ts`
- `cli/transports/*`
- `cli/print.ts`

**建议命令：**

```bash
npm run verify:typecheck
npm run cli:check
script -q /dev/null npm run cli:run
```

**额外要求：**

- 如果协议结构发生变化，补 `tests/contracts/*` 或 `tests/cli/*`

---

### 6.5 调试循环

**普通调试：**

```bash
npm run debug:reduced
npm run debug:inspector
```

**startup / entrypoint 调试：**

```bash
npm run debug:startup
script -q /dev/null npm run cli:run
npm run cli:check
```

**request / print path 调试：**

```bash
npm run debug:print
npm run cli:run -- -p "Reply with exactly: OK"
```

**type-heavy 核心面调试：**

```bash
npm run debug:typecheck
npm run verify:typecheck
```

---

## 7. Restoration State Transition Rules

`docs/MODULE_RESTORATION_LEDGER.md` 里的每个 restoration item 只能处于以下四种状态之一：

1. `permanent-local-only`
2. `temporary-shim`
3. `candidate-restore`
4. `remove-later`

### 允许的状态迁移

#### `temporary-shim -> candidate-restore`

必须满足：

- 已明确替代目标；
- 已明确 owner / owner-role；
- 已写明验证方法；
- `verify:restoration` 通过。

#### `candidate-restore -> permanent-local-only`

必须满足：

- 理由写明；
- contract 文档更新；
- 下游入口验证不受影响。

#### `candidate-restore -> remove-later`

必须满足：

- 已有替代实现；
- 旧 shim 不再被引用；
- tests/contracts 与 CLI smoke 通过。

#### `remove-later -> removed`

必须满足：

- 引用为 0；
- `cli:build`、`cli:check`、`verify:restoration` 通过；
- ledger 中记录 removal info。

### 明确禁止

- 不更新 ledger 就修改 shim 状态；
- 不跑 `verify:restoration` 就改 restoration 分类；
- 未通过 CLI smoke 就删除兼容层。

---

## 8. P1 / P2 概览

### P1：边界收口与维护流程产品化

#### 交付物

- Bun / macro / asset boundary 更集中；
- 文档规则映射到 scripts / CI；
- debug / verify / restoration 工作流更稳定。

#### Done when

- 核心 boundary 不再过度散落；
- 维护者能快速区分真实恢复与 local-only compatibility；
- 文档和机器规则一致。

---

### P2：长期工程化

#### 交付物

- TypeScript 错误按目录收敛；
- `docs/NATIVE_STRATEGY.md` 明确 native / Cargo 路线；
- `LICENSE`、`CODEOWNERS`、templates、ADR 等治理元信息逐步补齐。

#### Done when

- 类型错误不再只靠 baseline 挡住，而是持续下降；
- native story 不再模糊；
- 仓库适合长期多人协作。

---

## 9. Oracle Findings Closure Table

| Oracle Finding | Source | Mapped Roadmap Item | Priority | Exact Fix Action | Acceptance Check | Closure State |
|---|---|---|---|---|---|---|
| Build contract must be P0 | Oracle review 1 | P0-A | P0 | 新增 `docs/ENGINEERING_CONTRACT.md` 并从核心文档链接 | `grep ENGINEERING_CONTRACT README.md docs/CONTRIBUTING.md docs/BUILD_AND_USAGE.md` | completed |
| Typecheck needs a no-regression gate | Oracle review 1 | P0-F | P0 | baseline + `scripts/verify-typecheck.ts` + CI gate | `npm run verify:typecheck` | completed |
| Module restoration must be its own workstream | Oracle review 1 | P0-H | P0 | 新增 `docs/MODULE_RESTORATION_LEDGER.md` 与 `verify:restoration` | `npm run verify:restoration` | completed |
| Bootstrap reproducibility must be P0 | Oracle review 2 | P0-B | P0 | 新增 `docs/BOOTSTRAP.md`、`bootstrap`、clean-state CI job | `npm run verify:bootstrap` | completed |
| Oracle incorporation must be explicit | Oracle review 2 | §9 Closure Table | P0 | 在路线图中显式记录 Oracle findings 到 closure state | route doc contains closure table | completed |
| P0 needs explicit execution sequence | Oracle review 3 | §3 | P0 | 明确按依赖顺序定义 P0 执行顺序 | route doc contains ordered P0 chain | completed |
| Secondary-development day-2 workflow must be defined | Oracle review 3 | §6 | P0 | 新增 day-2 maintainer workflow | doc contains maintainer loops and merge gates | completed |
| Restoration governance must be executable | Oracle review 3 | §7 | P0 | 新增 restoration state transition rules | ledger contains transition rules | planned |
| Debugging must be operationalized | Oracle review 4 | P0-I / §6.5 | P0 | 新增 `docs/DEBUGGING.md`、debug scripts、debug acceptance gate | `npm run debug:startup && npm run debug:print && npm run debug:inspector` | completed |

> 进度说明：`docs/VERIFICATION_MATRIX.md`、第一批 `tests/*`、typecheck baseline gate、maintenance-grade CI job 拆分、`docs/MODULE_RESTORATION_LEDGER.md` 与 `docs/DEBUGGING.md` 已落地，P0-D / P0-E / P0-F / P0-G / P0-H / P0-I 当前可视为 **completed**；它们描述的是当前已实现的验证面、脚本映射、第一方测试、no-regression 护栏、CI 护栏、restoration governance 与 debugging workstream，不代表 P0-J 的后续治理项已经全部收口。

---

## 10. 后续继续推进时的建议顺序

如果从今天开始继续落地，不要横向一起做。由于 P0-A / P0-B / 第一批 P0-C / P0-D / P0-E / P0-F / P0-G / P0-H / P0-I 已经完成，接下来建议按这个顺序开工：

1. `docs/MAINTAINER_WORKFLOW.md`
2. Oracle closure / finalization

也就是说，**当前阶段已经完成维护规则、bootstrap、verification surface、第一批第一方测试、typecheck no-regression gate、maintenance-grade CI、restoration governance ledger 与 debugging workstream；下一步应优先补 maintainer workflow 与 Oracle closure/finalization。**
