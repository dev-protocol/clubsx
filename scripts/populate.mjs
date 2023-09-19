import dotenv from 'dotenv'
import { encode } from '@devprotocol/clubs-core/encode'
import { createClient } from 'redis'
import { keccak256, toUtf8Bytes } from 'ethers'
import fs from 'fs-extra'
import jsonwebtoken from 'jsonwebtoken'

dotenv.config()

const { SALT } = process.env

const toBytes32 = (str) => keccak256(toUtf8Bytes(str))

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

const debugProducts = [
  {
    id: '1',
    name: '#1',
    description: `Lorem ipsum.`,
    price: 0.6,
    currency: 'USDC',
    imageSrc: 'https://source.unsplash.com/800x800/?nature',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('#1'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x57E21bd98612DE0Bd1723F4bf81A944eF7BfF526',
    },
  },
  {
    id: '2',
    name: '#2',
    description: `Lorem ipsum.`,
    price: 0.5,
    currency: 'USDC',
    imageSrc: 'https://source.unsplash.com/800x800/?nature',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('#2'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x57E21bd98612DE0Bd1723F4bf81A944eF7BfF526',
    },
  },
  {
    id: '3',
    name: '#3',
    description: `Lorem ipsum.`,
    price: 0.4,
    currency: 'USDC',
    imageSrc: 'https://source.unsplash.com/800x800/?nature',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('#3'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x57E21bd98612DE0Bd1723F4bf81A944eF7BfF526',
    },
  },
  {
    id: '4',
    name: '#4',
    description: `Lorem ipsum.`,
    price: 0.3,
    currency: 'USDC',
    imageSrc: 'https://source.unsplash.com/800x800/?nature',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('#4'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x57E21bd98612DE0Bd1723F4bf81A944eF7BfF526',
    },
  },
  {
    id: '5',
    name: '#5',
    description: `Lorem ipsum.`,
    price: 0.2,
    currency: 'USDC',
    imageSrc: 'https://source.unsplash.com/800x800/?nature',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('#5'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x57E21bd98612DE0Bd1723F4bf81A944eF7BfF526',
    },
  },
  {
    id: '6',
    name: '#6',
    description: `Lorem ipsum.`,
    price: 0.1,
    currency: 'USDC',
    imageSrc: 'https://source.unsplash.com/800x800/?nature',
    imageAlt: 'lorem ipsum',
    payload: toBytes32('#6'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x57E21bd98612DE0Bd1723F4bf81A944eF7BfF526',
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
        description: `A privilege to enjoy shopping low price products at members-limited EC sites, supporters-only information such as private YouTube videos, participation to the monthly community hour and members-only quests`,
      },
      {
        lang: 'ja_JP',
        description: `限定ECサイト（低額商品）での購入権、非公開YouTube動画、月1回のコミュニティアワーやメンバー限定クエストへの参加などサポーター限定の情報`,
      },
    ],
  },
  {
    tier: 'tier-2',
    descriptions: [
      {
        lang: 'en_US',
        description: `Tier 3 + a privilege to join auctions, a privilege to purchase luxurious items, etc. (Online Perks)`,
      },
      {
        lang: 'ja_JP',
        description: `Tier 3 + オークションへの参加権、特級品の購入権など（オンラインでの特典）`,
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
        description: `Tier 2 + 特別な場所を訪れたり、物理的な体験をすることができる権利（最大年2回まで）`,
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
        description: `Tier 1 + オーダーメード権利（通常お寺様からのオーダー依頼で作る職人にご希望の商品を作製して貰える権利。内容は要相談）`,
      },
    ],
  },
]

const guild = {
  key: 'guildUrl',
  value: 'https://guild.xyz/temples-dao',
}

