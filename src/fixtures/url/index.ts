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
  url: URL,
  site?: string,
): ClubsConfiguration => {
  console.log('$url$', url)
  const configUrl = new URL(config.url)
  const isConfigSubdomainType = hosts.every((h) => h !== configUrl.host) // If it's true, host name includes tenant name
  const isRequestSubdomainType = url.pathname.startsWith('/sites_/')
  const newUrl =
    isConfigSubdomainType === true
      ? isRequestSubdomainType === true
        ? configUrl.host === url.host
          ? config.url
          : config.url.replace(configUrl.host, url.host)
        : isRequestSubdomainType === false
          ? `${config.url.replace(configUrl.host, url.host)}${site ? `/${site}` : ''}`
          : (0 as never)
      : isConfigSubdomainType === false
        ? isRequestSubdomainType === true
          ? url.origin
          : isRequestSubdomainType === false
            ? configUrl.host === url.host
              ? config.url
              : config.url.replace(configUrl.host, url.host)
            : (0 as never)
        : (0 as never)
  return { ...config, url: newUrl }
}
