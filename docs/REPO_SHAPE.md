# 仓库结构说明：真实现、兼容层与生成产物

这份文档的目标不是把整个仓库逐文件注释一遍，而是回答外部读者和贡献者最容易困惑的问题：

- 这个仓库里哪些部分更接近“原始源码实现”？
- 哪些部分是为了让公开快照可构建、可启动而补上的兼容层？
- 哪些目录本身就是本地 stub 或生成产物，不应该被误读成“完整功能已经恢复”？

> 一个务实的理解方式是：这个仓库的主体仍然是公开源码快照本身；但为了让它在开源环境中可构建、可运行，仓库额外引入了本地 build 脚本、stub 包、运行时兼容修复，以及一部分明显带边界的 compatibility layer。

---

## 1. 先给一个总图

可以先把仓库粗略理解成 5 层：

1. **主体源码层**
   - 主要是根目录下原始业务/CLI/UI/服务代码
   - 例如 `commands/`、`components/`、`services/`、`utils/`、`entrypoints/`

2. **本地构建入口层**
   - 明确为了这个重建工作区新增或维护的本地 build 入口
   - 例如 `scripts/build-local.ts`、`scripts/build-full-local.ts`

3. **本地 stub / shim 层**
   - 明确为了开源场景的可构建性补上的占位包或兼容包
   - 例如 `stubs/`

4. **本地运行时兼容修复层**
   - 仍然位于主体源码树中，但改动目的主要是让 full local build 真正能启动
   - 例如本地 version gate 放行、renderer 兼容修复、vendored ripgrep 打包支持等

5. **生成产物层**
   - 构建输出目录，不应作为源码修改入口
   - 例如 `dist/`

---

## 2. 哪些目录大体上应视为“主体源码”

这些目录通常更接近仓库本来的实现主体：

- `commands/`
- `components/`
- `services/`
- `utils/`
- `tools/`
- `hooks/`
- `bridge/`
- `server/`
- `daemon/`
- `entrypoints/`

但要注意：

这并不意味着这些目录里的每一个文件都已经等同于官方上游状态。当前仓库里有一部分**本地兼容性修复**就直接落在这些目录中，因为那是最小可行、最容易验证的修复点。

也就是说：

- “位于主体源码目录” ≠ “一定是完全原始、未调整实现”
- 更准确的说法是：这些目录仍然是主要实现所在地，但其中夹杂了一部分为了开源可运行性而做的本地修复

---

## 3. 哪些文件明显属于本地构建入口层

当前最明确的本地构建入口是：

- `scripts/build-local.ts`
- `scripts/build-full-local.ts`

它们不是“上游官方发布脚本的原样镜像”，而是这个重建工作区当前真实使用的本地构建入口。

### 3.1 `scripts/build-local.ts`

作用：

- 构建 reduced local build
- 入口是 `entrypoints/cli.local.ts`
- 产物输出到 `dist/local`

### 3.2 `scripts/build-full-local.ts`

作用：

- 构建 full local build
- 入口是 `entrypoints/cli.tsx`
- 产物输出到 `dist/full`
- 额外复制 vendored ripgrep 到 `dist/full/vendor/ripgrep`

如果你在看“本仓库今天到底是怎么构建出来的”，这两个文件比历史状态文档更重要。

---

## 4. 哪些文件明显属于 stub / shim 层

最明显的一层就是：

- `stubs/`

这里的内容应当直接理解为：

> 本地可构建性支撑层，而不是功能完整恢复。

当前这里能看到的例子包括：

- `stubs/ant-*`
- `stubs/audio-capture-*`
- `stubs/color-diff-napi`
- `stubs/image-processor-napi`
- `stubs/modifiers-napi`
- `stubs/url-handler-napi`

这些 stub 的意义通常是：

- 占住依赖面；
- 满足模块解析；
- 在开源环境里给出最小可运行接口；
- 避免因为私有或不可获得依赖而完全无法构建。

因此，看到 `stubs/` 下的东西时，默认应该假设：

- 这是重建工作区的适配层；
- 不是官方完整实现；
- 修改这里时要特别清楚自己是在“保持构建可用”，还是在“替换真实行为”。

---

## 5. 哪些入口明确带有 reduced-build 边界

一个很清晰的例子是：

- `entrypoints/cli.local.ts`

它直接把自己表述为：

- local reduced build
- 仅支持 `--help`、`--version`、`inspect-build`、`doctor`
- 其他完整命令面并未承诺恢复

