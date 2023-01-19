import { rewrite, next } from '@vercel/edge'

export const config = {
  matcher: ['/((?!api|assets|chunks|_vercel|[\\w-]+\\.\\w+).*)'],
}

export default function middleware(req: Request) {
  const url = new URL(req.url)

  const hostnames = req.headers.get('host')?.split('.') ?? []
  const [tenant] = hostnames
  const html = req.headers.get('accept')?.includes('text/html')

  if (html && hostnames.length > Number(process.env.DOMAIN_LENGTH)) {
    const pathname = `/sites_/${tenant}${url.pathname}`
    const destination = new URL(pathname, url.origin)
    return rewrite(destination, {
      headers: { 'x-rewritten-url': destination.href },
    })
  }

  return next()
}
