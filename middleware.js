export const config = {
  matcher: [
    '/',
    '/([^/.]*)', // exclude `/public` files by matching all paths except for paths containing `.` (e.g. /logo.png)
    '/sites_/:path*', // for all custom hostnames under the `/_sites/[site]*` dynamic route (demo.vercel.pub, platformize.co)
  ],
}

export default function middleware(req) {
  const url = new URL(req.url)
  console.log('***', 1)

  const hostname = (req.headers.get('host') || 'demo.vercel.pub').split('.')
  const [tenant] = hostname
  const html = req.headers.get('accept')?.includes('text/html')

  const headers = new Headers()
  if (html && hostname.length > 3) {
    console.log('***', 3)
    url.pathname = `/sites_/${tenant}${url.pathname}`
    headers.set('x-middleware-rewrite', url.href)
    headers.set('x-rewrited-url', url.href)
    return new Response(null, { headers })
  }

  console.log('***', 4)
  headers.set('x-middleware-rewrite', url.href)
  return new Response(null, { headers })
}
