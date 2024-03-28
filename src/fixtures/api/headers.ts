export const json = {
  'content-type': 'application/json;charset=UTF-8',
}

export const cors = {
  'access-control-allow-origin': '*',
}

export const cache = ({ maxAge }: { maxAge: number }) => ({
  'cache-control': `public, max-age=${maxAge}`,
})

export const headers = {
  ...json,
  ...cors,
}