const cryptocafeAccessControl$1 = {
  url: 'https://clubs-userland-cryptocafe.vercel.app/api/access-control/airtable/tblJQKBASg0lawpk3/fldW3gZ4LhCXGg5nf',
  description: fs.readFileSync(
    './src/assets/accessControl.cryptocafe.description$1.md',
    'utf-8',
  ),
}
const cryptocafeAccessControl$2 = {
  url: encodeURI(
    'https://clubs-userland-cryptocafe.vercel.app/api/access-control/airtable/tbliLoymN2sNRSDkQ/flddMiDmClyRnxwhb?additional-conditions=["fldmOuSsUw8CG34sd","送信"]',
  ),
  description: fs.readFileSync(
    './src/assets/accessControl.cryptocafe.description$2.md',
    'utf-8',
  ),
}
const cryptoCafeMemberships = [
  {
    id: 'cafe-visitor',
    name: 'Cafe Visitor',
    description: `CryptoCafe Bar 会員権（10時～18時、1日有効）\n\nCafé Visitor Pass\n\n無料Wifi、コーヒードリンク等
    `,
    price: 0.0001,
    currency: 'MATIC',
    imageSrc: 'https://i.imgur.com/4Qc8iDc.png',
    payload: toBytes32('cafe-visitor'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x57E21bd98612DE0Bd1723F4bf81A944eF7BfF526',
    },
    accessControl: cryptocafeAccessControl$1,
  },
  {
    id: 'bar-visitor',
    name: 'Bar Visitor',
    description: `CryptoCafe Bar 会員権（18時～22時、1日有効）\n\nBar Visitor Pass\n\n無料Wifi、コーヒードリンク、1日1杯のビール等
    `,
    price: 0.0001,
    currency: 'MATIC',
    imageSrc: 'https://i.imgur.com/PaxWOh8.png',
    payload: toBytes32('bar-visitor'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x57E21bd98612DE0Bd1723F4bf81A944eF7BfF526',
    },
    accessControl: cryptocafeAccessControl$1,
  },
  {
    id: 'one-day',
    name: 'One Day',
    description: `CryptoCafe Bar 会員権（10時~22時、1日有効）\n\nOne Day Pass\n\n無料Wifi、コーヒードリンク、1日1杯のビール等
    `,
    price: 0.0001,
    currency: 'MATIC',
    imageSrc: 'https://i.imgur.com/0IJMz2K.png',
    payload: toBytes32('one-day'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x57E21bd98612DE0Bd1723F4bf81A944eF7BfF526',
    },
    accessControl: cryptocafeAccessControl$1,
  },
  {
    id: 'friend-pass',
    name: 'Friend Pass',
    description: `CryptoCafe Bar 会員権（1ヶ月間有効）\n\nFriend Pass\n\n無料Wifi、コーヒードリンク、1日1杯のビール、ゲスト1人無料、スペシャルイベント参加等`,
    price: 0.0001,
    currency: 'MATIC',
    imageSrc: 'https://i.imgur.com/KzMhSgw.png',
    payload: toBytes32('friend-pass'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x57E21bd98612DE0Bd1723F4bf81A944eF7BfF526',
    },
    accessControl: cryptocafeAccessControl$2,
  },
  {
    id: 'best-friend-pass',
    name: 'Best Friend Pass',
    description: `CryptoCafe Bar 会員権（3ヶ月間有効）\n\nBest Friend Pass\n\n無料Wifi、コーヒードリンク、1日1杯のビール、ゲスト1人無料、スペシャルイベント参加等
    `,
    price: 5,
    currency: 'MATIC',
    imageSrc: 'https://i.imgur.com/v43yiqe.png',
    payload: toBytes32('best-friend-pass'),
    fee: {
      percentage: 0.95,
      beneficiary: '0x57E21bd98612DE0Bd1723F4bf81A944eF7BfF526',
    },
    accessControl: cryptocafeAccessControl$2,
  },
]

