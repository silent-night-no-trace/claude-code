# MODULE_RESTORATION_LEDGER

最后更新：2026-04-13

这份 ledger 的目标不是把当前仓库包装成“已经完整恢复上游官方能力”，而是把当前 **仍然依赖 compatibility layer / stub / vendored runtime asset / unavailable boundary** 的对象登记出来，方便维护者回答：

- 这个对象是什么；
- 它为什么还存在；
- 当前是用什么方式替代或约束它；
- 风险在哪里；
- 应该由谁、用什么验证方法继续收敛。

它和 `npm run verify:restoration` 的关系是：

- `verify:restoration` 负责检查当前公开快照下 **missing relative imports / undeclared packages / omitted internal feature gaps** 是否重新回升；
- 本 ledger 负责把当前仍然“有意保留”的 stub / shim / vendored asset / unavailable surface 登记成治理对象，避免它们只存在于口头经验里。

换句话说，`verify:restoration` 是**硬门禁**，本 ledger 是**治理清单**。

---

## 字段说明

每个条目都至少包含：

- **名称**：对象的可识别名字
- **路径**：仓库里的主要路径
- **类别**：stub / shim / vendored asset / unavailable surface / feature gate / compatibility layer
- **当前替代目标**：它目前承担的工程作用
- **风险**：如果长期停留在当前状态，主要风险是什么
- **优先级**：P0 / P1 / P2
- **验证方法**：当前应该通过什么命令或人工检查来确认它没有退化
- **owner / owner-role**：当前建议负责角色
- **当前状态**：active / in_progress / planned / retired

---

## 1. `package.json` 中所有 `file:stubs/*` 依赖

| 名称 | 路径 | 类别 | 当前替代目标 | 风险 | 优先级 | 验证方法 | owner / owner-role | 当前状态 |
|---|---|---|---|---|---|---|---|---|
| `@ant/claude-for-chrome-mcp` | `package.json` → `file:stubs/ant-claude-for-chrome-mcp` | stub package mapping | 为 Chrome / MCP 相关源码提供本地可安装占位依赖 | 外部读者误以为是完整官方 MCP 实现 | P0 | `npm run bootstrap`, `npm run verify:bootstrap` | maintainer / build owner | active |
| `@ant/computer-use-input` | `package.json` → `file:stubs/ant-computer-use-input` | stub package mapping | 为 computer-use 输入层提供可安装占位依赖 | 真实原生输入能力仍未恢复 | P0 | `npm run bootstrap`, `npm run verify:bootstrap` | maintainer / build owner | active |
| `@ant/computer-use-mcp` | `package.json` → `file:stubs/ant-computer-use-mcp` | stub package mapping | 为 computer-use MCP server 提供可安装占位依赖 | 容易被误写成“computer use 已恢复” | P0 | `npm run bootstrap`, `npm run verify:bootstrap` | maintainer / build owner | active |
| `@ant/computer-use-swift` | `package.json` → `file:stubs/ant-computer-use-swift` | stub package mapping | 为 Swift/native sidecar 提供可安装占位依赖 | native 运行时能力仍未恢复 | P0 | `npm run bootstrap`, `npm run verify:bootstrap` | maintainer / build owner | active |
| `audio-capture-napi` | `package.json` → `file:stubs/audio-capture-napi` | stub package mapping | 为音频采集原生模块提供可安装占位依赖 | 音频功能边界易被误解 | P1 | `npm run bootstrap`, `npm run verify:bootstrap` | maintainer / native compatibility owner | active |
| `audio-capture.node` | `package.json` → `file:stubs/audio-capture.node` | stub package mapping | 为 `.node` 产物依赖提供可安装占位依赖 | native binary contract 仍为空壳 | P1 | `npm run bootstrap`, `npm run verify:bootstrap` | maintainer / native compatibility owner | active |
| `claude-code-local-claude-for-chrome-mcp` | `package.json` → `file:stubs/ant-claude-for-chrome-mcp` | alias stub mapping | 为本地命名空间下的 Chrome MCP 依赖提供兼容别名 | alias 与真实能力边界可能混淆 | P1 | `npm run bootstrap`, `npm run verify:bootstrap` | maintainer / package surface owner | active |
| `claude-code-local-computer-use-input` | `package.json` → `file:stubs/ant-computer-use-input` | alias stub mapping | 为本地命名空间下的 computer-use input 提供兼容别名 | alias 与真实能力边界可能混淆 | P1 | `npm run bootstrap`, `npm run verify:bootstrap` | maintainer / package surface owner | active |
| `claude-code-local-computer-use-mcp` | `package.json` → `file:stubs/ant-computer-use-mcp` | alias stub mapping | 为本地命名空间下的 computer-use MCP 提供兼容别名 | alias 与真实能力边界可能混淆 | P1 | `npm run bootstrap`, `npm run verify:bootstrap` | maintainer / package surface owner | active |
| `claude-code-local-computer-use-swift` | `package.json` → `file:stubs/ant-computer-use-swift` | alias stub mapping | 为本地命名空间下的 Swift sidecar 提供兼容别名 | alias 与真实能力边界可能混淆 | P1 | `npm run bootstrap`, `npm run verify:bootstrap` | maintainer / package surface owner | active |
| `color-diff-napi` | `package.json` → `file:stubs/color-diff-napi` | stub package mapping | 为颜色差异原生模块提供可安装占位依赖 | 图像比较类功能被误认为完整可用 | P1 | `npm run bootstrap`, `npm run verify:bootstrap` | maintainer / native compatibility owner | active |
| `image-processor-napi` | `package.json` → `file:stubs/image-processor-napi` | stub package mapping | 为图像处理原生模块提供可安装占位依赖 | 图像处理结果不可被视为已恢复 | P1 | `npm run bootstrap`, `npm run verify:bootstrap` | maintainer / native compatibility owner | active |
| `modifiers-napi` | `package.json` → `file:stubs/modifiers-napi` | stub package mapping | 为键盘/修饰键相关原生模块提供可安装占位依赖 | 输入/交互能力边界仍不完整 | P1 | `npm run bootstrap`, `npm run verify:bootstrap` | maintainer / native compatibility owner | active |
| `url-handler-napi` | `package.json` → `file:stubs/url-handler-napi` | stub package mapping | 为 URL handler 原生模块提供可安装占位依赖 | 平台集成能力边界被误读 | P1 | `npm run bootstrap`, `npm run verify:bootstrap` | maintainer / native compatibility owner | active |

