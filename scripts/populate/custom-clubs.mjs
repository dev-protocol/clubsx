import { encode } from '@devprotocol/clubs-core'
import { db } from './utils/db.mjs'
import { whenCalledDirectly } from './utils/whenCalledDirectly.mjs'

const KEY = 'clubsname'

const populate = async (client) => {
  await client.set(
    KEY,
    encode({
      name: 'testing-clubs-on-shubham-machine',
      twitterHandle: '@doesntmatter',
      description: '',
      url: 'https://clubsname.clubs.place',
      propertyAddress: 'propertyAdd',
      adminRolePoints: 0,
      chainId: 80001,
      rpcUrl:
        '',
      options: [
        {
          key: 'ogp',
          value: { image: '' },
        },
        {
          key: 'navigationLinks',
          value: [
            {
              display: 'Join',
              path: '/join',
            },
            {
              display: 'Collections',
              path: '/collections',
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
          options: [],
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
          id: 'devprotocol:clubs:plugin:quests',
          name: 'quests',
          enable: true,
          options: [],
        },
        {
          id: 'devprotocol:clubs:simple-memberships',
          name: 'memberships',
          enable: true,
          options: [
            {
              key: 'memberships',
              value: [],
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
