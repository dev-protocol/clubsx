import type {
  ClubsPluginMeta,
  ClubsThemePluginMeta,
} from '@devprotocol/clubs-core'

export type InstallablePlugins = {
  id: string
  name: string
  configName: string
  isExternalModule: boolean
  entryPoint: string // File name representing main entry point of plugin config.
  tag: 'NEW & UPCOMING' | 'THEME' | 'BASICS'
  moduleNameForImport: string
  developer: string
  clubsUrl: string
  repositoryUrl: string
}

export type PluginMeta = (ClubsPluginMeta & Partial<ClubsThemePluginMeta>) & {
  added: boolean
  tag: 'NEW & UPCOMING' | 'THEME' | 'BASICS'
  developer: string
  repositoryUrl: string
  clubsUrl: string
}

export const installablePlugins: InstallablePlugins[] = [
  {
    id: 'devprotocol:clubs:plugin:community',
    name: 'community',
    entryPoint: 'index.ts',
    tag: 'NEW & UPCOMING',
    isExternalModule: false,
    moduleNameForImport: 'community',
    configName: 'community',
    developer: 'Dev Protocol',
    clubsUrl: 'https://clubs.place',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
  },
  {
    id: 'devprotocol:clubs:theme-1',
    name: 'default-theme',
    entryPoint: 'index.ts',
    tag: 'THEME',
    isExternalModule: false,
    moduleNameForImport: 'default-theme',
    configName: 'defaultTheme',
    developer: 'Dev Protocol',
    clubsUrl: 'https://clubs.place',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
  },
  {
    id: 'devprotocol:clubs:plugin:join',
    name: 'join',
    entryPoint: 'index.ts',
    tag: 'BASICS',
    isExternalModule: false,
    moduleNameForImport: 'join',
    configName: 'join',
    developer: 'Dev Protocol',
    clubsUrl: 'https://clubs.place',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
  },
  {
    id: 'devprotocol:clubs:plugin:me',
    name: 'me',
    entryPoint: 'index.ts',
    tag: 'NEW & UPCOMING',
    isExternalModule: false,
    moduleNameForImport: 'me',
    configName: 'me',
    developer: 'Dev Protocol',
    clubsUrl: 'https://clubs.place',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
  },
  {
    id: 'devprotocol:clubs:plugin:members',
    name: 'members',
    entryPoint: 'index.ts',
    tag: 'BASICS',
    isExternalModule: false,
    moduleNameForImport: 'members',
    configName: 'members',
    developer: 'Dev Protocol',
    clubsUrl: 'https://clubs.place',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
  },
  {
    id: 'devprotocol:clubs:simple-memberships',
    name: 'memberships',
    entryPoint: 'index.ts',
    tag: 'BASICS',
    isExternalModule: false,
    moduleNameForImport: 'memberships',
    configName: 'memberships',
    developer: 'Dev Protocol',
    clubsUrl: 'https://clubs.place',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
  },
  {
    id: 'devprotocol:clubs:gated-contact-form',
    name: 'message',
    entryPoint: 'index.ts',
    tag: 'BASICS',
    isExternalModule: false,
    moduleNameForImport: 'message',
    configName: 'message',
    developer: 'Dev Protocol',
    clubsUrl: 'https://clubs.place',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
  },
  {
    id: 'devprotocol:clubs:plugin:quests',
    name: 'quests',
    entryPoint: 'index.ts',
    tag: 'BASICS',
    isExternalModule: false,
    moduleNameForImport: 'quests',
    configName: 'quests',
    developer: 'Dev Protocol',
    clubsUrl: 'https://clubs.place',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
  },
]
