import fs from 'fs-extra'

const path =
  './node_modules/@astrojs/vercel/dist/serverless/request-transform.js'
fs.outputFileSync(
  path,
  ((file) =>
    file.replace(
      `base + req.url,`,
      `(()=>headers['x-rewritten-url'] ? headers['x-rewritten-url'] : base + req.url)(),`
    ))(fs.readFileSync(path, 'utf8'))
)
fs.outputFileSync(
  './node_modules/@astrojs/vercel/dist/serverless/entrypoint.js',
  ((file) =>
    file.replace(
      `, req);`,
      `, req).then(resultofgetrequest => { console.log({resultofgetrequest}); return resultofgetrequest;});`
    ))(
    fs.readFileSync(
      './node_modules/@astrojs/vercel/dist/serverless/entrypoint.js',
      'utf8'
    )
  )
)
fs.outputFileSync(
  './node_modules/@astrojs/vercel/dist/serverless/entrypoint.js',
  ((file) =>
    file.replace(
      `err.status || 400`,
      `(()=> { console.log({err}); return err.status || 400;})()`
    ))(
    fs.readFileSync(
      './node_modules/@astrojs/vercel/dist/serverless/entrypoint.js',
      'utf8'
    )
  )
)
