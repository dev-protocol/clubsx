/* eslint-disable no-undef */
import fs from 'fs-extra'

const path =
  './node_modules/@astrojs/vercel/dist/serverless/request-transform/node18.js'

const fn = () => {
  console.log('@', process.env.DOMAIN_LENGTH)
  const paths = req.headers.host.split('.')
  const urlFromHeader = headers['x-rewritten-url']
  return (
    urlFromHeader ||
    (paths.length > process.env.DOMAIN_LENGTH
      ? base + '/sites_/' + paths[0] + req.url
      : base + req.url)
  )
}

fs.outputFileSync(
  path,
  ((file) => file.replace('base + req.url', `(${fn.toString()})()`))(
    fs.readFileSync(path, 'utf8')
  )
)
