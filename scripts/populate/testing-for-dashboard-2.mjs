import { encode } from '@devprotocol/clubs-core'
import { db } from './utils/db.mjs'
import { whenCalledDirectly } from './utils/whenCalledDirectly.mjs'

const KEY = 'testing-for-dashboard-2'

const populate = async (client) => {
  await client.set(
    KEY,
    encode({
      name: 'testing-for-dashboard-2',
      twitterHandle: '',
      description: '',
      url: 'https://testing-for-dashboard-2.clubs.place',
      propertyAddress: '0x39d16ecd8506AAe3935492334c14E3163D0d2658',
      adminRolePoints: 50,
      chainId: 80001,
      rpcUrl:
        'https://polygon-mumbai.infura.io/v3/fa1acbd68f5c4484b1082e1cf876b920',
      options: [
        {
          key: 'navigationLinks',
          value: [
            {
              display: 'Join',
              path: '/join',
            },
            {
              display: 'Community',
              path: '/community',
            },
          ],
        },
        {
          key: 'avatarImgSrc',
          value: '',
        },
        {
          key: '__draft',
          value: {
            isInDraft: false,
            address: '0x6B2eBFe3FE5c5B84746105421de93Df383b222E8',
            category: 'DISCORD',
          },
        },
      ],
      plugins: [
        {
          name: 'admin',
          options: [],
          id: 'clubs-core:admin',
        },
        {
          name: 'defaultTheme',
          options: [
            {
              key: 'globalConfig',
              value: {
                bg: 'rgba(29, 36, 38, 1)',
                ink: 'rgba(255, 255, 255, 1)',
              },
            },
            {
              key: 'homeConfig',
              value: {
                hero: {
                  image: 'https://i.imgur.com/hyqFcB6.png',
                },
                description:
                  'I create art in Canada using flowers and light refraction. Recently, I have focused on creating online artworks that allow user interaction through JavaScript.',
                body: "### Hi, I'm Alice!\n\nhttps://www.youtube.com/watch?v=WgDAezl1RrQ\n\nThe YouTube link you place will automatically display embedded. Try it! YouTube video can be a great help in making your activities briefly known.\n\nWant to use images in your description? Then try writing it like the following. You can see how the image will display later on the [Preview] page.\n\n![](https://images.unsplash.com/photo-1674420628423-bf7a338af32d)\n",
              },
            },
          ],
          id: 'devprotocol:clubs:theme-1',
        },
        {
          name: 'join',
          options: [],
          id: 'devprotocol:clubs:plugin:join',
        },
        {
          name: 'me',
          options: [],
          id: 'devprotocol:clubs:plugin:me',
        },
        {
          name: 'community',
          options: [],
          id: 'devprotocol:clubs:plugin:community',
        },
        {
          name: 'quests',
          options: [],
          id: 'devprotocol:clubs:plugin:quests',
        },
        {
          name: 'members',
          options: [],
          id: 'devprotocol:clubs:plugin:members',
        },
        {
          name: 'memberships',
          options: [
            {
              key: 'memberships',
              value: [
                {
                  id: 'preset-casual',
                  name: 'Casual',
                  imageSrc: 'https://i.imgur.com/80cN1P3.png',
                  currency: 'ETH',
                  price: 0.003,
                  description: 'lorem ipsum',
                  payload: {
                    0: 191,
                    1: 182,
                    2: 237,
                    3: 44,
                    4: 84,
                    5: 235,
                    6: 16,
                    7: 196,
                  },
                },
                {
                  id: 'preset-team',
                  name: 'Awesome-band Contributor',
                  imageSrc: 'https://i.imgur.com/YaNNZ2F.png',
                  currency: 'ETH',
                  price: 0.001,
                  description: 'Testing',
                  payload: {
                    0: 112,
                    1: 167,
                    2: 76,
                    3: 158,
                    4: 207,
                    5: 193,
                    6: 220,
                    7: 197,
                  },
                },
              ],
            },
          ],
          id: 'devprotocol:clubs:simple-memberships',
        },
        {
          name: 'message',
          options: [],
          id: 'devprotocol:clubs:gated-contact-form',
        },
        {
          name: 'marketplace',
          options: [],
          id: 'devprotocol:clubs:clubsx:marketplace',
        },
        {
          id: 'devprotocol:clubs:clubsx:marketplace',
          options: [],
        },
        {
          name: 'collections',
          options: [
            {
              key: 'collections',
              value: [
                {
                  id: 'preset-collections',
                  name: 'Preset Collections',
                  imageSrc: 'https://i.ibb.co/RbxFzn8/img.jpg',
                  startTime: 1692954574,
                  isTimeLimitedCollection: true,
                  endTime: 1693472969,
                  description: 'This is test collections',
                  memberships: [
                    {
                      id: 'preset-casual',
                      name: 'Testing-Collection-1',
                      imageSrc: 'https://i.imgur.com/80cN1P3.png',
                      currency: 'ETH',
                      price: 0.003,
                      description: 'lorem ipsum',
                      payload: {
                        0: 191,
                        1: 182,
                        2: 237,
                        3: 44,
                        4: 84,
                        5: 235,
                        6: 16,
                        7: 196,
                      },
                    },
                    {
                      id: 'preset-team',
                      name: 'Testing-Collection-2',
                      imageSrc: 'https://i.ibb.co/Kyjr50C/Image.png',
                      currency: 'ETH',
                      price: 0.001,
                      description: 'Testing',
                      payload: {
                        0: 112,
                        1: 167,
                        2: 76,
                        3: 158,
                        4: 207,
                        5: 193,
                        6: 220,
                        7: 197,
                      },
                    },
                  ],
                },
                {
                  id: 'preset-collections-1',
                  name: 'Preset Collections 2',
                  imageSrc: 'https://i.ibb.co/RbxFzn8/img.jpg',
                  startTime: 1692954574,
                  isTimeLimitedCollection: false,
                  description: 'This is test collections',
                  memberships: [
                    {
                      id: 'preset-casual',
                      name: 'Testing-Collection-1',
                      imageSrc: 'https://i.imgur.com/80cN1P3.png',
                      currency: 'ETH',
                      price: 0.003,
                      description: 'lorem ipsum',
                      payload: {
                        0: 191,
                        1: 182,
                        2: 237,
                        3: 44,
                        4: 84,
                        5: 235,
                        6: 16,
                        7: 196,
                      },
                      memberCount: 100,
                    },
                    {
                      id: 'preset-team',
                      name: 'Testing-Collection-2',
                      imageSrc: 'https://i.ibb.co/Kyjr50C/Image.png',
                      currency: 'ETH',
                      price: 0.001,
                      description: 'Testing',
                      payload: {
                        0: 112,
                        1: 167,
                        2: 76,
                        3: 158,
                        4: 207,
                        5: 193,
                        6: 220,
                        7: 197,
                      },
                      memberCount: 100,
                    },
                  ],
                },
              ],
            },
          ],
          id: 'devprotocol:clubs:collections',
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
