import { rewrite } from '@vercel/edge'

export const config = {
  matcher: ['/((?!api|[\\w-]+\\.\\w+).*)'],
}

export default function middleware(req: Request) {
  const url = new URL(req.url)

  const hostname = req.headers.get('host')?.split('.') ?? []
  const [tenant] = hostname
  const html = req.headers.get('accept')?.includes('text/html')

  if (html) {
    url.pathname = `/sites_/${tenant}${url.pathname}`
    return rewrite(new URL(url.pathname, 'https://clubs.place'))
  }

  return req
}
