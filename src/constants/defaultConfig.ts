import { ClubsConfiguration } from '@devprotocol/clubs-core'

export const defaultConfig: ClubsConfiguration = {
  name: '',
  twitterHandle: '',
  description: '',
  url: 'https://<USERS_SITE_NAME_HERE>.clubs.place',
  propertyAddress: '0x23d67953FE2e61e9fAc78447526D9358cD05d40d',
  adminRolePoints: 50,
  chainId: 137,
  rpcUrl: 'https://polygon-rpc.com',
  options: [
    {
      key: 'headerLinks',
      value: [],
    },
    {
      key: 'socialLinks',
      value: [],
    },
    {
      key: 'sidebarPrimaryLinks',
      value: [
        {
          display: 'Join',
          path: '/join',
        },
      ],
    },
    {
      key: 'sidebarLinks',
      value: [],
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
          key: 'homeConfig',
          value: {
            hero: {
              image: 'https://i.imgur.com/MyGIFqA.jpg',
              text: '',
            },
            body: '',
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
