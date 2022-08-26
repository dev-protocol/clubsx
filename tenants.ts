import { encode } from '@devprotocol/clubs-core'
import { products } from '@constants/products'
import { tiers } from '@constants/tier'
import { perks } from '@constants/perks'

export default {
  temples: encode({
    name: 'TemplesDAO',
    twitterHandle: '@templesdao',
    description: 'DAO that makes the next 1000 years',
    url: 'https://temples.clubs.stakes.social',
    propertyAddress: '0x541f7914ed2a4a8b477edc711fa349a77983f3ad',
    plugins: [
      {
        name: 'home',
        enable: true,
        options: [
          {
            key: 'tiers',
            value: tiers,
          },
        ],
      },
      {
        name: 'fiat',
        enable: true,
        options: [],
      },
      {
        name: 'join',
        enable: true,
        options: [
          {
            key: 'tiers',
            value: tiers,
          },
        ],
      },
      {
        name: 'me',
        enable: true,
        options: [],
      },
      {
        name: 'members',
        enable: true,
        options: [],
      },
      {
        name: 'perks',
        enable: true,
        options: [
          {
            key: 'perks',
            value: perks,
          },
        ],
      },
      {
        name: 'quests',
        enable: true,
        options: [],
      },
    ],
  }),
  kogenji: encode({
    name: 'Kogenji',
    twitterHandle: '@templesdao',
    description: '',
    url: 'https://kogenji.clubs.stakes.social',
    propertyAddress: '0x541f7914ed2a4a8b477edc711fa349a77983f3ad',
    plugins: [
      {
        name: 'home',
        enable: true,
        options: [],
      },
      {
        name: 'buy',
        enable: true,
        options: [
          {
            key: 'products',
            value: products,
          },
        ],
      },
      {
        name: 'fiat',
        enable: true,
        options: [],
      },
      {
        name: 'join',
        enable: true,
        options: [],
      },
      {
        name: 'me',
        enable: true,
        options: [],
      },
      {
        name: 'members',
        enable: true,
        options: [],
      },
      {
        name: 'nft',
        enable: true,
        options: [
          {
            key: 'products',
            value: products,
          },
        ],
      },
      {
        name: 'perks',
        enable: true,
        options: [
          {
            key: 'perks',
            value: perks,
          },
        ],
      },
      {
        name: 'quests',
        enable: true,
        options: [],
      },
    ],
  }),
}
