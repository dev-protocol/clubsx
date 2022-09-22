import dotenv from 'dotenv'
import { encode } from '@devprotocol/clubs-core/encode'
import { createClient } from 'redis'

dotenv.config()

const products = [
  {
    id: '1',
    name: 'Name',
    priceEth: 0.3,
    priceUsd: 10_000,
    description:
      'Get the full lineup of our Basic Tees. Have a fresh shirt all week, and an extra for laundry day.',
    left: '32',
    payload:
      'https://bafybeib745w7vjcsh37mepaluvbmqrbjq4gax46oirkmrjeqeh55gjiyzi.ipfs.nftstorage.link/',
    imageAlt:
      'Eight shirts arranged on table in black, olive, grey, blue, white, red, mustard, and green.',
  },
  {
    id: '2',
    name: 'Name',
    priceEth: 0.3,
    priceUsd: 10_000,
    left: '32',
    payload:
      'https://bafybeic3d2otapykfdp3ktqbdonn4ylrove5ccs5vv2udydwbgudstrcwu.ipfs.nftstorage.link/',
    imageAlt: 'Front of plain black t-shirt.',
  },
  {
    id: '3',
    name: 'Name',
    priceEth: 0.3,
    priceUsd: 10_000,
    left: '32',
    payload:
      'https://bafybeiagvn4exdbwokm4g6t6a2s3xvl2fu7zutvlf6sgwd4fjrdrc23hsu.ipfs.nftstorage.link/',
    imageAlt: 'Front of plain black t-shirt.',
  },
  {
    id: '4',
    name: 'Name',
    priceEth: 0.3,
    priceUsd: 10_000,
    left: '32',
    payload:
      'https://bafybeiav46h6zegh4e7zfdcgk6xjpg6if2kdxtvp3ejtyicvpgc2iucpim.ipfs.nftstorage.link/',
    imageAlt: 'Front of plain black t-shirt.',
  },
  {
    id: '5',
    name: 'Name',
    priceEth: 0.3,
    priceUsd: 10_000,
    left: '32',
    payload:
      'https://bafybeib745w7vjcsh37mepaluvbmqrbjq4gax46oirkmrjeqeh55gjiyzi.ipfs.nftstorage.link/',
    imageAlt:
      'Eight shirts arranged on table in black, olive, grey, blue, white, red, mustard, and green.',
  },
  {
    id: '6',
    name: 'Name',
    priceEth: 0.3,
    priceUsd: 10_000,
    left: '32',
    payload:
      'https://bafybeiagvn4exdbwokm4g6t6a2s3xvl2fu7zutvlf6sgwd4fjrdrc23hsu.ipfs.nftstorage.link/',
    imageAlt: 'Front of plain black t-shirt.',
  },

  // More products...
]

const tiers = [
  {
    title: 'Tier 3',
    id: 'tier-3',
    amount: 400,
    currency: 'dev',
    badgeImageDescription: `"Yasuragi dan Renge (a Buddhist altar, lotus)" embossed gilt lacquer work with inlaid mother-of-pearl`,
  },
  {
    title: 'Tier 2',
    id: 'tier-2',
    amount: 4000,
    currency: 'dev',
    badgeImageDescription: `"Yasuragi dan Koki (a Buddhist altar, brightness)" embossed gilt lacquer work`,
  },
  {
    title: 'Tier 1',
    id: 'tier-1',
    amount: 10000,
    currency: 'dev',
    badgeImageDescription: `Sojiij Head Monastry : Nioh statue (statues of the two Deva kings)`,
  },
  {
    title: 'Super',
    id: 'super',
    amount: 15000,
    currency: 'dev',
    badgeImageDescription: `Gokokuji= Head Monastry : Nyoirin Kannon statue (Cintāmaṇicakra statue)`,
  },
]

