import type {
  ClubsFunctionPlugin,
  ClubsPluginMeta,
  ClubsPluginOptions,
  ClubsThemePluginMeta,
} from '@devprotocol/clubs-core'
import Feeds from '@assets/Plugins/Feeds.svg'

export type PluginTag =
  | 'New & Upcoming'
  | 'Memberships'
  | 'Commerce & Business'
  | 'Messaging'
  | 'Finance & Payments'
  | 'Governance'
  | 'Crowdfunding'
  | 'Theme'
  | 'Widgets'
  | 'Analytics'
  | 'Utility'
  | 'Social'

export const allTags: PluginTag[] = [
  'New & Upcoming',
  'Theme',
  'Memberships',
  'Governance',
  'Crowdfunding',
  'Messaging',
  'Widgets',
  'Commerce & Business',
  'Finance & Payments',
  'Analytics',
  'Social',
  'Utility',
]

export type InstallablePlugins = {
  id: string
  name?: string
  configName?: string
  isExternalModule?: boolean
  entryPoint?: string // File name representing main entry point of plugin config.
  tag: PluginTag
  moduleNameForImport?: string
  developer?: string
  clubsUrl?: string
  repositoryUrl?: string
  pluginOptions: ClubsPluginOptions
  planned?: ClubsFunctionPlugin
}

export type PluginMeta = (ClubsPluginMeta & Partial<ClubsThemePluginMeta>) & {
  added: boolean
  tag: PluginTag
  developer?: string
  repositoryUrl?: string
  clubsUrl?: string
  planned: boolean
}

export const installablePlugins: InstallablePlugins[] = [
  {
    id: 'upcoming:feeds',
    tag: 'New & Upcoming',
    pluginOptions: [],
    planned: {
      meta: {
        id: '#',
        category: '',
        displayName: 'Posts',
        icon: Feeds,
        description:
          'Extendable Post Timeline for DAO. Token-gated posts by membership, or public posts, and communication with comments and emoji reaction. And, it has an extendable nature for new features such as voting, bounty posts, video/music posts.',
      },
    },
  },
  {
    id: 'upcoming:governance-templetes',
    tag: 'New & Upcoming',
    pluginOptions: [],
    planned: {
      meta: {
        id: '#',
        category: '',
        displayName: 'Governance Templetes',
        description:
          'Simplifying Governance Complexity. Based on the premise of stakeholder analysis, envisaged appropriate behavior, and fiduciary responsibilities, governance templates arrive at rules around representation and incentivization for a fair representation of interests at stake in your Club.',
      },
    },
  },
  {
    id: 'devprotocol:clubs:simple-memberships',
    name: 'memberships',
    entryPoint: 'index.ts',
    tag: 'Memberships',
    isExternalModule: false,
    moduleNameForImport: 'memberships',
    configName: 'memberships',
    developer: 'Dev Protocol',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
    pluginOptions: [],
  },
  {
    id: 'devprotocol:clubs:plugin:join',
    name: 'join',
    entryPoint: 'index.ts',
    tag: 'Memberships',
    isExternalModule: false,
    moduleNameForImport: 'join',
    configName: 'join',
    developer: 'Dev Protocol',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
    pluginOptions: [],
  },
  {
    id: 'devprotocol:clubs:gated-contact-form',
    name: 'message',
    entryPoint: 'index.ts',
    tag: 'Messaging',
    isExternalModule: false,
    moduleNameForImport: 'message',
    configName: 'message',
    developer: 'Dev Protocol',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
    pluginOptions: [],
  },
  {
    id: 'devprotocol:clubs:plugin:me',
    name: 'me',
    entryPoint: 'index.ts',
    tag: 'Utility',
    isExternalModule: false,
    moduleNameForImport: 'me',
    configName: 'me',
    developer: 'Dev Protocol',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
    pluginOptions: [],
  },
  {
    id: 'devprotocol:clubs:plugin:members',
    name: 'members',
    entryPoint: 'index.ts',
    tag: 'Utility',
    isExternalModule: false,
    moduleNameForImport: 'members',
    configName: 'members',
    developer: 'Dev Protocol',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
    pluginOptions: [],
  },
  {
    id: 'devprotocol:clubs:plugin:community',
    name: 'community',
    entryPoint: 'index.ts',
    tag: 'Social',
    isExternalModule: false,
    moduleNameForImport: 'community',
    configName: 'community',
    developer: 'Dev Protocol',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
    pluginOptions: [],
  },
  {
    id: 'devprotocol:clubs:theme-1',
    name: 'default-theme',
    entryPoint: 'index.ts',
    tag: 'Theme',
    isExternalModule: false,
    moduleNameForImport: 'default-theme',
    configName: 'defaultTheme',
    developer: 'Dev Protocol',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
    pluginOptions: [],
  },
  {
    id: 'devprotocol:clubs:plugin:quests',
    name: 'quests',
    entryPoint: 'index.ts',
    tag: 'Social',
    isExternalModule: false,
    moduleNameForImport: 'quests',
    configName: 'quests',
    developer: 'Dev Protocol',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
    pluginOptions: [],
  },
]
