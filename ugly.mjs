import fs from 'fs-extra'

const path =
  './node_modules/@astrojs/vercel/dist/serverless/request-transform.js'
fs.outputFileSync(
  path,
  ((file) =>
    file.replace(
      'base + req.url',
      `(() => headers['x-rewritten-url'] ? headers['x-rewritten-url'] : base + req.url)(console.log(JSON.stringify(req)))`
    ))(fs.readFileSync(path, 'utf8'))
)