const perks = [
  {
    tier: 'tier-3',
    descriptions: [
      {
        lang: 'en_US',
        description: `A privilege to enjoy shopping low price products at members-limited EC sites, supporters-only information such as private YouTube videos`,
      },
      {
        lang: 'ja_JP',
        description: `限定ECサイト（低額商品）での購入権、非公開YouTube動画などサポーター限定の情報`,
      },
    ],
  },
  {
    tier: 'tier-2',
    descriptions: [
      {
        lang: 'en_US',
        description: `Tier 3 + a privilege to join auctions, a privilege to purchase luxurious items, etc.`,
      },
      {
        lang: 'en_US',
        description: `(Online Perks)`,
      },
      {
        lang: 'ja_JP',
        description: `Tier3₊オークションへの参加権、特級品の購入権など`,
      },
      {
        lang: 'ja_JP',
        description: `（オンラインでの特典）`,
      },
    ],
  },
  {
    tier: 'tier-1',
    descriptions: [
      {
        lang: 'en_US',
        description: `Tier 2 + a privilege to visit a special place (only once in every six months)`,
      },
      {
        lang: 'ja_JP',
        description: `Tier2+ 特別な場所を訪れることができる権利（半年1回まで）（物理的な体験を含む特典）`,
      },
    ],
  },
  {
    tier: 'super',
    descriptions: [
      {
        lang: 'en_US',
        description: `Tier 1 + a privilege for ordering custom-made products`,
      },
      {
        lang: 'ja_JP',
        description: `Tier1+ オーダーメード権利`,
      },
    ],
  },
]

const memberships = [
  {
    id: 'tier-3',
    name: 'Tier 3',
    description: undefined,
    price: 400,
    currency: 'DEV',
    imageSrc: '',
    payload: new Uint8Array(),
    fee: undefined,
  },
  {
    id: 'tier-2',
    name: 'Tier 2',
    description: undefined,
    price: 4000,
    currency: 'DEV',
    imageSrc: '',
    payload: new Uint8Array(),
    fee: undefined,
  },
  {
    id: 'tier-1',
    name: 'Tier 1',
    description: undefined,
    price: 10000,
    currency: 'DEV',
    imageSrc: '',
    payload: new Uint8Array(),
    fee: undefined,
  },
  {
    id: 'super',
    name: 'Super',
    description: undefined,
    price: 15000,
    currency: 'DEV',
    imageSrc: '',
    payload: new Uint8Array(),
    fee: undefined,
  },
]

const guild = {
  key: 'guildUrl',
  value: 'https://guild.xyz/temples-dao',
}

const populate = async () => {
  try {
    const client = createClient({
      url: process.env.REDIS_URL,
      username: process.env.REDIS_USERNAME ?? '',
      password: process.env.REDIS_PASSWORD ?? '',
    })
    await client.connect()

    await client.set(
      'temples',
      encode({
        name: 'TemplesDAO',
        twitterHandle: '@templesdao',
        description: 'DAO that makes the next 1000 years',
        url: 'https://temples.clubs.stakes.social',
        propertyAddress: '0x541f7914ed2a4a8b477edc711fa349a77983f3ad',
        adminRolePoints: 0,
        plugins: [
          {
            name: 'admin',
            enable: true,
            options: [],
          },
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
            name: 'message',
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
          {
            name: 'community',
            enable: true,
            options: [guild],
          },
          {
            name: 'memberships',
            enable: true,
            options: [memberships],
          },
        ],
      })
    )

    await client.set(
      'kogenji',
      encode({
        name: 'Kogenji',
        twitterHandle: '@templesdao',
        description: '',
        url: 'https://kogenji.clubs.stakes.social',
        propertyAddress: '0x541f7914ed2a4a8b477edc711fa349a77983f3ad',
        adminRolePoints: 0,
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
                value: Object.assign({}, products),
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
      })
    )

    console.log('Tenants set')
    return
  } catch (error) {
    console.error('error populating tenants: ', error)
  }
}

populate()
