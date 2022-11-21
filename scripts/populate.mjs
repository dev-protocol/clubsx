import dotenv from 'dotenv'
import { encode } from '@devprotocol/clubs-core/encode'
import { createClient } from 'redis'
import { utils } from 'ethers'

dotenv.config()

const toBytes32 = (str) => utils.keccak256(utils.toUtf8Bytes(str))

const products = [
  {
    id: '1',
    name: 'Kougenji Celestial Maiden #1',
    description: `光源寺に特別参拝でき、修復後の天女のNFTを受け取ることができます.
    Holders of this NFT are invited to a special visit at Kougenji, and can receive the restored celestial maiden NFT.`,
    price: 0.6,
    currency: 'ETH',
    imageSrc:
      'https://bafybeih5bq6rwg67cdtpyh5sx2th4f7u3bognjfcidawopnlp3ygfq7da4.ipfs.nftstorage.link/',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('Kougenji Celestial Maiden #1'),
    fee: {
      percentage: 95,
      beneficiary: '0x2d69c991782ac67218dc0167af6f7c91498587c1',
    },
  },
  {
    id: '2',
    name: 'Kougenji Celestial Maiden #2',
    description: `修復後の天女のNFTを受け取ることができます.
    Holders of this NFT can receive restored celestial maiden NFT.`,
    price: 0.45,
    currency: 'ETH',
    imageSrc:
      'https://bafybeih5bq6rwg67cdtpyh5sx2th4f7u3bognjfcidawopnlp3ygfq7da4.ipfs.nftstorage.link/',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('Kougenji Celestial Maiden #2'),
    fee: {
      percentage: 95,
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
      'https://bafybeih5bq6rwg67cdtpyh5sx2th4f7u3bognjfcidawopnlp3ygfq7da4.ipfs.nftstorage.link/',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('Kougenji Celestial Maiden #3'),
    fee: {
      percentage: 95,
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
      'https://bafybeih5bq6rwg67cdtpyh5sx2th4f7u3bognjfcidawopnlp3ygfq7da4.ipfs.nftstorage.link/',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('Kougenji Flower #1'),
    fee: {
      percentage: 95,
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
      'https://bafybeih5bq6rwg67cdtpyh5sx2th4f7u3bognjfcidawopnlp3ygfq7da4.ipfs.nftstorage.link/',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('Kougenji Flower #2'),
    fee: {
      percentage: 95,
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
      'https://bafybeih5bq6rwg67cdtpyh5sx2th4f7u3bognjfcidawopnlp3ygfq7da4.ipfs.nftstorage.link/',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('Kougenji Flower #3'),
    fee: {
      percentage: 95,
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
      'https://bafybeih5bq6rwg67cdtpyh5sx2th4f7u3bognjfcidawopnlp3ygfq7da4.ipfs.nftstorage.link/',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('Kougenji Flower #4'),
    fee: {
      percentage: 95,
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
      'https://bafybeih5bq6rwg67cdtpyh5sx2th4f7u3bognjfcidawopnlp3ygfq7da4.ipfs.nftstorage.link/',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('Kougenji Flower #5'),
    fee: {
      percentage: 95,
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
      'https://bafybeih5bq6rwg67cdtpyh5sx2th4f7u3bognjfcidawopnlp3ygfq7da4.ipfs.nftstorage.link/',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('Kougenji Flower #6'),
    fee: {
      percentage: 95,
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
      'https://bafybeih5bq6rwg67cdtpyh5sx2th4f7u3bognjfcidawopnlp3ygfq7da4.ipfs.nftstorage.link/',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('Kougenji Flower #7'),
    fee: {
      percentage: 95,
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
      'https://bafybeih5bq6rwg67cdtpyh5sx2th4f7u3bognjfcidawopnlp3ygfq7da4.ipfs.nftstorage.link/',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('Kougenji Flower #8'),
    fee: {
      percentage: 95,
      beneficiary: '0x2d69c991782ac67218dc0167af6f7c91498587c1',
    },
  },
  {
    id: '12',
    name: 'Kougenji DAO',
    description: `御住職によるオンライン法話やお話し会に参加できます（2,3ヶ月に1回開催予定）.
    Holders of this NFT are allowed to join online preach or round-table talk by the head priest (to be scheduled once in a few months).`,
    price: 0.085,
    currency: 'ETH',
    imageSrc:
      'https://bafybeih5bq6rwg67cdtpyh5sx2th4f7u3bognjfcidawopnlp3ygfq7da4.ipfs.nftstorage.link/',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('Kougenji DAO'),
    fee: {
      percentage: 50,
      beneficiary: '0x2d69c991782ac67218dc0167af6f7c91498587c1',
    },
  },
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

const templesHomeConfig = {
  hero: {
    image: '/src/assets/cover-1.jpg',
    text: 'Join the DAO that makes the next 1000 years',
  },
  whatWeDo: {
    text: 'We make everything for temples. Let’s continue to create history by passing on culture.',
    images: [
      {
        image: '/src/assets/owt3cn75.png',
        description: 'Zuiunji-temple, Hokkaido / 瑞雲寺 楼門',
      },
      {
        image: '/src/assets/gt6zfoja.png',
        description: 'Narita san Shinshoji-temple, Chiba / 成田山新勝寺 荘厳具',
      },
    ],
  },
  perks: {
    headerText:
      'Receive NFTs, authentic art pieces by traditional artisans and more.',
    subText:
      'Get NFTs, and redeem authentic art pieces by real traditional craftsmanship.',
    images: [
      {
        image: '/src/assets/artifacts/40.png',
        description: '40 Makie lacquer-work plate',
      },
      {
        image: '/src/assets/artifacts/92.png',
        description: '92 Transformable panel',
      },
      {
        image: '/src/assets/artifacts/89.png',
        description: '89 Metal panel, moon and autumn grasses',
      },
      {
        image: '/src/assets/artifacts/12.png',
        description: '12 Lotus petal dish flower in the moon',
      },
      {
        image: '/src/assets/artifacts/125.png',
        description: '125 Virupaksa (Buddhist deity)',
      },
      {
        image: '/src/assets/artifacts/101.png',
        description: '101 Meditation Room',
      },
      {
        image: '/src/assets/artifacts/108.png',
        description:
          "108 The Light Beyond, Ryunosuke Akutagawa, The Spider's Thread",
      },
    ],
  },
  quote:
    "Let's get good craftsmen to do good work. It is important to pass on the skills of skilled craftsmen to the next generation.",
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
        options: [
          {
            key: 'navLinks',
            value: [
              {
                display: 'Kougenji',
                path: 'http://kogenji.localhost:3000',
              },
            ],
          },
          {
            key: 'socialLinks',
            value: [
              {
                display: 'Stakes.social',
                path: '#',
              },
              {
                display: 'YouTube',
                path: 'https://www.youtube.com/user/suiundo/',
              },
            ],
          },
        ],
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
              {
                key: 'homeConfig',
                value: templesHomeConfig,
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
        propertyAddress: '0x70a8B9a4B2d407a542c205adBbEA38289c3285eB', // Polygon: 0x23d67953FE2e61e9fAc78447526D9358cD05d40d // Mumbai: 0x70a8B9a4B2d407a542c205adBbEA38289c3285eB
        chainId: 80001, // Polygon: 137 // Mumbai: 80001
        rpcUrl:
          'https://polygon-mumbai.infura.io/v3/fa1acbd68f5c4484b1082e1cf876b920', // Polygon: https://polygon-mainnet.infura.io/v3/fa1acbd68f5c4484b1082e1cf876b920 // Mumbai: https://polygon-mumbai.infura.io/v3/fa1acbd68f5c4484b1082e1cf876b920
        adminRolePoints: 0,
        options: [
          {
            key: 'headerLinks',
            value: [
              {
                display: 'Use ETH',
                path: 'nft',
              },
              {
                display: 'Community',
                path: 'https://guild.xyz/temples-dao',
              },
              {
                display: 'Perks',
                path: 'https://example.com',
              },
            ],
          },
          {
            key: 'navLinks',
            value: [
              {
                display: 'About',
                path: 'http://example.com',
              },
              {
                display: 'Terms & Conditions',
                path: 'http://example.com',
              },
              {
                display: 'Privacy Policy',
                path: 'http://example.com',
              },
              {
                display: 'Act on specified commercial transactions',
                path: 'http://example.com',
              },
            ],
          },
          {
            key: 'avatarImgSrc',
            value:
              'https://www.tambacity-kankou.jp/english/momiji/img/01main01.jpg',
          },
        ],
        plugins: [
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
            options: [
              {
                key: 'products',
                value: products,
              },
              {
                key: 'priceOverrides',
                value: [
                  {
                    id: '1',
                    price: 100_000,
                    currency: 'YEN',
                    purchaseLink: 'http://example.com',
                  },
                  {
                    id: '2',
                    price: 80_000,
                    currency: 'YEN',
                    purchaseLink: 'http://example.com',
                  },
                  {
                    id: '3',
                    price: 70_000,
                    currency: 'YEN',
                    purchaseLink: 'http://example.com',
                  },
                  {
                    id: '4',
                    price: 10_000,
                    currency: 'YEN',
                    purchaseLink: 'http://example.com',
                  },
                  {
                    id: '5',
                    price: 10_000,
                    currency: 'YEN',
                    purchaseLink: 'http://example.com',
                  },
                  {
                    id: '6',
                    price: 10_000,
                    currency: 'YEN',
                    purchaseLink: 'http://example.com',
                  },
                  {
                    id: '7',
                    price: 10_000,
                    currency: 'YEN',
                    purchaseLink: 'http://example.com',
                  },
                  {
                    id: '8',
                    price: 10_000,
                    currency: 'YEN',
                    purchaseLink: 'http://example.com',
                  },
                  {
                    id: '9',
                    price: 10_000,
                    currency: 'YEN',
                    purchaseLink: 'http://example.com',
                  },
                  {
                    id: '10',
                    price: 10_000,
                    currency: 'YEN',
                    purchaseLink: 'http://example.com',
                  },
                  {
                    id: '11',
                    price: 10_000,
                    currency: 'YEN',
                    purchaseLink: 'http://example.com',
                  },
                  {
                    id: '12',
                    price: 10_000,
                    currency: 'YEN',
                    purchaseLink: 'http://example.com',
                  },
                  {
                    id: '13',
                    price: 20_000,
                    currency: 'YEN',
                    purchaseLink: 'http://example.com',
                  },
                ],
              },
              {
                key: 'hero',
                value: {
                  coverImgSrc: 'https://i.imgur.com/qPq8hI8.jpg',
                  title: 'Kogenji',
                  description: [
                    `光源寺の天女絵修復プロジェクトでのご支援金は、天女の表具欄間彩色修復等に使われます。支援者の方は光源寺のDiscordチャンネルに参加し、修復状況（写真等）を見ることができます。また、NFTの種類により様々な特典をご用意しております。`,
                    `[EN:] The funds raised for Kougenji will be used to restore the celestial maiden paper picture frame on the decorative transom and other cultural assets withinin the temple. Supporters are allowed to join Kougenji's Discord channel for the latest news and updates about the restoration (photos,etc.).
                    We also plan to provide a variety of Perks according to the types of NFT you'll purchase.`,
                  ],
                },
              },
              {
                key: 'title',
                value: undefined,
              },
              {
                key: 'slug',
                value: [],
              },
            ],
          },
          {
            name: 'nft',
            enable: true,
            options: [
              {
                key: 'products',
                value: products,
              },
              {
                key: 'coverImgSrc',
                value: 'https://i.imgur.com/qPq8hI8.jpg',
              },
              {
                key: 'title',
                value: 'Kogenji',
              },
              {
                key: 'description',
                value: [
                  `光源寺の天女絵修復プロジェクトでのご支援金は、天女の表具欄間彩色修復等に使われます。支援者の方は光源寺のDiscordチャンネルに参加し、修復状況（写真等）を見ることができます。また、NFTの種類により様々な特典をご用意しております。`,
                  `[EN:] The funds raised for Kougenji will be used to restore the celestial maiden paper picture frame on the decorative transom and other cultural assets withinin the temple. Supporters are allowed to join Kougenji's Discord channel for the latest news and updates about the restoration (photos,etc.).
                  We also plan to provide a variety of Perks according to the types of NFT you'll purchase.`,
                ],
              },
            ],
          },
          {
            name: 'message',
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
