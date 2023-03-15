export type InstallablePlugins = {
  src: string
  name: string
  main: string
  srcType: 'local' | 'npm'
}

export const installablePlugins: InstallablePlugins[] = [
  {
    name: 'community',
    srcType: 'local',
    src: '.',
    main: 'index.ts',
  },
  {
    name: 'default-theme',
    srcType: 'local',
    src: '.',
    main: 'index.ts',
  },
  {
    name: 'join',
    srcType: 'local',
    src: '.',
    main: 'index.ts',
  },
  {
    name: 'me',
    srcType: 'local',
    src: '.',
    main: 'index.ts',
  },
  {
    name: 'members',
    srcType: 'local',
    src: '.',
    main: 'index.ts',
  },
  {
    name: 'memberships',
    srcType: 'local',
    src: '.',
    main: 'index.ts',
  },
  {
    name: 'message',
    srcType: 'local',
    src: '.',
    main: 'index.ts',
  },
  {
    name: 'quests',
    srcType: 'local',
    src: '.',
    main: 'index.ts',
  },
]
