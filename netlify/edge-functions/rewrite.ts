import type { Context } from 'https://edge.netlify.com'

export default async (request: Request, context: Context) => {
  console.log('request.url', request.url)

  const url = new URL(request.url)
  const hostnames = request.headers.get('host')?.split('.') ?? []
  const [tenant] = hostnames
  const html = request.headers.get('accept')?.includes('text/html')

  if (html && hostnames.length > 3) {
    const pathname = `/sites_/${tenant}${url.pathname}`
    const destination = new URL(pathname, url.origin)
    return context.rewrite(destination)
  }

  return context.next()
}
