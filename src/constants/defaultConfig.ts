import type { ClubsConfiguration } from '@devprotocol/clubs-core'
import { rawContent as Body } from '@assets/homeConfig.body.md'

export const defaultConfig: ClubsConfiguration = {
  name: '',
  twitterHandle: '',
  description: '',
  url: 'https://<USERS_SITE_NAME_HERE>.clubs.place',
  propertyAddress: '0x0000000000000000000000000000000000000000',
  adminRolePoints: 50,
  chainId: 137,
  rpcUrl: 'https://polygon-rpc.com',
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
      key: 'fullPageViewPaths',
      value: [{ path: '', exact: true }, { path: 'join/' }],
    },
    {
      key: 'avatarImgSrc',
      value: '',
    },
  ],
  plugins: [
    {
      name: 'admin',
      options: [],
    },
    {
      name: 'defaultTheme',
      options: [
        {
          key: 'globalConfig',
          value: {
            bg: 'rgba(131, 138, 176, 1)',
            backgroundGradient: [
              'rgba(204, 0, 255, 0.2)',
              'rgba(204, 0, 255, 0)',
            ],
          },
        },
        {
          key: 'homeConfig',
          value: {
            hero: {
              image: 'https://i.imgur.com/MyGIFqA.jpg',
            },
            description: `I create art in Canada using flowers and light refraction. Recently, I have focused on creating online artworks that allow user interaction through JavaScript.`,
            body: Body(),
          },
        },
      ],
    },
    {
      name: 'join',
      options: [],
    },
    {
      name: 'me',
      options: [],
    },
    {
      name: 'community',
      options: [],
    },
    {
      name: 'quests',
      options: [],
    },
    {
      name: 'members',
      options: [],
    },
    {
      name: 'memberships',
      options: [],
    },
    {
      name: 'message',
      options: [],
    },
  ],
}
