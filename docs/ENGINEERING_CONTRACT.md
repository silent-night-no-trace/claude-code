# 工程契约（Engineering Contract）

这份文档定义当前仓库作为 **Claude Code 本地重建与修复工作区** 的最小工程契约。

它回答的不是“这个仓库理想上应该是什么”，而是：**今天这个仓库在什么前提下可构建、可启动、可维护，以及哪些边界必须被明确承认。**

> 本文是路线图中的 P0-A 基础文档。后续 `BOOTSTRAP`、验证矩阵、维护脚本、CI gate、restoration ledger 和 debugging workstream 都应以这里定义的契约为前提，而不是各自隐式假设。

---

## 1. 契约目标

当前工程契约的目标是让维护者对以下事实形成统一认识：

1. 当前仓库支持的构建工具与基础环境是什么；
2. reduced build 与 full local build 分别承诺什么、不承诺什么；
3. 构建时注入的 `MACRO.*` / `process.env.*` 属于显式 build-time contract，而不是“上游一定存在的默认行为”；
4. `file:stubs/*` 是本地可构建性支撑层，不是完整功能恢复；
5. full build 运行时依赖的 vendored 资产必须被视为契约的一部分；
6. native / Cargo 相关能力在当前仓库里处于什么范围内。

---

## 2. 支持的基础环境

### 2.1 包管理与构建工具

当前仓库的顶层工程契约以 **Bun 1.3.x** 为准。

直接证据：

- `package.json` 中声明 `packageManager: bun@1.3.11`
- 当前本地构建脚本使用 `Bun.build(...)`

这意味着：

- 本仓库当前的 canonical build tool 是 **Bun**，不是 npm、pnpm 或 yarn；
- `npm run ...` 在这里主要作为脚本入口壳层使用，底层仍然转发到 Bun 执行本地脚本；
- 如果后续要引入 `bootstrap`、`verify:*`、CI job 或新维护脚本，应默认围绕 Bun 环境设计，而不是先假设存在另一套官方构建系统。

### 2.2 平台边界

当前文档与已验证路径都以 **macOS 或类 Unix Shell 环境** 为基本前提。

这不是说仓库永远只能在这些平台上工作，而是说：

- 当前公开的已验证命令与脚本说明是围绕类 Unix 环境写成的；
- 后续若要宣称更强的平台兼容性，应先增加对应验证与文档，而不是隐含放大支持范围。

---

## 3. reduced / full 两条构建链路的定义

### 3.1 reduced local build

定义：

- 构建入口：`scripts/build-local.ts`
- entrypoint：`entrypoints/cli.local.ts`
- 输出：`dist/local/cli.local.js`

当前契约下，reduced build 的定位是：

- 用于结构检查、`doctor` 风格诊断与缩减命令面验证；
- 它明确是 **local reduced build**，不是完整 CLI 的功能等价版本；
- 当前承诺的命令面只有 `--help`、`--version`、`inspect-build`、`doctor`。

因此，维护者不能把 reduced build 的可运行，表述成“完整产品能力已恢复”。

### 3.2 full local build

定义：

- 构建入口：`scripts/build-full-local.ts`
- entrypoint：`entrypoints/cli.tsx`
- 输出：`dist/full/cli.js`

当前契约下，full local build 的定位是：

- 当前仓库中最接近真实 CLI 启动路径的本地主入口；
- 可用于 `--help` / `--version` / 交互式启动 / REPL 进入验证；
- 实际请求是否成功，仍取决于认证、代理与环境配置。

因此，full local build 的当前承诺是：

- **主入口可构建、可启动、可进入交互路径**；
- **不承诺** 与上游官方发布 1:1 等价；
- **不承诺** 在缺少认证、OAuth 状态或可用 `ANTHROPIC_BASE_URL` 的情况下仍能成功完成真实请求。

### 3.3 reduced 与 full 的关系

当前工程契约要求维护者显式区分：

- reduced build：偏向诊断、结构检查与修复收敛观测；
- full local build：偏向真实 CLI 启动路径与运行时兼容验证。

后续文档、脚本、CI 与测试如果不区分这两条链路，就会把“仓库没死”与“仓库具备可维护运行路径”混为一谈。

---

## 4. `MACRO.*` / `process.env.*` 的 build-time contract

当前仓库仍依赖显式构建期注入，而不是单纯靠源码在任意 JavaScript 运行环境中自然成立。

### 4.1 当前构建脚本显式注入的值

`scripts/build-local.ts` 与 `scripts/build-full-local.ts` 当前都通过 `define` 注入以下构建期常量：

- `process.env.USER_TYPE = "external"`
- `process.env.CLAUDE_CODE_ENTRYPOINT = "cli"`
- `process.env.EMBEDDED_SEARCH_TOOLS = "0"`
- `MACRO.VERSION = "0.0.0-local"`
- `MACRO.BUILD_TIME = ""`
- `MACRO.PACKAGE_URL = "@anthropic-ai/claude-code"`
- `MACRO.NATIVE_PACKAGE_URL = "@anthropic-ai/claude-code-native"`
- `MACRO.FEEDBACK_CHANNEL = "https://github.com/silent-night-no-trace/claude-code/issues"`
- `MACRO.ISSUES_EXPLAINER = "open an issue in the repository"`
- `MACRO.VERSION_CHANGELOG = ""`

