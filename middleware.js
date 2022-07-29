// export const config = {
//   matcher: [
//     '/',
//     '/([^/.]*)', // exclude `/public` files by matching all paths except for paths containing `.` (e.g. /logo.png)
//     '/_sites/:path*', // for all custom hostnames under the `/_sites/[site]*` dynamic route (demo.vercel.pub, platformize.co)
//   ],
// }

export default function middleware(req) {
  const url = new URL(req.url)
  console.log('***', 1)

  const hostname = (req.headers.get('host') || 'demo.vercel.pub').split('.')
  const [tenant] = hostname
  const html = req.headers.get('accept')?.includes('text/html')

  if (hostname.length < 4) {
    console.log('***', 2)
    return req
  }

  if (html) {
    console.log('***', 3)
    url.pathname = `/_sites/${tenant}${url.pathname}`
    const headers = new Headers(req.headers)
    console.log('url href is: ', url.href)
    headers.set('x-middleware-rewrite', url.href)
    return new Response(`${url.host}/${url.pathname}`, { headers, body: {} })
  }

  console.log('***', 4)
  return req
}
