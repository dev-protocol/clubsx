import type { ClubsConfiguration } from '@devprotocol/clubs-core'
import { whenDefined } from '@devprotocol/util-ts'

/**
 * Get original host name from forwarded header
 * @param forwarded forwarded header i.g., for=12.345.67.890;host=xxx.clubs.place;proto=https;sig=0QmV…iOTE=;exp=1696430045
 * @returns host name i.g., xxx.clubs.place
 */
const getHost = (forwarded: string): string | undefined => {
  const list = whenDefined(forwarded, (fwd) => fwd.split(';'))
  const regHeader = /^host=(.*)/i
  const host = whenDefined(list, (li) =>
    li.find((val) => regHeader.test(val)),
  )?.replace(regHeader, '$1')
  return host
}

export const replaceWithFwdHost = (base: Request) => {
  const url = new URL(base.url)
  const forwarded = base.headers.get('forwarded')
  const regParam = /\/sites_\/([a-z|0-9|-]+)\/?/i
  const host = whenDefined(forwarded, getHost)
  const hostParam = regParam.test(url.href)
    ? `${url.href.match(regParam)?.[1]}.${url.host}`
    : undefined
  console.log({ forwarded, host, 'base.url': base.url })
  return url.href
    .replace(
      url.host,
      url.host === host ? (hostParam ?? url.host) : (host ?? url.host),
    )
    .replace(regParam, '/')
}

const hosts = [
  ...(process.env.HOSTS ?? 'clubs.place').split(','),
  'localhost',
].map((x) => x.trim())

export const replaceUrlConfigWithLocal = (
  config: ClubsConfiguration,
  req: Request,
  url: URL,
  site?: string,
): ClubsConfiguration => {
  const forwarded = req.headers.get('forwarded')
  console.log('$forwarded$', forwarded)
  console.log('$url$', url)
  const reqHost = whenDefined(forwarded, getHost)
  const configUrl = new URL(config.url)
  const hasReqHostTenant = hosts.every((h) => h !== reqHost) // If it's true, host name includes tenant name
  const newUrl =
    configUrl.host === reqHost
      ? config.url
      : reqHost && hasReqHostTenant
        ? config.url.replace(configUrl.host, reqHost)
        : `${url.origin}/${site}`
  return { ...config, url: newUrl }
}
