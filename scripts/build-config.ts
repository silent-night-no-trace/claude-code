export const LOCAL_BUILD_EXTERNAL = ['@ant/*'] as const

export const LOCAL_BUILD_DEFINE = {
  'process.env.USER_TYPE': JSON.stringify('external'),
  'process.env.CLAUDE_CODE_ENTRYPOINT': JSON.stringify('cli'),
  'process.env.EMBEDDED_SEARCH_TOOLS': JSON.stringify('0'),
  'MACRO.VERSION': JSON.stringify('0.0.0-local'),
  'MACRO.BUILD_TIME': JSON.stringify(''),
  'MACRO.PACKAGE_URL': JSON.stringify('@anthropic-ai/claude-code'),
  'MACRO.NATIVE_PACKAGE_URL': JSON.stringify('@anthropic-ai/claude-code-native'),
  'MACRO.FEEDBACK_CHANNEL': JSON.stringify('https://github.com/silent-night-no-trace/claude-code/issues'),
  'MACRO.ISSUES_EXPLAINER': JSON.stringify('open an issue in the repository'),
  'MACRO.VERSION_CHANGELOG': JSON.stringify(''),
} as const
