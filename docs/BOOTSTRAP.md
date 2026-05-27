# Bootstrap 指南

这份文档定义当前仓库从**干净 checkout**进入“可 build / run / debug”状态的最低可重复路径。

它是路线图中的 **P0-B**，建立在 [`ENGINEERING_CONTRACT.md`](./ENGINEERING_CONTRACT.md) 之上：

- 先承认当前工程契约；
- 再把新维护者从 0 到 1 的准备路径写成文档和脚本；
- 最后让 CI 也调用同一套入口，而不是复制一堆隐式命令。

---

## 1. 这份文档解决什么问题

当前仓库已经可以：

- 构建 reduced local build；
- 构建 full local build；
- 启动 full local CLI；
- 通过 `cli:status` / `cli:check` 做本地 smoke verification。

但如果没有统一 bootstrap 路径，新维护者仍然需要自己猜：

- 应该用什么 Bun 版本；
- `bun install` 之后哪些资产必须存在；
- 从 install 到 build / run / debug 的最短路径是什么；
- CI 应该验证哪条 clean-state 路径。

这份文档和 `bootstrap` / `verify:bootstrap` 两个脚本，就是为了解决这些隐式知识。

---

## 2. 平台与工具要求

当前 bootstrap 契约以以下前提为准：

- **Bun 1.3.x**
- **macOS 或类 Unix Shell 环境**

对应依据已经在 [`ENGINEERING_CONTRACT.md`](./ENGINEERING_CONTRACT.md) 中定义。

在当前阶段，请不要把这份 bootstrap 指南理解成“任意平台都已正式支持”。如果后续需要扩大支持范围，应先同步更新工程契约、脚本和验证。

---

## 3. 干净 checkout 的最低路径

### 3.1 手动路径

```bash
bun install
npm run bootstrap
npm run cli:build
npm run cli:check
```

这条路径的目标是让一个新维护者在没有额外口头说明的情况下，完成：

1. 依赖安装；
2. install-time 资产检查；
3. reduced / full build 产物生成；
4. CLI 基础 smoke check。

### 3.2 一键验证路径

如果你想直接验证“这台机器是否满足当前 clean bootstrap 契约”，运行：

```bash
npm run verify:bootstrap
```

这会串起：

1. `npm run bootstrap`
2. `npm run cli:build`
3. 构建产物与 vendored runtime assets 检查
4. `npm run cli:check`

---

## 4. `bootstrap` 当前负责什么

当前 `bootstrap` 脚本负责：

1. 检查运行平台不是 `win32`
2. 检查 Bun 版本匹配 `1.3.x`
3. 检查关键仓库路径存在
4. 执行 `bun install`
5. 验证 install 后的关键资产存在

当前脚本特别检查以下 install-time 资产：

- `node_modules/`
- `bun.lock`
- `node_modules/@anthropic-ai/claude-agent-sdk/vendor/ripgrep`

之所以把这些资产列成契约，是因为它们直接影响：

- full local build 是否能复制 vendored ripgrep；
- `file:stubs/*` 与公开依赖是否已经被 Bun 正确装配；
- 后续 `cli:build` / `cli:check` 是否能在 clean checkout 上稳定运行。

---

## 5. `verify:bootstrap` 当前负责什么

当前 `verify:bootstrap` 不是抽象口号，而是明确执行以下步骤：

```bash
npm run bootstrap
npm run cli:build
npm run cli:check
```

并在中间显式验证：

- `dist/local/cli.local.js`
- `dist/full/cli.js`
- `dist/full/vendor/ripgrep`

这意味着 clean-checkout bootstrap 的当前成功标准是：

- 依赖可以安装；
- reduced/full build 都能产出；
- full build 的 vendored runtime assets 也能一起就位；
- CLI 的 status / version / help smoke path 正常。

---

## 6. install 后你应该看到什么

在当前阶段，完成 `bun install` + `npm run bootstrap` 之后，维护者应预期以下几类资产存在：

### 6.1 仓库侧前提

- `package.json`
- `stubs/ant-computer-use-mcp`
- `stubs/ant-computer-use-swift`

### 6.2 安装侧资产

- `node_modules/`
- `bun.lock`
- `node_modules/@anthropic-ai/claude-agent-sdk/vendor/ripgrep`

### 6.3 构建后资产（由 `verify:bootstrap` 继续检查）

- `dist/local/cli.local.js`
- `dist/full/cli.js`
- `dist/full/vendor/ripgrep`

---

## 7. 从 0 到 build / run / debug 的建议顺序

当前维护者最稳妥的顺序是：

```bash
bun install
npm run bootstrap
npm run cli:build
npm run cli:status
npm run cli:check
npm run cli:run -- --help
```

如果你要进一步调试 full local build，可继续：

```bash
npm run cli:run
npm run cli:run -- --debug-to-stderr
npm run cli:run -- -p "hello"
```

---

## 8. 与 `verify:typecheck` 的关系

路线图里的 P0-B 最低路径示意里包含：

```bash
npm run verify:typecheck
```

当前仓库现在已经提供 `verify:typecheck` 的 **baseline-backed no-regression gate**，并把当前快照固定在：

- `artifacts/typecheck-baseline.txt`

所以当前最准确的表述应当是：

- `verify:typecheck` 现在会把当前 `tsc` 结果和 committed baseline 做比较；
- 它允许“历史错误仍然存在，但不能新增”；
- 如果后续类型错误继续下降，应通过更新 baseline artifact 来显式收敛，而不是静默漂移。

当前 bootstrap 推荐路径因此可以更新为：

```bash
bun install
npm run bootstrap
npm run cli:build
npm run cli:check
npm run verify:typecheck
```

---

## 9. clean-state CI 现在应该怎么做

当前 clean-state CI workflow 入口应优先调用：

```bash
npm run verify
```

其中 `verify:bootstrap` 仍然是 bootstrap reproducibility 这一小块的 canonical slice；只是当前 workflow 已经把它收进了更宽的 `npm run verify` 套件里。

这样做依然比把 `bun install`、`build:local`、`build:full-local`、`--help`、`--version` 分散写成多段彼此独立的命令更稳妥。

这样做的原因是：

- CI 与新维护者走同一套入口；
- 后续 bootstrap 逻辑如果变更，只需要改一处；
- 文档、脚本与 CI 更容易维持一致。

如果你想进一步看 bootstrap 在整个验证体系里的位置，以及它与 `verify:*` / `debug:*` 的关系，请继续阅读 [`docs/VERIFICATION_MATRIX.md`](./VERIFICATION_MATRIX.md)。

---

## 10. 当前 done-when

在当前 P0-B 切片下，可以认为 bootstrap 已经基本收口，当且仅当：

- 新维护者只看本文件就能完成 clean checkout 初始化；
- `npm run bootstrap` 可重复通过；
- `npm run verify:bootstrap` 可重复通过；
- CI 至少通过 canonical verify suite 覆盖了同一套 bootstrap verification slice。

后续如果 bootstrap 逻辑继续扩展，仍然应优先保持这四个条件不退化。
