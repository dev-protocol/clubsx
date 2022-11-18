export type NavLink = {
  display: string
  path: string
  enable?: boolean
}

export type PathCondition = {
  path: string
  exact?: boolean
}
