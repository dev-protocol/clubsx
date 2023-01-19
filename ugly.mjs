import fs from 'fs-extra'

const path =
  './node_modules/@astrojs/vercel/dist/serverless/request-transform/node18.js'
fs.outputFileSync(
  path,
  ((file) =>
    file.replace(
      'base + req.url',
      `(() => headers['x-rewritten-url'] ? headers['x-rewritten-url'] : ((paths) => /\\w+\\.(preview)\\.\\w+\\.\\w+$/.test(req.headers.host) ? base + '/sites_/' + paths[0] + req.url : base + req.url)(req.headers.host.split('.')))()`
    ))(fs.readFileSync(path, 'utf8'))
)
