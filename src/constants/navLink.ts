export type NavLink = {
  display: string
  path: string
  enable?: boolean
  kind?: 'twitter' | 'discord'
}

export type PathCondition = {
  path: string
  exact?: boolean
}
