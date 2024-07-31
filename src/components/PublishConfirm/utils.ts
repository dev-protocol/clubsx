import type { UndefinedOr } from '@devprotocol/util-ts'

import { Market, type MarketAddressOptions } from './types'

export const selectMarketAddressOption = (
  market: Market,
  options: MarketAddressOptions,
): UndefinedOr<string> => {
  switch (market) {
    case Market.GITHUB:
      return options.github

    case Market.YOUTUBE:
      return options.youtube

    case Market.DISCORD:
      return options.discord

    default:
      return
  }
}