### 4.2 这意味着什么

这组值属于**当前本地重建工程的显式 build-time contract**：

- 维护者不能假设这些值来自上游私有打包体系之外的“自然默认值”；
- 如果后续要改构建入口、迁移打包方式、引入 bootstrap / verify gate，必须继续显式维护这些注入值，或者先重写依赖它们的调用面；
- 对 `MACRO.*` / `process.env.*` 的修改应被视为构建契约变更，而不是普通字符串替换。

### 4.3 当前不能承诺的事

在没有新的验证与文档更新之前，当前仓库**不能承诺**：

- 脱离 Bun 的 build-time define 之后仍然行为一致；
- 脱离当前本地脚本之后仍能由任意其他构建器正确产出相同行为；
- 当前所有 `process.env.*` 读取都已经被完全整理成稳定、文档化、跨环境无歧义的配置系统。

---

## 5. `file:stubs/*` 的角色契约

当前 `package.json` 中存在多项 `file:stubs/*` 依赖，例如：

- `@ant/claude-for-chrome-mcp`
- `@ant/computer-use-input`
- `@ant/computer-use-mcp`
- `@ant/computer-use-swift`
- `audio-capture-napi`
- `color-diff-napi`
- `image-processor-napi`
- `modifiers-napi`
- `url-handler-napi`

这些依赖的契约角色是：

- **支撑公开环境下的可构建性与最小可运行性**；
- 补齐私有依赖、native 依赖或公开快照中缺失的模块解析面；
- 为 reduced/full build 提供最小兼容边界，而不是伪装成功能完整恢复。

因此，后续维护必须遵守：

1. `file:stubs/*` 默认按 **compatibility layer / stub layer** 理解；
2. 修改 stub 时要明确自己是在维护“可构建性契约”，还是在尝试恢复真实行为；
3. 没有额外证据时，不应把 stub 产物描述为完整实现。

---

## 6. full build runtime assets 契约

### 6.1 vendored ripgrep 是当前 full build 的显式运行时资产

`scripts/build-full-local.ts` 在完成 Bun 构建后，会把：

- `node_modules/@anthropic-ai/claude-agent-sdk/vendor/ripgrep`

复制到：

- `dist/full/vendor/ripgrep`

这意味着 `dist/full/vendor/ripgrep` 不是可有可无的附属目录，而是当前 full local build 的**运行时契约资产**之一。

### 6.2 契约含义

后续任何 bootstrap、verify、CI 或发布整理都应把以下条件视为工程契约的一部分：

- `dist/full/cli.js` 不是 full build 的唯一必要输出；
- `dist/full/vendor/ripgrep` 必须与 full build 一起被准备、保留与验证；
- 如果后续脚本或 CI 只检查 `cli.js` 是否存在，而忽略 vendored ripgrep，就属于不完整验证。

---

## 7. native / Cargo 的当前范围

当前 root 级 `Cargo.toml` 缺失，`cli:status` 也把这一点视为已知现状，而不是新的 blocker：

- `Cargo.toml: missing — native/rust workspace manifest is absent at root`

因此，当前工程契约下：

- **完整 native / Cargo workspace 不在当前 P0 已交付范围内**；
- native / Cargo 更接近路线图中的后续工程化主题，而不是当前仓库已经具备的默认能力；
- 后续若要把 native / Cargo 纳入正式支持范围，应先补文档、验证脚本与明确的恢复/替代策略。

换句话说，当前最准确的范围判断是：

> native / Cargo 在今天属于 **后续恢复/工程化议题**，而不是“当前仓库已经完整支持的基础契约”。

---

## 8. 维护者在此契约下的行为要求

在当前阶段，维护者应默认遵守以下规则：

1. 所有后续 bootstrap / verify / CI / tests / debugging 文档与脚本都必须引用或遵守本文边界；
2. 不要把 reduced build 与 full local build 混成一个抽象的“build succeeded”；
3. 不要把 `file:stubs/*` 或兼容层文案写成“官方能力恢复完成”；
4. 不要忽略 `MACRO.*`、`process.env.*` 与 vendored runtime assets 这类显式构建契约；
5. 在 native / Cargo 仍未正式收口前，不要把它们描述成当前默认支持面。

---

## 9. 与后续路线图项的关系

本文落地后，后续路线图项应这样衔接：

- `docs/BOOTSTRAP.md`：基于本文定义支持环境、产物与 runtime assets 的最低准备路径
- canonical maintenance scripts：把本文里的边界转成可执行脚本入口
- `docs/VERIFICATION_MATRIX.md`：把本文里的契约要求转成明确验证面
- 第一批测试 / typecheck gate / CI：基于本文定义的边界做 no-regression，而不是倒推假设

如果后续工作与本文冲突，默认应先修改本文并补验证，而不是继续积累口头知识。

如果你想直接看这些契约在当前仓库里已经映射成哪些命令、哪些 CI 入口、哪些仍然只是报告型检查，请继续阅读 [`docs/VERIFICATION_MATRIX.md`](./VERIFICATION_MATRIX.md)。
