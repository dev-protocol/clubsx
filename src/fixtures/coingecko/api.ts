import { whenDefined, whenNotError, type ErrorOr } from '@devprotocol/util-ts'

type Res = {
  price: number
  error?: Error
}

const call = async (id: string, vs: string) => {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${vs}`,
    { cache: 'default' },
  ).catch((err: Error) => err)
  const data: ErrorOr<{ [key: typeof id]: { [key: string]: number } }> =
    await whenNotError(res, (_res) =>
      _res.ok
        ? _res.json().catch((err: Error) => err)
        : new Error('Faild to fetch'),
    )
  const price =
    data instanceof Error
      ? data
      : whenDefined(data?.[id]?.[vs], (p) => p) ?? new Error('Price not found')
  return price
}

export const usdByDev = async (dev: number): Promise<Res> => {
  const price = await call('dev-protocol', 'usd')
  return price instanceof Error
    ? { price: 0, error: price }
    : { price: dev * price }
}

export const usdByCurrency = async (
  amount: number,
  coinGeckoCurrencyId: string,
): Promise<Res> => {
  const price = await call(coinGeckoCurrencyId, 'usd')
  return price instanceof Error
    ? { price: 0, error: price }
    : { price: amount * price }
}
