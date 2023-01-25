import { rewrite, next } from '@vercel/edge'

export const config = {
  matcher: ['/((?!api|assets|chunks|_vercel|[\\w-]+\\.\\w+).*)'],
}

const redirects = [
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

  const matchToRedirects = redirects.find(({ host }) => host === url.host)

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

  if (html && hosts.includes(url.host)) {
    const pathname = `/sites_/${tenant}${url.pathname}`
    const destination = new URL(pathname, url.origin)
    return rewrite(destination, {
      headers: { 'x-rewritten-url': destination.href },
    })
  }

  return next()
}
