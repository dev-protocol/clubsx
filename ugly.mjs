import fs from 'fs-extra'

const path =
  './node_modules/@astrojs/vercel/dist/serverless/request-transform.js'
fs.outputFileSync(
  path,
  ((file) =>
    file.replace(
      'base + req.url',
      `(()=>headers['x-rewrited-url'] ? headers['x-rewrited-url'] : base + req.url)(console.log({headers}))`
    ))(fs.readFileSync(path, 'utf8'))
)
