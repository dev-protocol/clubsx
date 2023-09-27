export enum Status {
  Success = 'success',
}

export const createRequestBody = ({
  status,
  account,
  paymentGateway,
}: {
  status: Status
  account: string
  paymentGateway: Record<string, any>
}): string =>
  JSON.stringify({
    status,
    account,
    paymentGateway,
  })
