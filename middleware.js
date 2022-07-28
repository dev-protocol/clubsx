export const config = {
  matcher: [
    '/',
    '/([^/.]*)', // exclude `/public` files by matching all paths except for paths containing `.` (e.g. /logo.png)
    '/_sites/:path*', // for all custom hostnames under the `/_sites/[site]*` dynamic route (demo.vercel.pub, platformize.co)
  ],
}

export default function middleware(req) {
  const url = req.nextUrl

  const hostname = (req.headers.get('host') || 'demo.vercel.pub').split('.')
  const [tenant] = hostname
  const html = req.headers.get('accept')?.includes('text/html')

  if (hostname.length < 4) {
    return req
  }

  if (html) {
    url.pathname = `/_sites/${tenant}${url.pathname}`
    return new Response(url)
  }

  return req
}
