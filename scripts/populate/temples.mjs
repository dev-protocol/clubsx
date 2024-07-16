import { encode } from '@devprotocol/clubs-core'
import fs from 'fs-extra'
import { toBytes32 } from './utils/toBytes32.mjs'
import { db } from './utils/db.mjs'
import { whenCalledDirectly } from './utils/whenCalledDirectly.mjs'

const KEY = 'temples'

const tiers = [
  {
    title: 'Tier 3',
    id: 'tier-3',
    badgeImageDescription: `"Yasuragi dan Renge (a Buddhist altar, lotus)" embossed gilt lacquer work with inlaid mother-of-pearl`,
  },
  {
    title: 'Tier 2',
    id: 'tier-2',
    badgeImageDescription: `"Yasuragi dan Koki (a Buddhist altar, brightness)" embossed gilt lacquer work`,
  },
  {
    title: 'Tier 1',
    id: 'tier-1',
    badgeImageDescription: `Sojiij Head Monastry : Nioh statue (statues of the two Deva kings)`,
  },
  {
    title: 'Super',
    id: 'super',
    badgeImageDescription: `Gokokuji= Head Monastry : Nyoirin Kannon statue (Cintāmaṇicakra statue)`,
  },
]

const guild = {
  key: 'guildUrl',
  value: 'https://guild.xyz/temples-dao',
}
const populate = async (client) => {
  await client.set(
    KEY,
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
              display: 'Kougenji',
              path: 'https://kougenji.clubs.place',
            },
            {
              display: 'Community',
              path: '/community',
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
                  imageSrc:
                    'https://bafybeiav46h6zegh4e7zfdcgk6xjpg6if2kdxtvp3ejtyicvpgc2iucpim.ipfs.nftstorage.link',
                  payload: undefined,
                  fee: undefined,
                },
                {
                  id: 'tier-2',
                  name: 'Tier 2',
                  description: `蒔絵師による作品/ やすらぎ壇 「光輝」\n\n**特典** - Tier 3 + オークションへの参加権、特級品の購入権など(オンラインでの特典)`,
                  imageSrc:
                    'https://bafybeic3d2otapykfdp3ktqbdonn4ylrove5ccs5vv2udydwbgudstrcwu.ipfs.nftstorage.link',
                  payload: undefined,
                  fee: undefined,
                },
                {
                  id: 'tier-1',
                  name: 'Tier 1',
                  description: `大本山 總持寺 仁王像（總持寺型仁王像）\n\n**特典** - Tier 2 + 特別な場所を訪れたり、物理的な体験をすることができる権利(最大年2回まで)`,
                  imageSrc:
                    'https://bafybeib745w7vjcsh37mepaluvbmqrbjq4gax46oirkmrjeqeh55gjiyzi.ipfs.nftstorage.link',
                  payload: undefined,
                  fee: undefined,
                },
                {
                  id: 'super',
                  name: 'Super',
                  description: `大本山護国寺 如意輪観世音菩薩像\n\n**特典** - Tier 1 + オーダーメード権利(通常お寺様からのオーダー依頼で作る職人にご希望の商品を作製して貰える権利。内容は要相談)`,
                  imageSrc:
                    'https://bafybeiagvn4exdbwokm4g6t6a2s3xvl2fu7zutvlf6sgwd4fjrdrc23hsu.ipfs.nftstorage.link',
                  payload: undefined,
                  fee: undefined,
                },
                {
                  id: 'tier-4-1',
                  name: 'Tier 4 #1',
                  description: `林檎天井絵\n\n**特典** - 寺DAODiscordへの参加権\n月1回のコミュニティアワーやメンバー限定クエストへ参加できます`,
                  imageSrc:
                    'https://bafybeigis7fdpwizu34v5iwjvc2lcdk4g75keqa3xe72jekldmhjopahnu.ipfs.nftstorage.link',
                  payload: toBytes32('林檎天井絵'),
                  fee: undefined,
                },
                {
                  id: 'tier-4-2',
                  name: 'Tier 4 #2',
                  description: `蓮華一本立木華\n\n**特典** - 寺DAODiscordへの参加権\n月1回のコミュニティアワーやメンバー限定クエストへ参加できます`,
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

  console.log('set', KEY)
}

whenCalledDirectly(async () => {
  const client = await db()
  await populate(client)
  await client.quit()
})

export default populate
