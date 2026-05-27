# GitHub 开源发布检查清单

这份清单面向仓库维护者，目标不是“让仓库看起来像已经完全恢复的官方项目”，而是确保它在开源发布时：

- 定位准确；
- 文档清楚；
- 基础仓库元信息完整；
- 外部读者不会被误导。

---

## 1. 项目定位是否准确

发布前先确认 README、仓库描述和 release 文案没有使用这些表述：

- fully restored
- production-equivalent
- official upstream mirror
- faithful upstream rebuild

当前更合适的表述应该围绕：

- local rebuild
- repair workspace
- reduced build
- full local build
- compatibility layer

---

## 2. 仓库基础文件是否齐全

至少检查这些文件是否存在并可读：

- `README.md`
- `docs/CONTRIBUTING.md`
- `docs/SECURITY.md`
- `docs/LOCAL_BUILD_STATUS.md`
- `docs/BUILD_AND_USAGE.md`

如果准备正式公开，还应补齐：

- `LICENSE` 或 `LICENSE.md`
- `.github/ISSUE_TEMPLATE/*`
- `.github/ISSUE_TEMPLATE/config.yml`
- `.github/pull_request_template.md`
- `.github/workflows/local-build-verification.yml`

如果还没有决定许可证，请不要草率补一个默认文本；先明确仓库准备采用哪种开源协议。

---

## 3. 快速开始是否真实可跑

在正式开源前，至少重新手工验证这些命令：

```bash
bun install
bun run build:local
bun run build:full-local
bun ./dist/local/cli.local.js doctor
bun ./dist/full/cli.js --help
```

如果 README 里写了命令，就必须确保它们和当前仓库状态一致。

---

## 4. 两条构建链路是否讲清楚了

对外发布时，必须明确：

### reduced build

- 命令：`bun run build:local`
- 产物：`dist/local/cli.local.js`
- 作用：诊断、结构检查、reduced 命令面

### full build

- 命令：`bun run build:full-local`
- 产物：`dist/full/cli.js`
- 作用：启动完整 CLI 主入口、进入交互式 REPL，并验证更接近真实使用方式的运行状态

如果这两条链路不说清楚，外部读者很容易误会 reduced build 就是项目的完整能力边界。

---

## 5. 已知限制是否对外透明

发布前确认文档里已经明确写出：

- 当前版本号仍是 `0.0.0-local`
- 仓库包含 shim / stub / compatibility layer
- 实际模型请求依赖认证、代理和环境配置
- 仓库不应被描述为上游官方等价发布

如果这些限制没有写清楚，后续 issue 会大量被“预期错误”淹没。

---

## 6. 开源读者最常问的问题是否有答案

请确认文档已经能回答：

1. 这个仓库是什么？
2. 这个仓库不是什么？
3. 我应该跑哪条构建命令？
4. 构建出来以后怎么启动？
5. 为什么能进 REPL 但请求还失败？
6. 哪里是兼容层，哪里是真恢复？
7. 我贡献代码时至少要验证什么？

如果这些问题没有答案，就还不适合面对陌生开源读者。

---

## 7. GitHub 仓库设置建议

如果后续正式公开维护，建议同时检查 GitHub 仓库设置：

- 开启 Issues
- 开启 Discussions（可选）
- 开启 Security Advisories
- 设置默认分支保护规则
- 配置 issue / PR template
- 启用或调整 CI workflow
- 补充仓库 Topics / Description

---

## 8. 发布前的人工复核建议

正式开源前，建议至少做一次人工检查：

- 文档中是否还残留只适合内部维护者阅读的表述
- 是否有过度承诺能力的句子
- 是否引用了不存在的文件或命令
- 是否公开了不该公开的调试输出、路径或敏感配置示例

---

## 9. 一个简化的发布完成标准

如果下面这些都满足，仓库通常就已经达到了“适合对外发布”的最低线：

- 文档能解释仓库真实状态
- reduced / full 两条链路都能跑
- 贡献方式清楚
- 安全披露方式清楚
- 已知限制写清楚
- 没有把本地重建工作区误写成官方完整发布
