import { whenDefined } from '@devprotocol/util-ts'

export const replaceWithFwdHost = (base: Request) => {
  const url = new URL(base.url)
  const forwarded = base.headers.get('forwarded') // i.g., for=12.345.67.890;host=xxx.clubs.place;proto=https;sig=0QmV…iOTE=;exp=1696430045
  const list = whenDefined(forwarded, (fwd) => fwd.split(';'))
  const regHeader = /^host=(.*)/i
  const regParam = /\/sites_\/([a-z|0-9|-]+)\/?/i
  const hostHeader = whenDefined(list, (li) =>
    li.find((val) => regHeader.test(val)),
  )?.replace(regHeader, '$1')
  const hostParam = regParam.test(url.href)
    ? `${url.href.match(regParam)?.[1]}.${url.host}`
    : undefined
  console.log({ forwarded, host: hostHeader, 'base.url': base.url })
  return url.href
    .replace(
      url.host,
      url.host === hostHeader ? hostParam ?? url.host : hostHeader ?? url.host,
    )
    .replace(regParam, '/')
}
