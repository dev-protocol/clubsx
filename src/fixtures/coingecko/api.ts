export const usdByDev = async (dev: number) => {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=dev-protocol&vs_currencies=usd',
  )
  const data = (await res.json()) as { 'dev-protocol': { usd: number } }
  return dev * data['dev-protocol'].usd
}

export const usdByCurrency = async (
  amount: number,
  coinGeckoCurrencyId: string,
) => {
  console.log('here')
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoCurrencyId}&vs_currencies=usd`,
  )
  const data = await res.json()
  return amount * data[coinGeckoCurrencyId].usd
}
