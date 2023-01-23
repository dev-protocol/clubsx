import fs from 'fs-extra'

const pathToRequestTransform =
  './node_modules/@astrojs/vercel/dist/serverless/request-transform/node18.js'
const pathToEntrypoint =
  './node_modules/@astrojs/vercel/dist/serverless/entrypoint.js'

fs.outputFileSync(
  pathToRequestTransform,
  ((file) =>
    file.replace(
      'base + req.url',
      `headers['x-rewritten-url'] ? headers['x-rewritten-url'] : base + req.url`
    ))(fs.readFileSync(pathToRequestTransform, 'utf8'))
)

fs.outputFileSync(
  pathToEntrypoint,
  ((file) =>
    file.replace('err.status', `(()=>err.status)(console.log({err}))`))(
    fs.readFileSync(pathToEntrypoint, 'utf8')
  )
)
