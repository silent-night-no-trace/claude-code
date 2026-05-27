# 贡献指南

感谢你考虑为这个仓库贡献代码或文档。

在开始之前，请先记住这个仓库的定位：

> 这是一个面向不完整公开源码快照的 Claude Code 本地重建与修复工作区。

这意味着贡献工作的核心目标不是“假装已经完整恢复上游官方产品”，而是：

- 让仓库继续保持可构建；
- 让 reduced / full 两条本地构建链路更稳定；
- 把当前已恢复能力、兼容层和边界讲清楚；
- 用最小、可解释、可验证的改动推进仓库。

---

## 1. 先读什么

第一次准备贡献时，建议先阅读：

1. `README.md`
2. `docs/README.md`
3. `docs/ENGINEERING_CONTRACT.md`
4. `docs/BOOTSTRAP.md`
5. `docs/VERIFICATION_MATRIX.md`
6. `docs/BUILD_AND_USAGE.md`
7. `docs/MODULE_RESTORATION_LEDGER.md`
8. `docs/DEBUGGING.md`
9. `docs/LOCAL_BUILD_STATUS.md`
10. 本文件 `docs/CONTRIBUTING.md`

这些文档分别回答：

- 这个仓库是什么；
- 哪些 Markdown 是项目文档，哪些是运行时 / GitHub 资产；
- 当前工程契约到底承诺了什么、不承诺什么；
- 干净 checkout 应该如何 bootstrap 到可工作状态；
- 当前 verification matrix 是怎样映射到 `verify:*` / `debug:*` 脚本的；
- 如何从 0 到 1 构建和运行；
- 当前哪些 stub / shim / vendored asset / unavailable surface 仍然是治理对象；
- 当前 startup / print / inspector / pseudo-TTY 应该怎么调试；
- 当前修复已经推进到哪里；
- 应该怎样做出对仓库真正有帮助的贡献。

---

## 2. 开发前准备

### 2.1 环境要求

当前已验证的基础环境：

- Bun 1.3.x
- macOS 或类 Unix Shell

### 2.2 安装依赖

```bash
bun install
```

### 2.3 先确认仓库当前状态

建议在改动前先跑一遍：

```bash
npm run bootstrap
npm run verify:bootstrap
npm run verify:status
npm run verify:startup
```

这样你能先知道：

- 当前仓库在你的机器上是否能正常构建；
- reduced build 是否仍然可用；
- full build 的入口是否能跑起来。

---

## 3. 这两个构建链路分别意味着什么

### 3.1 `build:local`

```bash
bun run build:local
```

产物：

```bash
dist/local/cli.local.js
```

这条链路偏向：

- 诊断；
- 结构检查；
- reduced build 的命令面稳定性；
- 快速判断仓库是否仍处于“可维护”状态。

### 3.2 `build:full-local`

```bash
bun run build:full-local
```

产物：

```bash
dist/full/cli.js
```

这条链路偏向：

- 完整 CLI 主入口；
- 交互式 REPL 与完整 CLI 主入口；
- 更接近“用户真的要启动 Claude CLI”时的行为。

在修改运行时相关逻辑时，优先验证 full local build。

---

## 4. 推荐的最小验证集

如果你的改动影响的是构建、入口、运行时或兼容层，至少运行：

```bash
npm run verify
```

如果你的改动影响的是交互式启动，额外建议运行：

```bash
npm run debug:startup
```

如果你的改动影响的是请求路径、认证或代理诊断，额外建议运行：

```bash
npm run debug:print
```

如果你不确定应该先跑哪一条 debug surface，请直接看 [`docs/DEBUGGING.md`](./DEBUGGING.md)。它把 reduced/full、startup、print、inspector、typecheck 与 TTY/pseudo-TTY 差异都写成了显式入口。

---

## 5. 贡献时的优先原则

### 5.1 优先最小改动

请优先选择：

- 小范围、可验证的修复；
- 能解释清楚边界的兼容层；
- 不改变既有成功路径的外科手术式修改。

尽量避免：

- 一次性大面积“重写”；
- 没有验证支撑的大范围抽象整理；
- 为了“看起来完整”而引入无法验证的伪实现。

### 5.2 明确区分真恢复和兼容层

如果你加的是：

- shim
- stub
- no-op fallback
- unavailable boundary

请在 PR 描述和相关文档里明确写清楚，不要把它描述为“完整功能恢复”。

### 5.3 不要过度承诺仓库能力

请避免在文档、提交说明或 PR 描述里使用这类表述：

- “fully restored”
- “faithful upstream rebuild”
- “production-equivalent”

除非你真的有逐项证据证明这一点。

当前更准确的表述应始终围绕：

- local rebuild
- repair workspace
- reduced build
- full local build
- compatibility layer

---

## 6. 哪类贡献最有价值

当前最欢迎的贡献通常包括：

1. **构建链路修复**
   - 让 `build:local` / `build:full-local` 更稳定

2. **运行时兼容修复**
   - 让 full local CLI 更稳定地进入交互式界面 / REPL，并减少运行时阻塞

3. **启动噪音清理**
   - 把“正常缺省状态”从错误日志中剥离出去

4. **文档完善**
   - 让外部读者更容易理解仓库现状与边界

5. **开源整理**
   - 贡献流程、发布流程、仓库形态说明、模板文件等

---

## 7. 提交 PR 时建议包含什么

建议 PR 描述至少包含：

### 7.1 改动目标

- 你修了什么；
- 这个问题在哪条链路上出现；
- 为什么这个修复重要。

### 7.2 改动类型

明确说明是以下哪一类：

- 真正恢复了一段缺失逻辑；
- 新增兼容层；
- 新增 stub / shim；
- 清理启动噪音；
- 仅文档更新。

### 7.3 验证结果

至少附上你跑过的命令，例如：

```bash
npm run verify
npm run verify:restoration
npm run debug:inspector
```

### 7.4 已知限制

如果修复后仍有边界，请直接写出来。

例如：

- 入口已启动，但真实请求仍依赖认证；
- reduced build 可用，但不是完整上游功能面；
- full local CLI 已进入 REPL，但某类 provider 仍取决于环境配置。

---

## 8. 文档改动也要和实际行为对齐

如果你修改的是文档，请尽量遵守两个原则：

1. 命令必须能在当前仓库真实跑通，或者明确标注“计划中 / 尚未实现”。
2. 项目定位必须和当前实际状态一致，不能超出证据范围。

另外请注意：

- 项目级说明文档应优先整理到 `docs/`；
- 但不要把根目录 `README.md`、`.github/**/*.md` 模板，或 `skills/**/*.md` 这类会被程序消费的 Markdown 资产当作普通文档搬迁；
- 如果你不确定某个 `.md` 是否只是文档，先搜索代码里是否按固定路径读取它，再决定是否移动。

---

## 9. 贡献前的一个简单自检

在发 PR 之前，可以快速问自己：

- 这个改动是真的让仓库更可构建 / 可运行 / 更可解释了吗？
- 我有没有把 stub 当成完整恢复去描述？
- 我有没有验证我写进文档里的命令？
- 我有没有把边界写清楚？

如果这四个问题都能回答“是”，通常就已经走在对的方向上了。
