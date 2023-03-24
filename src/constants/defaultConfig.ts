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
      key: 'avatarImgSrc',
      value: '',
    },
  ],
  plugins: [
    {
      id: 'clubs-core:admin',
      name: 'admin',
      options: [],
    },
    {
      id: 'devprotocol:clubs:theme-1',
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
              image: 'https://i.imgur.com/hyqFcB6.png',
            },
            description: `I create art in Canada using flowers and light refraction. Recently, I have focused on creating online artworks that allow user interaction through JavaScript.`,
            body: Body(),
          },
        },
      ],
    },
    {
      id: 'devprotocol:clubs:plugin:join',
      name: 'join',
      options: [],
    },
    {
      id: 'devprotocol:clubs:plugin:me',
      name: 'me',
      options: [],
    },
    {
      id: 'devprotocol:clubs:plugin:community',
      name: 'community',
      options: [],
    },
    {
      id: 'devprotocol:clubs:plugin:quests',
      name: 'quests',
      options: [],
    },
    {
      id: 'devprotocol:clubs:plugin:members',
      name: 'members',
      options: [],
    },
    {
      id: 'devprotocol:clubs:simple-memberships',
      name: 'memberships',
      options: [],
    },
    {
      id: 'devprotocol:clubs:gated-contact-form',
      name: 'message',
      options: [],
    },
    {
      id: 'devprotocol:clubs:clubsx:marketplace',
      name: 'marketplace',
      options: [],
    },
  ],
}