---

## 2. `stubs/*` 已登记目录

| 名称 | 路径 | 类别 | 当前替代目标 | 风险 | 优先级 | 验证方法 | owner / owner-role | 当前状态 |
|---|---|---|---|---|---|---|---|---|
| `ant-claude-for-chrome-mcp` | `stubs/ant-claude-for-chrome-mcp/` | checked-in stub package | 占住 Chrome MCP 依赖位，保证 install/build 可继续进行 | 被误当作真实功能实现 | P0 | `npm run bootstrap`, `npm run verify:bootstrap` | maintainer / build owner | active |
| `ant-computer-use-input` | `stubs/ant-computer-use-input/` | checked-in stub package | 占住 computer-use input 依赖位 | 输入链路真实能力仍缺失 | P0 | `npm run bootstrap`, `npm run verify:bootstrap` | maintainer / build owner | active |
| `ant-computer-use-mcp` | `stubs/ant-computer-use-mcp/` | checked-in stub package | 占住 computer-use MCP 依赖位 | MCP 行为边界可能被误读 | P0 | `npm run bootstrap`, `npm run verify:bootstrap` | maintainer / build owner | active |
| `ant-computer-use-swift` | `stubs/ant-computer-use-swift/` | checked-in stub package | 占住 Swift/native sidecar 依赖位 | 原生 sidecar 仍不是公开快照的一部分 | P0 | `npm run bootstrap`, `npm run verify:bootstrap` | maintainer / build owner | active |
| `audio-capture-napi` | `stubs/audio-capture-napi/` | checked-in stub package | 提供音频原生模块占位 | 原生音频能力仍不真实 | P1 | `npm run bootstrap`, `npm run verify:bootstrap` | maintainer / native compatibility owner | active |
| `audio-capture.node` | `stubs/audio-capture.node/` | checked-in stub package | 提供 `.node` binary 依赖占位 | 容易给人“native binary 已恢复”的错觉 | P1 | `npm run bootstrap`, `npm run verify:bootstrap` | maintainer / native compatibility owner | active |
| `color-diff-napi` | `stubs/color-diff-napi/` | checked-in stub package | 提供图像对比原生依赖占位 | 图像/视觉 diff 仍非真实实现 | P1 | `npm run bootstrap`, `npm run verify:bootstrap` | maintainer / native compatibility owner | active |
| `image-processor-napi` | `stubs/image-processor-napi/` | checked-in stub package | 提供图像处理原生依赖占位 | 容易掩盖真实图像处理缺口 | P1 | `npm run bootstrap`, `npm run verify:bootstrap` | maintainer / native compatibility owner | active |
| `modifiers-napi` | `stubs/modifiers-napi/` | checked-in stub package | 提供输入修饰键原生依赖占位 | 输入语义可能不完整 | P1 | `npm run bootstrap`, `npm run verify:bootstrap` | maintainer / native compatibility owner | active |
| `url-handler-napi` | `stubs/url-handler-napi/` | checked-in stub package | 提供 URL handler 原生依赖占位 | 平台 URL 接管能力仍不真实 | P1 | `npm run bootstrap`, `npm run verify:bootstrap` | maintainer / native compatibility owner | active |

