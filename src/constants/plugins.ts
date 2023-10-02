import type {
  ClubsConfiguration,
  ClubsFunctionPlugin,
  ClubsNavigationLink,
  ClubsPluginMeta,
  ClubsPluginOptions,
  ClubsThemePluginMeta,
} from '@devprotocol/clubs-core'
import { v5 as uuidv5 } from 'uuid'

import $1 from '@plugins/default-theme'
import $2 from '@plugins/buy'
import $3 from '@plugins/community'
import $4 from '@plugins/pay-by-card'
import $5 from '@plugins/home'
import $6 from '@plugins/join'
import $7 from '@plugins/me'
import $8 from '@plugins/members'
import $9 from '@plugins/nft'
import $10 from '@plugins/perks'
import $11 from '@plugins/quests'
import $12 from '@plugins/message'
import $13 from '@plugins/memberships'
import $14 from '@kazu80/clubs-plugin-links'
import $15 from '@plugins/join-legacy'
import $16 from '@plugins/clubs-payments'
import $17 from '@plugins/tickets'
import $18 from '@plugins/collections'

import * as PostsPlugin from '@devprotocol/clubs-plugin-posts'

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
  | 'Community'

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
  'Community',
  'Utility',
]

export type InstallablePlugins = {
  id: string
  tag: PluginTag
  developer?: string
  clubsUrl?: string
  repositoryUrl?: string
  pluginOptions:
    | ((config: ClubsConfiguration) => ClubsPluginOptions)
    | ClubsPluginOptions
  navigationLinks?: ClubsNavigationLink[]
  planned?: ClubsFunctionPlugin
  require?: {
    invitation?: boolean
  }
}

export type PaidBundledItem = {
  id: string
}

export type PluginMeta = (ClubsPluginMeta & Partial<ClubsThemePluginMeta>) &
  InstallablePlugins & {
    added: boolean
    subscriptionNeeded: boolean
  }

export type ExternalTool = {
  name: string
  imageSrc: string
  description: string
  url: string
}

export const installablePlugins: InstallablePlugins[] = [
  {
    id: $16.meta.id,
    tag: 'New & Upcoming',
    developer: 'Dev Protocol',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
    pluginOptions: [],
    require: {
      invitation: true,
    },
  },
  {
    id: $4.meta.id,
    tag: 'New & Upcoming',
    developer: 'Dev Protocol',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
    pluginOptions: [],
  },
  {
    id: $17.meta.id,
    tag: 'New & Upcoming',
    developer: 'Dev Protocol',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
    pluginOptions: [],
    require: {
      invitation: true,
    },
  },
  {
    id: $14.meta.id,
    tag: 'Widgets',
    pluginOptions: [],
    developer: 'kazu80',
    repositoryUrl: 'https://github.com/kazu80/clubs-links',
  },
  {
    id: PostsPlugin.meta.id,
    tag: 'New & Upcoming',
    pluginOptions: (config) => [
      {
        key: 'feeds',
        value: [
          {
            id: 'default',
            database: {
              type: 'encoded:redis',
              key: `${PostsPlugin.meta.id}::${uuidv5(
                'default',
                uuidv5(config.url, uuidv5.URL),
              )}`,
            },
          },
        ],
      },
    ],
    navigationLinks: [{ display: 'Posts', path: '/posts' }],
    developer: 'Dev Protocol',
    repositoryUrl: 'https://github.com/dev-protocol/clubs-plugin-posts',
  },
  {
    id: 'devprotocol:clubs:simple-memberships',
    tag: 'Memberships',
    developer: 'Dev Protocol',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
    pluginOptions: [],
  },
  {
    id: 'devprotocol:clubs:plugin:join',
    tag: 'Memberships',
    developer: 'Dev Protocol',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
    pluginOptions: [],
  },
  {
    id: 'devprotocol:clubs:gated-contact-form',
    tag: 'Messaging',
    developer: 'Dev Protocol',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
    pluginOptions: [],
  },
  {
    id: 'devprotocol:clubs:plugin:me',
    tag: 'Utility',
    developer: 'Dev Protocol',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
    pluginOptions: [],
  },
  {
    id: 'devprotocol:clubs:plugin:members',
    tag: 'Utility',
    developer: 'Dev Protocol',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
    pluginOptions: [],
  },
  {
    id: 'devprotocol:clubs:plugin:community',
    tag: 'Community',
    developer: 'Dev Protocol',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
    pluginOptions: [],
  },
  {
    id: 'devprotocol:clubs:theme-1',
    tag: 'Theme',
    developer: 'Dev Protocol',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
    pluginOptions: [],
  },
  {
    id: 'devprotocol:clubs:plugin:quests',
    tag: 'Community',
    developer: 'Dev Protocol',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
    pluginOptions: [],
  },
  {
    id: 'devprotocol:clubs:collections',
    tag: 'Commerce & Business',
    developer: 'Dev Protocol',
    repositoryUrl: 'https://github.com/dev-protocol/clubsx',
    pluginOptions: [],
    navigationLinks: [{ display: 'Collections', path: '/collections' }],
  },
]

export const plugins = [
  $1,
  $2,
  $3,
  $4,
  $5,
  $6,
  $7,
  $8,
  $9,
  $10,
  $11,
  $12,
  $13,
  $14,
  $15,
  $16,
  $17,
  $18,
  PostsPlugin,
]

export const paidBundledItems: PaidBundledItem[] = [
  {
    id: $16.meta.id,
  },
  {
    id: $17.meta.id,
  },
]
