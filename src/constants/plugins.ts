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
    srcType: 'npm',
    src: '.',
    main: 'index.ts',
  },
  {
    name: 'me',
    srcType: 'npm',
    src: '.',
    main: 'index.ts',
  },
  {
    name: 'members',
    srcType: 'npm',
    src: '.',
    main: 'index.ts',
  },
  {
    name: 'memberships',
    srcType: 'npm',
    src: '.',
    main: 'index.ts',
  },
  {
    name: 'message',
    srcType: 'npm',
    src: '.',
    main: 'index.ts',
  },
  {
    name: 'quests',
    srcType: 'npm',
    src: '.',
    main: 'index.ts',
  },
]
