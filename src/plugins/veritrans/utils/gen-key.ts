import { meta } from '..'

export const generateFulFillmentParamsId = (orderId: string) =>
  `${meta.id}:order:params:${orderId}`
