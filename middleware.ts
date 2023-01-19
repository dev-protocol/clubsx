import { rewrite, next } from '@vercel/edge'

const knownApp = /\w+\.(preview|preview-preview-preview)\.\w+\.\w+$/

export const config = {
  matcher: ['/((?!api|assets|chunks|_vercel|[\\w-]+\\.\\w+).*)'],
}

export default function middleware(req: Request) {
  const url = new URL(req.url)

  const host = req.headers.get('host') ?? ''
  const hostnames = host.split('.') ?? []
  const [tenant] = hostnames
  const html = req.headers.get('accept')?.includes('text/html')

  if (html && knownApp.test(host)) {
    const pathname = `/sites_/${tenant}${url.pathname}`
    const destination = new URL(pathname, url.origin)
    return rewrite(destination, {
      headers: { 'x-rewritten-url': destination.href },
    })
  }

  return next()
}
