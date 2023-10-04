import { whenDefined } from '@devprotocol/util-ts'

export const replaceWithFwdHost = (base: Request) => {
  const url = new URL(base.url)
  const forwarded = base.headers.get('forwarded') // i.g., for=12.345.67.890;host=xxx.clubs.place;proto=https;sig=0QmV…iOTE=;exp=1696430045
  const list = whenDefined(forwarded, (fwd) => fwd.split(';'))
  const host = whenDefined(list, (li) =>
    li.find((val) => /^host=.*/i.test(val)),
  )
  return url.href.replace(url.host, host ?? url.host)
}