const populate = async () => {
  try {
    const client = createClient({
      url: process.env.REDIS_URL,
      username: process.env.REDIS_USERNAME ?? '',
      password: process.env.REDIS_PASSWORD ?? '',
    })
    await client.connect()

    // await client.del('aggre')
    await client.set(
      'temples',
      encode({
        name: '寺DAO',
        twitterHandle: '@templesdao',
        description: 'DAO that makes the next 1000 years',
        url: 'https://temples.clubs.place',
        propertyAddress: '0x541f7914ed2a4a8b477edc711fa349a77983f3ad',
        adminRolePoints: 0,
        chainId: 1,
        rpcUrl: 'https://mainnet.infura.io/v3/fa1acbd68f5c4484b1082e1cf876b920',
        options: [
          {
            key: 'ogp',
            value: { image: 'https://i.imgur.com/lcyO9Bn.jpg' },
          },
          {
            key: 'navigationLinks',
            value: [
              {
                display: 'Join',
                path: '/join',
              },
              {
                display: 'Kougenji',
                path: 'https://kougenji.clubs.place',
              },
              {
                display: 'Community',
                path: '/community',
              },
              {
                display: 'Perks',
                path: '/perks',
              },
              {
                display: 'Quests',
                path: '#',
                enable: false,
              },
              {
                display: 'Updates',
                path: '#',
                enable: false,
              },
              {
                display: 'Vote',
                path: '#',
                enable: false,
              },
            ],
          },
          {
            key: 'socialLinks',
            value: [
              {
                display: 'YouTube',
                path: 'https://www.youtube.com/user/suiundo/',
              },
            ],
          },
          {
            key: 'avatarImgSrc',
            value: 'https://i.imgur.com/jDel1t9.png',
          },
        ],
        plugins: [
          {
            id: 'clubs-core:admin',
            name: 'admin',
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
                  bg: 'rgba(68, 59, 45, 1)',
                  backgroundGradient: [
                    'rgba(255, 201, 119, 0.2)',
                    'rgba(255, 201, 119, 0)',
                  ],
                },
              },
              {
                key: 'homeConfig',
                value: {
                  hero: {
                    image: 'https://i.imgur.com/oNf7FsR.jpg',
                  },
                  description: `寺DAOでは、寺院建築、荘厳仏具に携わる工芸士、職人の伝統的技術を伝え、後世に残すことを目的とした支援を行っております。`,
                  body: fs.readFileSync(
                    './src/assets/homeConfig.temples.body.md',
                    'utf-8',
                  ),
                },
              },
            ],
          },
          {
            id: 'devprotocol:clubs:plugin:join-legacy',
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
            id: 'devprotocol:clubs:plugin:me',
            name: 'me',
            enable: true,
            options: [],
          },
          {
            id: 'devprotocol:clubs:clubsx:marketplace',
            name: 'marketplace',
            enable: true,
            options: [],
          },
          {
            id: 'devprotocol:clubs:plugin:members',
            name: 'members',
            enable: true,
            options: [],
          },
          {
            id: 'devprotocol:clubs:plugin:perks',
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
            id: 'devprotocol:clubs:plugin:quests',
            name: 'quests',
            enable: true,
            options: [],
          },
          {
            id: 'devprotocol:clubs:plugin:community',
            name: 'community',
            enable: true,
            options: [guild],
          },
          {
            id: 'devprotocol:clubs:simple-memberships',
            name: 'memberships',
            enable: true,
            options: [
              {
                key: 'memberships',
                value: [
                  {
                    id: 'tier-3',
                    name: 'Tier 3',
                    description: `蒔絵師による作品/ やすらぎ壇「蓮華」\n\n**特典** - 限定ECサイト(低額商品)での購入権、非公開YouTube動画、月1回のコミュニティアワーやメンバー限定クエストへの参加などサポーター限定の情報`,
                    price: 400,
                    currency: 'DEV',
                    imageSrc:
                      'https://bafybeiav46h6zegh4e7zfdcgk6xjpg6if2kdxtvp3ejtyicvpgc2iucpim.ipfs.nftstorage.link',
                    payload: undefined,
                    fee: undefined,
                  },
                  {
                    id: 'tier-2',
                    name: 'Tier 2',
                    description: `蒔絵師による作品/ やすらぎ壇 「光輝」\n\n**特典** - Tier 3 + オークションへの参加権、特級品の購入権など(オンラインでの特典)`,
                    price: 4000,
                    currency: 'DEV',
                    imageSrc:
                      'https://bafybeic3d2otapykfdp3ktqbdonn4ylrove5ccs5vv2udydwbgudstrcwu.ipfs.nftstorage.link',
                    payload: undefined,
                    fee: undefined,
                  },
                  {
                    id: 'tier-1',
                    name: 'Tier 1',
                    description: `大本山 總持寺 仁王像（總持寺型仁王像）\n\n**特典** - Tier 2 + 特別な場所を訪れたり、物理的な体験をすることができる権利(最大年2回まで)`,
                    price: 10000,
                    currency: 'DEV',
                    imageSrc:
                      'https://bafybeib745w7vjcsh37mepaluvbmqrbjq4gax46oirkmrjeqeh55gjiyzi.ipfs.nftstorage.link',
                    payload: undefined,
                    fee: undefined,
                  },
                  {
                    id: 'super',
                    name: 'Super',
                    description: `大本山護国寺 如意輪観世音菩薩像\n\n**特典** - Tier 1 + オーダーメード権利(通常お寺様からのオーダー依頼で作る職人にご希望の商品を作製して貰える権利。内容は要相談)`,
                    price: 15000,
                    currency: 'DEV',
                    imageSrc:
                      'https://bafybeiagvn4exdbwokm4g6t6a2s3xvl2fu7zutvlf6sgwd4fjrdrc23hsu.ipfs.nftstorage.link',
                    payload: undefined,
                    fee: undefined,
                  },
                  {
                    id: 'tier-4-1',
                    name: 'Tier 4 #1',
                    description: `林檎天井絵\n\n**特典** - 寺DAODiscordへの参加権\n月1回のコミュニティアワーやメンバー限定クエストへ参加できます`,
                    price: 200,
                    currency: 'DEV',
                    imageSrc:
                      'https://bafybeigis7fdpwizu34v5iwjvc2lcdk4g75keqa3xe72jekldmhjopahnu.ipfs.nftstorage.link',
                    payload: toBytes32('林檎天井絵'),
                    fee: undefined,
                  },
                  {
                    id: 'tier-4-2',
                    name: 'Tier 4 #2',
                    description: `蓮華一本立木華\n\n**特典** - 寺DAODiscordへの参加権\n月1回のコミュニティアワーやメンバー限定クエストへ参加できます`,
                    price: 200,
                    currency: 'DEV',
                    imageSrc:
                      'https://bafybeihrh7haq3yadt6nfltynv6ukgovm4hgfhd6o7zpkaf33cjl6tuoau.ipfs.nftstorage.link',
                    payload: toBytes32('蓮華一本立木華'),
                    fee: undefined,
                  },
                ],
              },
            ],
          },
        ],
      }),
    )

    await client.set(
      'kougenji',
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

    await client.set(
      'debug-cc-payments',
      encode({
        name: 'debug-cc-payments',
        twitterHandle: '',
        description: '',
        url: 'https://debug-cc-payments.prerelease.clubs.place',
        propertyAddress: '0xE59fEDaBB0F79b0EC605737805a9125cd8d87B1f',
        chainId: 80001, // Polygon: 137 // Mumbai: 80001
        rpcUrl:
          'https://polygon-mumbai.infura.io/v3/fa1acbd68f5c4484b1082e1cf876b920', // Polygon: https://polygon-mainnet.infura.io/v3/fa1acbd68f5c4484b1082e1cf876b920 // Mumbai: https://polygon-mumbai.infura.io/v3/fa1acbd68f5c4484b1082e1cf876b920
        adminRolePoints: 0,
        options: [
          {
            key: 'ogp',
            value: { image: 'https://i.imgur.com/I6Yr0V7.jpg' },
          },
          {
            key: 'navigationLinks',
            value: [
              {
                display: 'Use MATIC',
                path: '/nft',
              },
            ],
          },
          {
            key: 'footerLinks',
            value: [
              // {
              //   display: 'About',
              //   path: 'https://sites.google.com/view/kougenjidao',
              // },
            ],
          },
          {
            key: 'avatarImgSrc',
            value: 'https://source.unsplash.com/400x400/?nature',
          },
        ],
        plugins: [
          {
            id: 'devprotocol:clubs:plugin:pay-by-card',
            name: 'fiat',
            enable: true,
            options: [
              {
                key: 'importFrom',
                value: ['devprotocol:clubs:plugin:nft'],
              },
              {
                key: 'hero',
                value: {
                  coverImgSrc: 'https://source.unsplash.com/1200x600/?nature',
                  title: 'Debug',
                  description: [
                    `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
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
            id: 'devprotocol:clubs:plugin:tickets',
            options: [
              {
                key: 'tickets',
                value: [
                  // {
                  //   payload: toBytes32('#1'),
                  //   importedFrom: {
                  //     plugin: 'devprotocol:clubs:simple-memberships',
                  //     key: 'memberships',
                  //   },
                  //   name: 'Cafe Ticket',
                  //   uses: [
                  //     {
                  //       id: '1-month-pass',
                  //       description: '1 month pass',
                  //       duration: '30 days',
                  //       refreshCycle: undefined,
                  //     },
                  //     {
                  //       id: 'free-beer',
                  //       description: 'Free beer/day',
                  //       dependsOn: '1-month-pass',
                  //       refreshCycle: '24 hours',
                  //     },
                  //     {
                  //       id: 'special-week',
                  //       description: 'Special Week',
                  //       duration: '3 days',
                  //       refreshCycle: undefined,
                  //     },
                  //     {
                  //       id: 'free-juice',
                  //       description: 'Free juice/day',
                  //       dependsOn: 'special-week',
                  //       refreshCycle: '1 days',
                  //     },
                  //   ],
                  // },
                  // {
                  //   payload: toBytes32('#1'),
                  //   importedFrom: {
                  //     plugin: 'devprotocol:clubs:simple-memberships',
                  //     key: 'memberships',
                  //   },
                  //   name: '1 Seat',
                  //   uses: [
                  //     {
                  //       id: '1',
                  //       description: '1 day pass',
                  //       duration: '1 days',
                  //       refreshCycle: undefined,
                  //     },
                  //     {
                  //       id: '2',
                  //       description: 'Free coffee',
                  //       dependsOn: '1',
                  //       refreshCycle: '24 hours',
                  //     },
                  //   ],
                  // },
                  // {
                  //   payload: toBytes32('#1'),
                  //   importedFrom: {
                  //     plugin: 'devprotocol:clubs:simple-memberships',
                  //     key: 'memberships',
                  //   },
                  //   name: 'Entry',
                  //   uses: [
                  //     {
                  //       id: '1',
                  //       description: '1 day pass',
                  //       duration: '1 days',
                  //       refreshCycle: undefined,
                  //     },
                  //     {
                  //       id: '2',
                  //       description: 'Free coffee',
                  //       dependsOn: '1',
                  //       refreshCycle: '24 hours',
                  //     },
                  //   ],
                  // },
                  // {
                  //   payload: toBytes32('#1'),
                  //   importedFrom: {
                  //     plugin: 'devprotocol:clubs:simple-memberships',
                  //     key: 'memberships',
                  //   },
                  //   name: 'Tea Ceremony Class',
                  //   uses: [
                  //     {
                  //       id: '1',
                  //       description: '6 months',
                  //       duration: '6 months',
                  //       refreshCycle: undefined,
                  //     },
                  //     {
                  //       id: '2',
                  //       description: '2 lessons per week',
                  //       dependsOn: '1',
                  //       refreshCycle: '24 hours',
                  //     },
                  //   ],
                  // },
                  {
                    payload: toBytes32('#1'),
                    importedFrom: {
                      plugin: 'devprotocol:clubs:simple-memberships',
                      key: 'memberships',
                    },
                    name: 'Stargazing',
                    uses: [
                      {
                        id: '1',
                        description: 'Fall member',
                        duration: '3 months',
                        refreshCycle: undefined,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'devprotocol:clubs:simple-memberships',
            name: 'memberships',
            enable: true,
            options: [
              {
                key: 'memberships',
                value: debugProducts,
              },
            ],
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
                    image: 'https://source.unsplash.com/1200x600/?nature',
                  },
                  description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
                },
              },
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
                value: debugProducts,
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
                value: debugProducts,
              },
              {
                key: 'coverImgSrc',
                value: 'https://source.unsplash.com/1200x600/?nature',
              },
              {
                key: 'title',
                value: 'Debug',
              },
              {
                key: 'description',
                value: [
                  `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
                ],
              },
            ],
          },
          {
            id: 'devprotocol:clubs:gated-contact-form',
            name: 'message',
            enable: true,
            options: [],
          },
        ],
      }),
    )

    await client.set(
      'cryptocafe',
      encode({
        name: 'Crypto Cafe & Bar',
        twitterHandle: '',
        description: `Tokyo's hub for blockchain enthusiasts & the crypto-curious.`,
        url: 'https://cryptocafe.prerelease.clubs.place',
        propertyAddress: '0xE59fEDaBB0F79b0EC605737805a9125cd8d87B1f',
        chainId: 80001, // Polygon: 137 // Mumbai: 80001
        rpcUrl:
          'https://polygon-mumbai.infura.io/v3/fa1acbd68f5c4484b1082e1cf876b920', // Polygon: https://polygon-mainnet.infura.io/v3/fa1acbd68f5c4484b1082e1cf876b920 // Mumbai: https://polygon-mumbai.infura.io/v3/fa1acbd68f5c4484b1082e1cf876b920
        adminRolePoints: 0,
        options: [
          {
            key: 'ogp',
            value: { image: 'https://i.imgur.com/IqkJqwc.jpg' },
          },
          {
            key: 'navigationLinks',
            value: [
              {
                display: 'Tickets',
                path: '/tickets',
              },
            ],
          },
          {
            key: 'avatarImgSrc',
            value: 'https://i.imgur.com/8wc0qH5.png',
          },
        ],
        plugins: [
          {
            id: 'devprotocol:clubs:plugin:veritrans',
            name: 'fiat',
            enable: true,
            options: [
              {
                key: 'override',
                value: [
                  {
                    id: cryptoCafeMemberships[0].id,
                    importFrom: 'devprotocol:clubs:simple-memberships',
                    key: 'memberships',
                    payload: cryptoCafeMemberships[0].payload,
                    price: {
                      yen: 2000,
                    },
                  },
                  {
                    id: cryptoCafeMemberships[1].id,
                    importFrom: 'devprotocol:clubs:simple-memberships',
                    key: 'memberships',
                    payload: cryptoCafeMemberships[1].payload,
                    price: {
                      yen: 2000,
                    },
                  },
                  {
                    id: cryptoCafeMemberships[2].id,
                    importFrom: 'devprotocol:clubs:simple-memberships',
                    key: 'memberships',
                    payload: cryptoCafeMemberships[2].payload,
                    price: {
                      yen: 3000,
                    },
                  },
                  {
                    id: cryptoCafeMemberships[3].id,
                    importFrom: 'devprotocol:clubs:simple-memberships',
                    key: 'memberships',
                    payload: cryptoCafeMemberships[3].payload,
                    price: {
                      yen: 45000,
                    },
                  },
                  {
                    id: cryptoCafeMemberships[4].id,
                    importFrom: 'devprotocol:clubs:simple-memberships',
                    key: 'memberships',
                    payload: cryptoCafeMemberships[4].payload,
                    price: {
                      yen: 110000,
                    },
                  },
                ],
              },
              {
                key: 'webhooks',
                value: {
                  fulfillment: {
                    encrypted: jsonwebtoken.sign(
                      'https://veritrans.clubs.place/api/mock/logger',
                      SALT,
                    ),
                  },
                },
              },
            ],
          },
          {
            id: 'devprotocol:clubs:plugin:tickets',
            options: [
              {
                key: 'tickets',
                value: [
                  {
                    payload: toBytes32('cafe-visitor'),
                    importedFrom: {
                      plugin: 'devprotocol:clubs:simple-memberships',
                      key: 'memberships',
                    },
                    name: 'Cafe Ticket',
                    uses: [
                      {
                        id: '1-month-pass',
                        description: '1 month pass',
                        duration: '30 days',
                        refreshCycle: undefined,
                      },
                      {
                        id: 'free-juice',
                        description: 'Free juice/day',
                        dependsOn: '1-month-pass',
                        refreshCycle: '24 hours',
                      },
                    ],
                    webhooks: {
                      used: {
                        encrypted: jsonwebtoken.sign(
                          'https://clubs-userland-cryptocafe.vercel.app/api/webhooks/tickets/XYZ/dest/airtable/tblPinFQ8dUbrhzPn',
                          SALT,
                        ),
                      },
                    },
                  },
                ],
              },
            ],
          },
          {
            id: 'devprotocol:clubs:simple-memberships',
            name: 'memberships',
            enable: true,
            options: [
              {
                key: 'memberships',
                value: cryptoCafeMemberships,
              },
            ],
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
                    image: 'https://i.imgur.com/IqkJqwc.jpg',
                  },
                  description: `Tokyo's hub for blockchain enthusiasts & the crypto-curious.`,
                  body: fs.readFileSync(
                    './src/assets/homeConfig.cryptocafe.body.md',
                    'utf-8',
                  ),
                },
              },
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
                value: debugProducts,
              },
            ],
          },
          {
            id: 'devprotocol:clubs:plugin:join',
            name: 'join',
            enable: true,
            options: [],
          },
        ],
      }),
    )

    await client.set(
      `devprotocol:clubs:plugin:tickets:history:0xE59fEDaBB0F79b0EC605737805a9125cd8d87B1f:${toBytes32(
        '#1',
      )}#51`,
      encode({
        '1-month-pass': { datetime: new Date('2023-08-20T00:00:00Z') },
      }),
    )
    await client.set(
      `devprotocol:clubs:plugin:tickets:history:0xE59fEDaBB0F79b0EC605737805a9125cd8d87B1f:${toBytes32(
        '#1',
      )}#52`,
      encode({
        '1-month-pass': { datetime: new Date('2023-01-20T00:00:00Z') },
        'special-week': { datetime: new Date('2023-01-20T00:00:00Z') },
      }),
    )
    await client.set(
      `devprotocol:clubs:plugin:tickets:history:0xE59fEDaBB0F79b0EC605737805a9125cd8d87B1f:${toBytes32(
        '#1',
      )}#53`,
      encode({
        'special-week': { datetime: new Date('2023-08-22T00:00:00Z') },
        'free-juice': {
          datetime: new Date('2023-08-23T00:00:00Z'),
        },
      }),
    )

    console.log('Tenants set')
    await client.quit()
    console.log('Closed the DB connection')
  } catch (error) {
    console.error('error populating tenants: ', error)
  }
}

populate()
