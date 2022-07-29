import fs from 'fs-extra'

const path =
  './node_modules/@astrojs/vercel/dist/serverless/request-transform.js'
fs.outputFileSync(
  path,
  ((file) =>
    file.replace(
      'base + req.url',
      `headers['x-middleware-rewrite'] ? headers['x-middleware-rewrite'] : base + req.url`
    ))(fs.readFileSync(path, 'utf8'))
)
