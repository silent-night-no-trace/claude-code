type RemoteSkillMeta = {
  url: string
}

export function stripCanonicalPrefix(commandName: string): string | null {
  return commandName.startsWith('_canonical_')
    ? commandName.slice('_canonical_'.length)
    : null
}

export function getDiscoveredRemoteSkill(_slug: string): RemoteSkillMeta | null {
  return null
}
