import { encode } from '@devprotocol/clubs-core'
import { toBytes32 } from './utils/toBytes32.mjs'
import { db } from './utils/db.mjs'
import { whenCalledDirectly } from './utils/whenCalledDirectly.mjs'

const KEY = 'kougenji'

const kougenjiProducts = [
  {
    id: '1',
    name: 'Kougenji Celestial Maiden #1',
    description: `光源寺に特別参拝でき、修復後の天女のNFTを受け取ることができます.
    Holders of this NFT are invited to a special visit at Kougenji, and can receive the restored celestial maiden NFT.`,
    price: 0.6,
    currency: 'ETH',
    imageSrc:
      'https://bafybeifmshinu5cjv5gddsburhwmwaut2awoxkl4bsmhzqwxsl7pgx5bbi.ipfs.nftstorage.link/',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('Kougenji Celestial Maiden #1'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x2d69c991782ac67218dc0167af6f7c91498587c1',
    },
  },
  {
    id: '2',
    name: 'Kougenji Celestial Maiden #2',
    description: `修復後の天女のNFTを受け取ることができます.
    Holders of this NFT can receive restored celestial maiden NFT.`,
    price: 0.5,
    currency: 'ETH',
    imageSrc:
      'https://bafybeifmshinu5cjv5gddsburhwmwaut2awoxkl4bsmhzqwxsl7pgx5bbi.ipfs.nftstorage.link/',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('Kougenji Celestial Maiden #2'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x2d69c991782ac67218dc0167af6f7c91498587c1',
    },
  },
  {
    id: '3',
    name: 'Kougenji Celestial Maiden #3',
    description: `光源寺ご住職による水晶ブレスレットを受け取ることができます（日本国内のみ）.
    Holders of this NFT can receive a crystal bracelet made by the chief priest of Kougenji.`,
    price: 0.4,
    currency: 'ETH',
    imageSrc:
      'https://bafybeifmshinu5cjv5gddsburhwmwaut2awoxkl4bsmhzqwxsl7pgx5bbi.ipfs.nftstorage.link/',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('Kougenji Celestial Maiden #3'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x2d69c991782ac67218dc0167af6f7c91498587c1',
    },
  },
  {
    id: '4',
    name: 'Kougenji Flower #1',
    description: `天井絵シリーズを3枚集めた方はオンラインでの読経、5枚集めた方は光源寺での読経に参加できます。
    If you collect 3 flower NFTs, you can join an online sutra chanting. If you collect 5 flower NFTs, you can join a sutra chanting event at Kougenji.`,
    price: 0.06,
    currency: 'ETH',
    imageSrc:
      'https://bafybeidfjmpcx44mpovv4vlozzmvfj42axgnqrl6veda72hocfa5ajmaye.ipfs.nftstorage.link/',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('Kougenji Flower #1'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x2d69c991782ac67218dc0167af6f7c91498587c1',
    },
  },
  {
    id: '5',
    name: 'Kougenji Flower #2',
    description: `天井絵シリーズを3枚集めた方はオンラインでの読経、5枚集めた方は光源寺での読経に参加できます。
    If you collect 3 flower NFTs, you can join an online sutra chanting. If you collect 5 flower NFTs, you can join a sutra chanting event at Kougenji.`,
    price: 0.06,
    currency: 'ETH',
    imageSrc:
      'https://bafybeibbzgcfmvgpj64j5msdtdtmnis7unfgy3ir2biyymhbmlzy3mvupm.ipfs.nftstorage.link/',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('Kougenji Flower #2'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x2d69c991782ac67218dc0167af6f7c91498587c1',
    },
  },
  {
    id: '6',
    name: 'Kougenji Flower #3',
    description: `天井絵シリーズを3枚集めた方はオンラインでの読経、5枚集めた方は光源寺での読経に参加できます。
    If you collect 3 flower NFTs, you can join an online sutra chanting. If you collect 5 flower NFTs, you can join a sutra chanting event at Kougenji.`,
    price: 0.06,
    currency: 'ETH',
    imageSrc:
      'https://bafybeibpzdt6zs3bwbox74fd6weodc6fmsu56omt6yldal6pz55s2ws7aa.ipfs.nftstorage.link/',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('Kougenji Flower #3'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x2d69c991782ac67218dc0167af6f7c91498587c1',
    },
  },
  {
    id: '7',
    name: 'Kougenji Flower #4',
    description: `天井絵シリーズを3枚集めた方はオンラインでの読経、5枚集めた方は光源寺での読経に参加できます。
    If you collect 3 flower NFTs, you can join an online sutra chanting. If you collect 5 flower NFTs, you can join a sutra chanting event at Kougenji.`,
    price: 0.06,
    currency: 'ETH',
    imageSrc:
      'https://bafybeifliopehpndnbg3wafphf3anrwaosjpgg5myjx23p3osf7efsjaum.ipfs.nftstorage.link/',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('Kougenji Flower #4'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x2d69c991782ac67218dc0167af6f7c91498587c1',
    },
  },
  {
    id: '8',
    name: 'Kougenji Flower #5',
    description: `天井絵シリーズを3枚集めた方はオンラインでの読経、5枚集めた方は光源寺での読経に参加できます。
    If you collect 3 flower NFTs, you can join an online sutra chanting. If you collect 5 flower NFTs, you can join a sutra chanting event at Kougenji.`,
    price: 0.06,
    currency: 'ETH',
    imageSrc:
      'https://bafybeidbqxysseou3va5rgxzykesoclt7s5vjsju74ihnyihjshz4enjpq.ipfs.nftstorage.link/',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('Kougenji Flower #5'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x2d69c991782ac67218dc0167af6f7c91498587c1',
    },
  },
  {
    id: '9',
    name: 'Kougenji Flower #6',
    description: `天井絵シリーズを3枚集めた方はオンラインでの読経、5枚集めた方は光源寺での読経に参加できます。
    If you collect 3 flower NFTs, you can join an online sutra chanting. If you collect 5 flower NFTs, you can join a sutra chanting event at Kougenji.`,
    price: 0.06,
    currency: 'ETH',
    imageSrc:
      'https://bafybeigpdw6tcb72wkmjayeco7ckummtashcr2m7jhdcnq6b2uyvqebrvi.ipfs.nftstorage.link/',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('Kougenji Flower #6'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x2d69c991782ac67218dc0167af6f7c91498587c1',
    },
  },
  {
    id: '10',
    name: 'Kougenji Flower #7',
    description: `天井絵シリーズを3枚集めた方はオンラインでの読経、5枚集めた方は光源寺での読経に参加できます。
    If you collect 3 flower NFTs, you can join an online sutra chanting. If you collect 5 flower NFTs, you can join a sutra chanting event at Kougenji.`,
    price: 0.06,
    currency: 'ETH',
    imageSrc:
      'https://bafybeigd4e5waigihewlkyzcvv4zkhf6gxx63wrklhp23hsmhgc3wptkum.ipfs.nftstorage.link/',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('Kougenji Flower #7'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x2d69c991782ac67218dc0167af6f7c91498587c1',
    },
  },
  {
    id: '11',
    name: 'Kougenji Flower #8',
    description: `天井絵シリーズを3枚集めた方はオンラインでの読経、5枚集めた方は光源寺での読経に参加できます。
    If you collect 3 flower NFTs, you can join an online sutra chanting. If you collect 5 flower NFTs, you can join a sutra chanting event at Kougenji.`,
    price: 0.06,
    currency: 'ETH',
    imageSrc:
      'https://bafybeifqremnvait2bzpwx2g3biwy5uaghfxrlqivouyirc7b2pbwqj2iy.ipfs.nftstorage.link/',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('Kougenji Flower #8'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x2d69c991782ac67218dc0167af6f7c91498587c1',
    },
  },
  {
    id: '12',
    name: 'Kougenji DAO',
    description: `御住職によるオンライン法話やお話し会に参加できます（2,3ヶ月に1回開催予定）.
    Holders of this NFT are allowed to join online preach or round-table talk by the head priest (to be scheduled once in a few months).`,
    price: 0.09,
    currency: 'ETH',
    imageSrc:
      'https://bafybeifq5zh2rpnw5meyrjcyekyjfps5tsvfv5f62zjiqiahvut6w2btc4.ipfs.nftstorage.link/',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('Kougenji DAO'),
    fee: {
      percentage: 0.5,
      beneficiary: '0x2d69c991782ac67218dc0167af6f7c91498587c1',
    },
  },
]

