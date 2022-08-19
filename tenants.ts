import { encode } from '@devprotocol/clubs-core'

export default {
  temples: encode({
    id: 'temples',
    name: 'TemplesDAO',
    twitterHandle: '@templesdao',
    description: 'DAO that makes the next 1000 years',
    url: 'https://temples.clubs.stakes.social',
    propertyAddress: '0x541f7914ed2a4a8b477edc711fa349a77983f3ad',
    plugins: [
      {
        name: 'home',
        path: './src/plugins/home',
        enable: true,
        options: [],
      },
      {
        name: 'buy',
        path: './src/plugins/buy',
        enable: true,
        options: [],
      },
      {
        name: 'fiat',
        path: './src/plugins/fiat',
        enable: true,
        options: [],
      },
      {
        name: 'join',
        path: './src/plugins/join',
        enable: true,
        options: [],
      },
      {
        name: 'me',
        path: './src/plugins/me',
        enable: true,
        options: [],
      },
      {
        name: 'members',
        path: './src/plugins/members',
        enable: true,
        options: [],
      },
      {
        name: 'nft',
        path: './src/plugins/nft',
        enable: true,
        options: [],
      },
      {
        name: 'perks',
        path: './src/plugins/perks',
        enable: true,
        options: [],
      },
      {
        name: 'quests',
        path: './src/plugins/quests',
        enable: true,
        options: [],
      },
    ],
  }),
  kogenji: encode({
    id: 'kogenji',
    name: 'Kogenji',
    twitterHandle: '@templesdao',
    description: '',
    url: 'https://kogenji.clubs.stakes.social',
    propertyAddress: '0x541f7914ed2a4a8b477edc711fa349a77983f3ad',
    plugins: [
      {
        name: 'home',
        path: './src/plugins/home',
        enable: true,
        options: [],
      },
      {
        name: 'buy',
        path: './src/plugins/buy',
        enable: true,
        options: [],
      },
      {
        name: 'fiat',
        path: './src/plugins/fiat',
        enable: true,
        options: [],
      },
      {
        name: 'join',
        path: './src/plugins/join',
        enable: true,
        options: [],
      },
      {
        name: 'me',
        path: './src/plugins/me',
        enable: true,
        options: [],
      },
      {
        name: 'members',
        path: './src/plugins/members',
        enable: true,
        options: [],
      },
      {
        name: 'nft',
        path: './src/plugins/nft',
        enable: true,
        options: [],
      },
      {
        name: 'perks',
        path: './src/plugins/perks',
        enable: true,
        options: [],
      },
      {
        name: 'quests',
        path: './src/plugins/quests',
        enable: true,
        options: [],
      },
    ],
  }),
}
