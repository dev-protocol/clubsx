export type InstallablePlugins = {
  src: string
  name: string
  main: string
  srcType: 'local' | 'npm'
}

export const installablePlugins: InstallablePlugins[] = [
  {
    name: '@plugins/community',
    srcType: 'local',
    src: '.',
    main: 'index.ts',
  },
  {
    name: '@plugins/join',
    srcType: 'npm',
    src: '.',
    main: 'index.ts',
  },
]
