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
        name: 'buy',
        path: './plugins/buy/index.astro',
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
        name: 'buy',
        path: './plugins/buy/index.astro',
        enable: true,
        options: [],
      },
    ],
  }),
}
