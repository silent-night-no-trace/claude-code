type AssistantMessageLike = {
  type?: string
}

export async function classifyAndWriteState(
  _jobDir: string,
  _assistantMessages: AssistantMessageLike[],
): Promise<void> {}
