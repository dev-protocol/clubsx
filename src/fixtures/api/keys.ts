export const generateId = (identifier: string) => `id::${identifier}`

export const generateClubPluginsId = (ientifier: string) =>
  `club:plugins::${ientifier}`

export const generateProfileId = (identifier: string) =>
  `profile::${identifier}`

export const generateStatsId = (type: 'polygon' = 'polygon') => `stats::${type}`
