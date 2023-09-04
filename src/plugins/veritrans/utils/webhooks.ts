import fetch from 'cross-fetch'

export enum Status {
  Success = 'success',
}

export const fetchWebhook = async (req: Request): Promise<Response> => {
  return fetch(req)
}

export const createRequest = ({
  status,
  base,
  account,
  paymentGateway,
}: {
  status: Status
  base: string
  account: string
  paymentGateway: Record<string, any>
}): Request => {
  const url = new URL(base)
  const body = {
    status,
    account,
    paymentGateway,
  }
  const req = new Request(url, { method: 'POST', body: JSON.stringify(body) })
  return req
}