---

## 3. vendored runtime assets

| 名称 | 路径 | 类别 | 当前替代目标 | 风险 | 优先级 | 验证方法 | owner / owner-role | 当前状态 |
|---|---|---|---|---|---|---|---|---|
| Vendored ripgrep runtime contract | `node_modules/@anthropic-ai/claude-agent-sdk/vendor/ripgrep` → `dist/full/vendor/ripgrep` | vendored runtime asset | 保证 full local build 启动时仍能拿到内置 ripgrep runtime | 如果只验证 `dist/full/cli.js` 而忽略 vendor 复制，full build 会形成假阳性 | P0 | `npm run verify:bootstrap`, `npm run cli:build`, `npm run cli:check` | maintainer / runtime asset owner | active |

---

## 4. 明显的 “unavailable in local reduced build” surface

下面这些对象不是“真实功能恢复”，而是**显式边界**：它们存在的目的是在被调用时给出清晰 unavailable 提示，而不是让缺口以 missing import / silent no-op 的方式出现。

| 名称 | 路径 | 类别 | 当前替代目标 | 风险 | 优先级 | 验证方法 | owner / owner-role | 当前状态 |
|---|---|---|---|---|---|---|---|---|
| Assistant CLI command boundary | `commands/assistant/index.ts` | unavailable surface | 为 `/assistant` 保留可解释边界，避免 reduced build 缺 import | 容易被误解为 assistant 功能已经存在只差细节 | P0 | `npm run cli:check`, `npm run verify:restoration` | maintainer / command surface owner | active |
| Assistant runtime gate | `assistant/index.ts`, `assistant/gate.ts` | feature gate / unavailable surface | 明确 assistant mode 当前在 reduced build 不可用 | runtime caller 可能继续增长，导致边界散落 | P0 | `npm run verify:restoration`, `npm run verify:typecheck` | maintainer / feature gate owner | active |
| Workflow command boundary | `commands/workflows/index.ts`, `tools/WorkflowTool/createWorkflowCommand.ts` | unavailable surface | 为 workflow command/script surface 提供显式 reduced-build 边界 | 读者可能误判 workflow 已部分恢复 | P0 | `npm run cli:check`, `npm run verify:restoration` | maintainer / command surface owner | active |
| Proactive mode boundary | `commands/proactive.ts` | unavailable surface | 为 proactive mode 提供显式 unavailable 提示 | 容易被误写成 feature flag 暂未开启，而不是功能未恢复 | P1 | `npm run cli:check`, `npm run verify:restoration` | maintainer / command surface owner | active |
| Agents platform boundary | `commands/agents-platform/index.ts` | unavailable surface | 为 internal-only command surface 提供显式边界 | internal/public 语义可能混淆 | P1 | `npm run cli:check`, `npm run verify:restoration` | maintainer / command surface owner | active |
| Remote control server boundary | `commands/remoteControlServer/index.ts` | unavailable surface | 为 remote control server command 保留可解释边界 | server-related surface 被误判为接近可用 | P1 | `npm run cli:check`, `npm run verify:restoration` | maintainer / server surface owner | active |
| Subscribe PR boundary | `commands/subscribe-pr.ts` | unavailable surface | 为 PR/webhook 入口保留显式 unavailable 提示 | GitHub integration 真实能力边界不清 | P1 | `npm run cli:check`, `npm run verify:restoration` | maintainer / integration owner | active |
| Force-snip / torch command boundaries | `commands/force-snip.ts`, `commands/torch.ts` | unavailable surface | 为新增命令名保留可解释边界 | 命令注册继续扩张后更难统一治理 | P1 | `npm run cli:check`, `npm run verify:restoration` | maintainer / command surface owner | active |
| CLI background session boundaries | `cli/bg.ts`, `cli/handlers/templateJobs.ts`, `cli/handlers/ant.ts` | unavailable surface | 为 bg / template jobs / task-style CLI subcommands 提供显式 unavailable 提示 | 入口已存在但行为仍是 reduced-build placeholder | P0 | `npm run cli:check`, `npm run verify:restoration` | maintainer / CLI transport owner | active |
| Server/direct-connect boundaries | `server/connectHeadless.ts`, `server/backends/dangerousBackend.ts`, `server/server.ts`, `server/sessionManager.ts` | unavailable surface / compatibility shell | 为 direct-connect / server backend 提供显式边界或最小壳层 | server surface 误导性最强，长期不治理风险较高 | P0 | `npm run verify:restoration`, `npm run verify:typecheck` | maintainer / server surface owner | active |
| Daemon / self-hosted / environment runner boundaries | `daemon/main.ts`, `daemon/workerRegistry.ts`, `self-hosted-runner/main.ts`, `environment-runner/main.ts` | unavailable surface | 保持这些 entry surface 可导入且边界清晰 | 未来若继续被入口引用，容易形成“能启动但不能工作”的灰区 | P1 | `npm run verify:restoration`, `npm run verify:typecheck` | maintainer / runtime owner | active |
| SSH boundary shim | `ssh/createSSHSession.ts` | shim / unavailable surface | 为 SSH session surface 提供显式 `SSHSessionError` 边界 | 可能被误读成 SSH 仅缺配置而不是功能未恢复 | P1 | `npm run verify:restoration`, `npm run verify:typecheck` | maintainer / compatibility owner | active |
| Peer / remote-control bridge boundary | `bridge/peerSessions.ts` | unavailable surface | 为 peer session / remote-control bridge 提供明确失败语义 | bridge surface 会与真实 transport 能力混淆 | P1 | `npm run verify:typecheck`, `npm run verify:restoration` | maintainer / bridge owner | active |

