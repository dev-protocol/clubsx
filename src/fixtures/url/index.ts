export const replaceWithFwdHost = (base: Request) => {
  const url = new URL(base.url)
  return url.href
}
