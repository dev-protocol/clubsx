import { NextResponse } from 'next/server'

export const config = {
  matcher: [
    '/',
    '/([^/.]*)', // exclude `/public` files by matching all paths except for paths containing `.` (e.g. /logo.png)
    '/_sites/:path*', // for all custom hostnames under the `/_sites/[site]*` dynamic route (demo.vercel.pub, platformize.co)
  ],
}

export default function middleware(req) {
  const url = req.nextUrl

  const hostname = req.headers.get('host') || 'demo.vercel.pub'
  const [tenant] = hostname.split('.')
  const html = req.headers.get('accept')?.includes('text/html')

  if (tenant === 'localhost' || tenant === 'clubsx') {
    return req
  }

  if (html) {
    url.pathname = `/_sites/${tenant}${url.pathname}`
    return NextResponse.rewrite(url)
  }

  return req
}
