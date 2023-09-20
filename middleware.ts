import { rewrite, next } from '@vercel/edge'
import builtInApiPaths from './built-in-api-paths'

const hosts = (process.env.HOSTS ?? 'clubs.place')
  .split(',')
  .map((x) => x.trim())
  .sort((a, b) => (a.split('.').length < b.split('.').length ? 0 : -1))

export const config = {
  matcher: ['/((?!assets|chunks|_vercel|[\\w-]+\\.\\w+).*)'],
}

const redirects = [
  ...hosts.map((host) => ({
    host,
    matchers: [
      '/',
      new RegExp('^/(plugins|dev-tokens|blog|post|pricing)(|/.*)$'),
    ],
    destination: 'https://www.clubs.place',
  })),
  {
    host: 'temples.clubs.stakes.social',
    matchers: undefined,
    destination: 'https://temples.clubs.place',
  },
  {
    host: 'kougenji.clubs.stakes.social',
    matchers: undefined,
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
              : matcher.test(url.pathname),
          )
        : true),
  )

  if (matchToRedirects) {
    return Response.redirect(
      new URL(
        `${url.pathname}${url.search ? url.search : ''}`,
        matchToRedirects.destination,
      ),
    )
  }

  const hostnames = url.host.split('.') ?? []
  const [tenant] = hostnames
  const html =
    req.headers.get('accept')?.includes('text/html') ||
    url.pathname
      .split('/')
      .slice(-1)
      .every((p) => !/\..+$/.test(p))
  const bInApi = builtInApiPaths.some((p) => url.pathname.startsWith(p))
  const pInApi = url.pathname.startsWith('/api/') && !bInApi

  const primaryHost =
    hosts.find((h) => url.host === h) ?? hosts.find((h) => url.host.endsWith(h))

  if (bInApi && primaryHost && url.host !== primaryHost) {
    const destination = new URL(url.href)
    destination.host = primaryHost
    return rewrite(destination, {
      headers: { 'x-rewritten-url': destination.href },
    })
  }

  if ((html || pInApi) && primaryHost && url.host !== primaryHost) {
    const destination = new URL(url.href)
    destination.pathname = `/sites_/${tenant}${url.pathname}`
    return rewrite(destination, {
      headers: { 'x-rewritten-url': destination.href },
    })
  }

  return next()
}
