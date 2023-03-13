import { rewrite, next } from '@vercel/edge'

export const config = {
  matcher: ['/((?!api|assets|chunks|_vercel|[\\w-]+\\.\\w+).*)'],
}

const redirects = [
  {
    host: 'clubs.place',
    matchers: ['/', new RegExp('^/(plugins|dev|blog|pricing)(|/.*)$')],
    destination: 'https://www.clubs.place',
  },
  {
    tenant: 'temples',
    host: 'temples.clubs.stakes.social',
    destination: 'https://temples.clubs.place',
  },
  {
    tenant: 'kougenji',
    host: 'kougenji.clubs.stakes.social',
    destination: 'https://kougenji.clubs.place',
  },
]

export default function middleware(req: Request) {
  const url = new URL(req.url)

  const matchToRedirects = redirects.find(
    ({ host, matchers }) =>
      host === url.host &&
      (matchers
        ? matchers.some((matcher) =>
            typeof matcher === 'string'
              ? matcher === url.pathname
              : matcher.test(url.pathname)
          )
        : true)
  )

  if (matchToRedirects) {
    return Response.redirect(
      new URL(
        `${url.pathname}${url.search ? url.search : ''}`,
        matchToRedirects.destination
      )
    )
  }

  const hostnames = url.host.split('.') ?? []
  const [tenant] = hostnames
  const html = req.headers.get('accept')?.includes('text/html')
  const hosts = (process.env.HOSTS ?? 'clubs.place')
    .split(',')
    .map((x) => x.trim())

  const primaryHost =
    hosts.find((h) => url.host === h) ?? hosts.find((h) => url.host.endsWith(h))

  if (html && primaryHost && url.host !== primaryHost) {
    const pathname = `/sites_/${tenant}${url.pathname}`
    const destination = new URL(pathname, url.origin)
    return rewrite(destination, {
      headers: { 'x-rewritten-url': destination.href },
    })
  }

  return next()
}
