import fetch from 'cross-fetch'

export enum Status {
  Used = 'used',
}

export const fetchWebhook = async (req: Request): Promise<Response> => {
  return fetch(req)
}

export const createRequest = ({
  status,
  base,
  account,
  id,
  benefit,
}: {
  status: Status
  base: string
  account: string
  id: string
  benefit: { id: string; description: string }
}): Request => {
  const url = new URL(base)
  const body = {
    status,
    id,
    account,
    benefit,
  }
  const req = new Request(url, { method: 'POST', body: JSON.stringify(body) })
  return req
}
