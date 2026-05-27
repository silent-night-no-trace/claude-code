# 文档中心

这个目录是当前仓库的**项目文档主目录**。

如果你想了解这个仓库是什么、如何构建、如何贡献，以及当前项目边界，优先从这里开始，而不是在仓库里逐个翻找 Markdown 文件。

## 按读者分组的阅读入口

### 第一次接触这个仓库

1. [`../README.md`](../README.md) —— 先看仓库定位、当前能力边界和快速开始
2. [`ENGINEERING_CONTRACT.md`](./ENGINEERING_CONTRACT.md) —— 再看当前工程契约与 build/runtime 边界
3. [`BOOTSTRAP.md`](./BOOTSTRAP.md) —— 再看干净 checkout 的安装与 bootstrap 验证路径
4. [`VERIFICATION_MATRIX.md`](./VERIFICATION_MATRIX.md) —— 再看当前 verification surface 与 `verify:*` / `debug:*` / CI 的映射
5. [`BUILD_AND_USAGE.md`](./BUILD_AND_USAGE.md) —— 再看从 0 到 1 的构建、运行、验证方式
6. [`MODULE_RESTORATION_LEDGER.md`](./MODULE_RESTORATION_LEDGER.md) —— 再看当前仍被治理的 stub / shim / unavailable surface
7. [`DEBUGGING.md`](./DEBUGGING.md) —— 再看当前 debug surfaces、pseudo-TTY 与 request path 的调试入口
8. [`REPO_SHAPE.md`](./REPO_SHAPE.md) —— 最后理解哪些目录更接近主体实现，哪些是 stub / shim / 兼容层

### 准备开始贡献

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) —— 贡献原则、最小验证集与文档更新要求
- [`DEBUGGING.md`](./DEBUGGING.md) —— 当前 startup / print / inspector / TTY 调试入口
- [`LOCAL_BUILD_STATUS.md`](./LOCAL_BUILD_STATUS.md) —— 当前本地构建状态、`doctor` 指标与阶段性修复记录

### 想理解长期方向

- [`ROADMAP.md`](./ROADMAP.md) —— 后续维护路线图与计划中的工程化工作流

> 注意：`ROADMAP.md` 中列出的部分文档、脚本和 CI gate 还是**计划项**，并不代表当前仓库里已经全部存在。

### 准备对外开源整理

- [`OPEN_SOURCE_RELEASE_CHECKLIST.md`](./OPEN_SOURCE_RELEASE_CHECKLIST.md) —— 面向 GitHub 开源整理的发布检查清单
- [`SECURITY.md`](./SECURITY.md) —— 本仓库的安全边界与问题披露建议

## 当前文档清单

- [`BUILD_AND_USAGE.md`](./BUILD_AND_USAGE.md)
- [`BOOTSTRAP.md`](./BOOTSTRAP.md)
- [`ENGINEERING_CONTRACT.md`](./ENGINEERING_CONTRACT.md)
- [`EVOLUTION_ROADMAP.md`](./EVOLUTION_ROADMAP.md)
- [`VERIFICATION_MATRIX.md`](./VERIFICATION_MATRIX.md)
- [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- [`DEBUGGING.md`](./DEBUGGING.md)
- [`LOCAL_BUILD_STATUS.md`](./LOCAL_BUILD_STATUS.md)
- [`REPO_SHAPE.md`](./REPO_SHAPE.md)
- [`ROADMAP.md`](./ROADMAP.md)
- [`SECURITY.md`](./SECURITY.md)
- [`OPEN_SOURCE_RELEASE_CHECKLIST.md`](./OPEN_SOURCE_RELEASE_CHECKLIST.md)

## Markdown 归档规则

当前仓库中，**面向读者的项目文档应统一放在 `docs/` 下**。

但有几类 Markdown 虽然也是 `.md` 文件，**并不是普通说明文档**，因此应保留在原位：

1. 根目录 `README.md`
   - 这是 GitHub / 包仓库 / 克隆后首屏入口。
   - 可以把它视为仓库首页，而不是 `docs/` 内部文档。

2. `.github/**/*.md`
   - 例如 issue template、pull request template。
   - 这些文件由 GitHub 工作流和界面按固定位置读取，不能简单搬到 `docs/`。

3. `skills/**/*.md`
   - 这批文件里包含 `SKILL.md` 和被构建脚本直接导入的内容资源。
   - 它们属于运行时 / 构建时资产，而不是纯文档。
   - 例如 `skills/bundled/claude-api/**/*.md` 会被源码直接 `import`，`skills/*/SKILL.md` 会被技能加载器按固定路径读取。

## 当前整理结论

截至 2026-04-13：

- 项目级说明文档已经集中在 `docs/`；
- 根目录只保留 `README.md` 这个仓库首页文档；
- `.github/` 和 `skills/` 下的 Markdown 保留原位，原因是它们属于 GitHub 模板或程序消费的内容资源；
- `npm run cli:status` 与 `npm run cli:check` 已通过，当前文档中引用的核心命令和构建产物与仓库现状一致。

## 本轮文档巡检结果

- 当前仓库的核心项目文档已经开始形成显式交叉链接网络，`README.md`、本文件以及 `ENGINEERING_CONTRACT` / `BOOTSTRAP` / `BUILD_AND_USAGE` / `CONTRIBUTING` 等文档都会把读者导向对应入口；
- `ROADMAP.md` 中提到的若干 `docs/*.md` 文件属于计划产物，因此已经在该文档顶部显式标注为 roadmap deliverables；
- `skills/**/*.md` 与 `.github/**/*.md` 已确认存在代码或平台层面的固定路径依赖，不应作为普通文档迁移。
