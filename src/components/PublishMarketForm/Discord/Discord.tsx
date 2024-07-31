import React from 'react'
import type { UndefinedOr } from '@devprotocol/util-ts'

import { Market } from '../types'

interface IDiscordButtonProps {
  market: UndefinedOr<Market>
  changeMarket: (market: Market) => void
}

const DiscordMarketButton = (props: IDiscordButtonProps) => {
  const onAuthDiscordAccount = () => {
    props.changeMarket(Market.DISCORD)

    const clientId = import.meta.env.PUBLIC_DISCORD_CLIENT_ID
    const redirectUri = encodeURI(
      (`${location.protocol}//${location.host}/auth/callback/discord` as string) ||
        '',
    )
    const scope = encodeURI('guilds')
    const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&prompt=consent`

    window.location.assign(url)
  }

  return (
    <button
      onClick={onAuthDiscordAccount}
      className={`hs-button is-large is-filled flex flex-col max-w-[33%] grow items-center justify-center gap-2.5 ${
        props.market !== Market.DISCORD && 'opacity-50'
      } self-stretch justify-self-stretch h-full max-h-full min-h-full`}
      id="discord-icon"
      name="discord-icon"
      disabled={props.market === Market.DISCORD}
    >
      <span className="h-auto w-auto">
        <svg
          width="28"
          height="22"
          viewBox="0 0 28 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M23.256 2.40814C21.5074 1.58851 19.6573 1.0056 17.7547 0.674805C17.4949 1.15145 17.2595 1.64097 17.0493 2.14147C15.0286 1.83347 12.9728 1.83347 10.952 2.14147C10.7402 1.64036 10.5021 1.15079 10.2387 0.674805C8.33457 1.00485 6.48308 1.58778 4.73334 2.40814C1.65283 6.97278 0.297293 12.4847 0.909342 17.9575C2.89858 19.4611 5.13919 20.5992 7.52668 21.3188C8.07334 20.5668 8.55734 19.7721 8.97201 18.9388C8.18234 18.6384 7.42109 18.268 6.69734 17.8321C6.88801 17.6908 7.07468 17.5428 7.25468 17.3908C9.35904 18.4038 11.6645 18.9298 14 18.9298C16.3355 18.9298 18.641 18.4038 20.7453 17.3908C20.928 17.5428 21.1147 17.6908 21.3027 17.8321C20.5773 18.2695 19.8147 18.6401 19.0227 18.9415C19.4377 19.7735 19.9211 20.5696 20.468 21.3215C22.9025 20.5689 25.1873 19.398 27.22 17.8615C27.7804 12.4027 26.3748 6.92311 23.256 2.40814ZM9.57068 14.7508C8.8926 14.7028 8.26067 14.3899 7.81154 13.8796C7.36241 13.3694 7.13219 12.7028 7.17068 12.0241C7.12791 11.3442 7.35656 10.675 7.80646 10.1633C8.25637 9.6517 8.89082 9.33935 9.57068 9.2948C9.90805 9.31479 10.2381 9.40145 10.5418 9.54977C10.8455 9.6981 11.1167 9.90514 11.3399 10.1589C11.5631 10.4127 11.7337 10.7082 11.842 11.0284C11.9503 11.3485 11.994 11.687 11.9707 12.0241C12.0131 12.7038 11.7842 13.3724 11.3343 13.8836C10.8844 14.3947 10.2502 14.7066 9.57068 14.7508ZM18.4293 14.7508C17.7513 14.7028 17.1193 14.3899 16.6702 13.8796C16.2211 13.3694 15.9909 12.7028 16.0293 12.0241C15.9866 11.3442 16.2152 10.675 16.6651 10.1633C17.115 9.6517 17.7495 9.33935 18.4293 9.2948C18.7667 9.31497 19.0966 9.40174 19.4002 9.55012C19.7038 9.6985 19.975 9.90555 20.1981 10.1593C20.4213 10.4131 20.5919 10.7085 20.7003 11.0286C20.8086 11.3487 20.8525 11.687 20.8293 12.0241C20.8714 12.7037 20.6424 13.3722 20.1926 13.8832C19.7427 14.3943 19.1087 14.7062 18.4293 14.7508Z"
            fill="white"
          />
        </svg>
      </span>
      Discord
    </button>
  )
}

export default DiscordMarketButton
