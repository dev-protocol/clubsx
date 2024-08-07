import type { UndefinedOr } from '@devprotocol/util-ts'

export enum Market {
  GITHUB = 'GITHUB',
  YOUTUBE = 'YOUTUBE',
  DISCORD = 'DISCORD',
  INVALID = 'INVALID',
}

export interface IAuthCallbackProp {
  market: UndefinedOr<Market>
}
