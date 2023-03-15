export type InstallablePlugins = {
  id: string
  name: string
  isExternalModule: boolean
  entryPoint: string // File name representing main entry point of plugin config.
  tag: 'NEW & UPCOMING' | 'THEME' | 'BASICS'
}

export const installablePlugins: InstallablePlugins[] = [
  {
    id: 'devprotocol:clubs:plugin:community',
    name: 'community',
    entryPoint: 'index.ts',
    tag: 'BASICS',
    isExternalModule: false,
  },
  {
    id: 'devprotocol:clubs:theme-1',
    name: 'default-theme',
    entryPoint: 'index.ts',
    tag: 'THEME',
    isExternalModule: false,
  },
  {
    id: 'devprotocol:clubs:plugin:join',
    name: 'join',
    entryPoint: 'index.ts',
    tag: 'BASICS',
    isExternalModule: false,
  },
  {
    id: 'devprotocol:clubs:plugin:me',
    name: 'me',
    entryPoint: 'index.ts',
    tag: 'BASICS',
    isExternalModule: false,
  },
  {
    id: 'devprotocol:clubs:plugin:members',
    name: 'members',
    entryPoint: 'index.ts',
    tag: 'BASICS',
    isExternalModule: false,
  },
  {
    id: 'devprotocol:clubs:simple-memberships',
    name: 'memberships',
    entryPoint: 'index.ts',
    tag: 'BASICS',
    isExternalModule: false,
  },
  {
    id: 'devprotocol:clubs:gated-contact-form',
    name: 'message',
    entryPoint: 'index.ts',
    tag: 'BASICS',
    isExternalModule: false,
  },
  {
    id: 'devprotocol:clubs:plugin:quests',
    name: 'quests',
    entryPoint: 'index.ts',
    tag: 'BASICS',
    isExternalModule: false,
  },
]