这类文件应被看作：

> 明确带边界的、本地诊断入口

而不是“完整 CLI 只是少几个命令”。

---

## 6. 哪些入口代表 full local build 的真实运行路径

当前 full local build 的真实入口是：

- `entrypoints/cli.tsx`

它不是 reduced build 专用壳子，而是完整 CLI 主入口。

当前仓库已经验证过：

- 通过 `scripts/build-full-local.ts` 构建它
- 产出 `dist/full/cli.js`
- 可以进入交互式 REPL

因此，如果你要排“为什么 full local CLI 起不来”，优先应该沿着：

- `scripts/build-full-local.ts`
- `entrypoints/cli.tsx`
- `main.tsx`

这条路径看，而不是只盯着 reduced build。

---

## 7. 哪些内容属于“本地运行时兼容修复”

这类内容的特点是：

- 文件看起来位于主体源码树中；
- 但修改目的主要是让本地 full build 在公开环境下启动成功；
- 它们往往不是新增一个完整功能，而是修复运行时兼容、版本门禁、缺失资源或公开依赖问题。

当前已验证存在的这类修复类型包括：

- local version gate 放行
- `useEffectEvent` 兼容修复
- `signal` → `cancelSignal` 的 execa 兼容
- vendored ripgrep 打包与启动路径修复
- 缺失 `~/.claude/...` 目录时的启动噪音清理

这些改动虽然分散在源码树里，但它们更适合被理解为：

> 为了让公开快照在本地真实跑起来而做的运行时兼容修复

---

## 8. 哪些目录应视为生成产物，不要直接改

最典型的是：

- `dist/`

当前你可能会看到：

- `dist/local/cli.local.js`
- `dist/full/cli.js`
- `dist/full/vendor/ripgrep/...`

这些都是构建输出。

通常规则是：

- **不要把 `dist/` 当作源码编辑入口**
- 真正要修行为，去改对应的源码文件和构建脚本

---

## 8.5 哪些 Markdown 其实不是“普通文档”

仓库里虽然有不少 `.md` 文件，但不要把它们一概理解成“都应该搬进 `docs/` 的说明文档”。

当前至少有三类例外：

1. `README.md`
   - 这是仓库首页入口，应保留在根目录。

2. `.github/**/*.md`
   - 例如 issue template、PR template。
   - 这些文件属于 GitHub 工作流配置的一部分。

3. `skills/**/*.md`
   - 这类 Markdown 往往是运行时或构建时资产，而不是纯说明文字。
   - 例如 `skills/bundled/claude-api/**/*.md` 会被源码直接导入，`skills/*/SKILL.md` 也会被技能加载器按固定目录约定读取。

所以更准确的规则是：

> **面向读者的项目文档集中放在 `docs/`，但被 GitHub 或程序本身消费的 Markdown 应保留在其约定位置。**

---

## 9. 一个实用判断法：看到一个文件时怎么判断它更像什么

可以用下面这套简单规则：

### 更像主体实现

如果文件：

- 位于 `commands/`、`components/`、`services/`、`utils/` 等主要源码目录
- 没有明显的 “local reduced build” 或 “unavailable” 边界提示
- 不在 `stubs/` 和 `dist/` 里

那它大概率更接近主体实现路径。

### 更像兼容层

如果文件：

- 明确提到 `0.0.0-local`
- 明确提到 local build / reduced build
- 明确做了版本门禁绕开、运行时兼容、构建期替代
- 是为了让公开环境可运行而新增的 build/support 逻辑

那它更像重建工作区的兼容层。

### 更像 stub

如果文件：

- 位于 `stubs/`
- 被 `package.json` 里的 `file:stubs/...` 依赖引用
- 只提供最小导出面或本地可构建替代

那应默认按 stub 理解，而不是完整功能恢复。

### 更像生成产物

如果文件：

- 位于 `dist/`

那就把它当作构建输出，而不是源码。

---

## 10. 对贡献者最有用的一个结论

如果你要提交改动，可以先问自己一句：

> 我现在改的是主体实现、兼容层、stub，还是生成产物？

不同答案意味着不同的预期：

- 改主体实现：更看重行为正确性和长期结构
- 改兼容层：更看重边界清楚和最小可行修复
- 改 stub：更看重可构建性与明确边界，避免假装完整恢复
- 改生成产物：通常不是正确入口

这套判断能显著减少“看起来修好了，其实只是把边界弄模糊了”的问题。