---

## 5. reduced/full 兼容层与可选功能门控项

这些对象不一定直接输出 unavailable 文案，但它们仍属于“当前公开快照依赖的 compatibility contract”，因此也应进入 ledger。

| 名称 | 路径 | 类别 | 当前替代目标 | 风险 | 优先级 | 验证方法 | owner / owner-role | 当前状态 |
|---|---|---|---|---|---|---|---|---|
| Reduced/full build macro contract | `scripts/build-config.ts`, `scripts/build-local.ts`, `scripts/build-full-local.ts` | compatibility layer | 用统一 define/external contract 保证 local build 与 full build 仍能产物化 | 如果宏/externals 漂移，会导致“能 build 但运行面不一致” | P0 | `npm run cli:build`, `npm run test` | maintainer / build owner | active |
| Local build inspector contract | `utils/localBuildInspector.ts` | compatibility layer / restoration observer | 将 missing import / undeclared package / generated/internal/content gaps 收敛成可执行检查 | 如果 inspector 规则漂移，`verify:restoration` 会失去可信度 | P0 | `npm run verify:restoration`, `npm run debug:inspector`, `npm run test` | maintainer / restoration owner | active |
| Reduced/full CLI wrapper surface | `scripts/cli-build.ts`, `scripts/cli-check.ts`, `scripts/cli-status.ts`, `scripts/cli-run.ts` | compatibility layer | 为维护者和 CI 提供 canonical local-build wrappers，而不是依赖散乱底层命令 | wrapper 与实际 entrypoint 脱节会让 CI 产生假安全感 | P0 | `npm run cli:check`, `npm run verify`, `npm run test` | maintainer / maintainer workflow owner | active |

---

## 6. 当前治理规则

在新增、修改或删除本 ledger 中的对象时，默认应遵守：

1. **不要把 stub / shim / unavailable boundary 写成功能恢复。**
2. **如果改动影响 `file:stubs/*`、vendored ripgrep 或 inspector 分类，必须跑 `npm run verify:restoration`。**
3. **如果改动影响 build / wrapper / startup surface，至少跑 `npm run cli:check` 与 `npm run verify`。**
4. **如果一个 unavailable surface 被真实实现替换，应该同时：**
   - 更新本 ledger；
   - 更新对应文档中的能力描述；
   - 补充相应 tests / verify surface，而不是只删掉 unavailable 文案。

---

## 7. 当前最优先的后续收敛方向

按风险与误解成本排序，当前最值得优先继续推进的是：

1. server / direct-connect boundaries
2. workflow / task / monitor 类 placeholder surface
3. package stub layer 与 native compatibility surface 的更精细 owner / status 划分
4. 把本 ledger 引用进后续 `docs/DEBUGGING.md` 与 maintainer workflow

在这些对象真正收敛前，本仓库仍应被准确描述为：

> 一个可以构建 reduced/full local build、但仍依赖 compatibility layer、stub package、vendored runtime asset 与显式 unavailable boundary 的本地重建与修复工作区。