const populate = async (client) => {
  await client.set(
    KEY,
    encode({
      name: 'Kougenji',
      twitterHandle: '@templesdao',
      description: '',
      url: 'https://kougenji.clubs.place',
      propertyAddress: '0x23d67953FE2e61e9fAc78447526D9358cD05d40d', // Polygon: 0x23d67953FE2e61e9fAc78447526D9358cD05d40d // Mumbai: 0x70a8B9a4B2d407a542c205adBbEA38289c3285eB
      chainId: 137, // Polygon: 137 // Mumbai: 80001
      rpcUrl:
        'https://polygon-mainnet.infura.io/v3/fa1acbd68f5c4484b1082e1cf876b920', // Polygon: https://polygon-mainnet.infura.io/v3/fa1acbd68f5c4484b1082e1cf876b920 // Mumbai: https://polygon-mumbai.infura.io/v3/fa1acbd68f5c4484b1082e1cf876b920
      adminRolePoints: 0,
      options: [
        {
          key: 'ogp',
          value: { image: 'https://i.imgur.com/I6Yr0V7.jpg' },
        },
        {
          key: 'navigationLinks',
          value: [
            // {
            //   display: 'ETH での支援',
            //   path: '/nft',
            // },
            {
              display: '特典について',
              path: 'https://sites.google.com/view/kougenjidao/%E3%83%9B%E3%83%BC%E3%83%A0/%E3%81%94%E6%94%AF%E6%8F%B4%E3%81%AE%E7%89%B9%E5%85%B8',
            },
            {
              display: '光源寺 DAO への参加',
              path: 'https://guild.xyz/temples-dao',
            },
          ],
        },
        {
          key: 'footerLinks',
          value: [
            {
              display: 'About',
              path: 'https://sites.google.com/view/kougenjidao',
            },
            {
              display: 'Terms & Conditions',
              path: 'https://kougenjidao.notion.site/5558b9a7d5b74453a2cf8c3640f63b5a',
            },
            {
              display: 'Privacy Policy',
              path: 'https://kougenjidao.notion.site/1d8d0410286443d4b7742549960eb588',
            },
            {
              display: 'Act on specified commercial transactions',
              path: 'https://kougenjidao.notion.site/edd00237c45c4f01a006ad17264e676e',
            },
          ],
        },
        {
          key: 'avatarImgSrc',
          value: 'https://i.imgur.com/453nyAX.jpg',
        },
      ],
      plugins: [
        {
          id: 'devprotocol:clubs:plugin:pay-by-card',
          name: 'fiat',
          enable: false,
          options: [
            {
              key: 'products',
              value: kougenjiProducts, // Polygon: kougenjiProducts // Mumbai: kougenjiProductsMumbai
            },
            {
              key: 'priceOverrides',
              value: [
                {
                  id: '1',
                  price: 100_000,
                  currency: 'YEN',
                  purchaseLink: 'https://buy.stripe.com/4gw14A6Jh1LEaZicMP',
                },
                {
                  id: '2',
                  price: 80_000,
                  currency: 'YEN',
                  purchaseLink: 'https://buy.stripe.com/fZebJe8RpfCu1oI8wA',
                },
                {
                  id: '3',
                  price: 70_000,
                  currency: 'YEN',
                  purchaseLink: 'https://buy.stripe.com/00g4gM2t1dumaZifZ3',
                },
                {
                  id: '4',
                  price: 10_000,
                  currency: 'YEN',
                  purchaseLink: 'https://buy.stripe.com/eVabJe9VtgGyd7q006',
                },
                {
                  id: '5',
                  price: 10_000,
                  currency: 'YEN',
                  purchaseLink: 'https://buy.stripe.com/eVabJe5Fd3TMc3m5kr',
                },
                {
                  id: '6',
                  price: 10_000,
                  currency: 'YEN',
                  purchaseLink: 'https://buy.stripe.com/eVa14A5Fdbmed7q7sA',
                },
                {
                  id: '7',
                  price: 10_000,
                  currency: 'YEN',
                  purchaseLink: 'https://buy.stripe.com/3cs3cI4B99e6d7q6ox',
                },
                {
                  id: '8',
                  price: 10_000,
                  currency: 'YEN',
                  purchaseLink: 'https://buy.stripe.com/eVadRmc3B0HA3wQ4gq',
                },
                {
                  id: '9',
                  price: 10_000,
                  currency: 'YEN',
                  purchaseLink: 'https://buy.stripe.com/cN2dRmffN2PI8Ra28j',
                },
                {
                  id: '10',
                  price: 10_000,
                  currency: 'YEN',
                  purchaseLink: 'https://buy.stripe.com/bIYbJeffN4XQ2sMaEQ',
                },
                {
                  id: '11',
                  price: 10_000,
                  currency: 'YEN',
                  purchaseLink: 'https://buy.stripe.com/8wM28E1oX1LE9Ve00d',
                },
              ],
            },
            {
              key: 'hero',
              value: {
                coverImgSrc: 'https://i.imgur.com/I6Yr0V7.jpg',
                title: '光源寺/ Kougenji',
                description: [
                  `光源寺の天女絵修復プロジェクトでのご支援金は、天女の表具欄間彩色修復等に使われます。支援者の方は光源寺のDiscordチャンネルに参加し、修復状況（写真等）を見ることができます。また、NFTの種類により様々な特典をご用意しております。`,
                  `The funds raised for Kougenji will be used to restore the celestial maiden paper picture frame on the decorative transom and other cultural assets within the temple. Supporters are allowed to join Kougenji's Discord channel for the latest news and updates about the restoration (photos, etc.). We also plan to provide a variety of perks according to the types of NFT you'll purchase.`,
                ],
              },
            },
            {
              key: 'title',
              value: undefined,
            },
            // {
            //   key: 'slug',
            //   value: [],
            // },
          ],
        },
        {
          id: 'devprotocol:clubs:plugin:me',
          name: 'me',
          enable: true,
          options: [],
        },
        {
          id: 'devprotocol:clubs:plugin:buy',
          name: 'buy',
          enable: true,
          options: [
            {
              key: 'products',
              value: kougenjiProducts, // Polygon: kougenjiProducts // Mumbai: kougenjiProductsMumbai
            },
          ],
        },
        {
          id: 'devprotocol:clubs:plugin:nft',
          name: 'nft',
          enable: true,
          options: [
            {
              key: 'products',
              value: kougenjiProducts, // Polygon: kougenjiProducts // Mumbai: kougenjiProductsMumbai
            },
            {
              key: 'coverImgSrc',
              value: 'https://i.imgur.com/I6Yr0V7.jpg',
            },
            {
              key: 'title',
              value: '光源寺/ Kougenji',
            },
            {
              key: 'description',
              value: [
                `光源寺の天女絵修復プロジェクトでのご支援金は、天女の表具欄間彩色修復等に使われます。支援者の方は光源寺のDiscordチャンネルに参加し、修復状況（写真等）を見ることができます。また、NFTの種類により様々な特典をご用意しております。`,
                `The funds raised for Kougenji will be used to restore the celestial maiden paper picture frame on the decorative transom and other cultural assets within the temple. Supporters are allowed to join Kougenji's Discord channel for the latest news and updates about the restoration (photos, etc.). We also plan to provide a variety of perks according to the types of NFT you'll purchase.`,
              ],
            },
            {
              key: 'slug',
              value: [],
            },
          ],
        },
        {
          id: 'devprotocol:clubs:gated-contact-form',
          name: 'message',
          enable: true,
          options: [],
        },
        {
          id: 'devprotocol:clubs:theme-1',
          name: 'defaultTheme',
          enable: true,
          options: [
            {
              key: 'globalConfig',
              value: {
                bg: 'rgba(29, 36, 38, 1)',
              },
            },
            {
              key: 'homeConfig',
              value: {
                hero: {
                  image: 'https://i.imgur.com/I6Yr0V7.jpg',
                },
                description: `The funds raised for Kougenji will be used to restore the celestial maiden paper picture frame on the decorative transom and other cultural assets within the temple. Supporters are allowed to join Kougenji's Discord channel for the latest news and updates about the restoration (photos, etc.). We also plan to provide a variety of perks according to the types of NFT you'll purchase.`,
              },
            },
          ],
        },
      ],
    }),
  )

  console.log('set', KEY)
}

whenCalledDirectly(async () => {
  const client = await db()
  await populate(client)
  await client.quit()
})

export default populate
