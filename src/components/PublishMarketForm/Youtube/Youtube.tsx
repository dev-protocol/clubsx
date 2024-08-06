import React from 'react'
import type { UndefinedOr } from '@devprotocol/util-ts'

import { Market } from '../types'

interface IYoutubeButtonProps {
  domain: string
  market: UndefinedOr<Market>
  changeMarket: (market: Market) => void
}

const YoutubeMarketButton = (props: IYoutubeButtonProps) => {
  const onAuthYoutubeAccount = () => {
    const clientId = import.meta.env.VITE_YOUTUBE_CLIENT_ID
    const redirectUri = encodeURI(
      (`${location.protocol}//${location.host}/auth/callback/youtube` as string) ||
        '',
    )
    const scope = encodeURI(
      'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.email',
    )
    const tokenizePageState: { clubsDomain: string } = {
      clubsDomain: props.domain,
    }
    const stateParam = encodeURIComponent(
      window.btoa(JSON.stringify(tokenizePageState)),
    )
    const url = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=token&state=${stateParam}`

    window.location.assign(url)
  }

  return (
    <button
      onClick={onAuthYoutubeAccount}
      className={`hs-button is-large is-filled flex flex-col max-w-[33%] grow items-center justify-center gap-2.5 ${
        props.market !== Market.YOUTUBE && 'opacity-50'
      } self-stretch justify-self-stretch h-full max-h-full min-h-full`}
      id="youtube-icon"
      name="youtube-icon"
      disabled={props.market === Market.YOUTUBE}
    >
      <span className="h-auto w-auto">
        <svg
          width="27"
          height="20"
          viewBox="0 0 27 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M26.5996 4.71591C26.4749 3.76842 26.113 2.86774 25.5476 2.09725C24.847 1.39144 23.8968 0.989617 22.9023 0.978581C19.213 0.711914 13.6676 0.711914 13.6676 0.711914C13.6676 0.711914 8.12497 0.711914 4.43031 0.978581C3.43619 0.989393 2.48631 1.39128 1.78631 2.09725C1.21845 2.86699 0.855955 3.76865 0.732975 4.71725C0.568181 6.13638 0.479165 7.5633 0.466309 8.99191V10.9919C0.479099 12.4205 0.568115 13.8474 0.732975 15.2666C0.858309 16.2159 1.21831 17.1199 1.77831 17.8959C2.58364 18.6106 3.61831 19.0119 4.69431 19.0266C6.80498 19.2279 13.669 19.2932 13.669 19.2932C13.669 19.2932 19.217 19.2932 22.9063 19.0266C23.9013 19.015 24.8519 18.6127 25.553 17.9066C26.1171 17.1352 26.478 16.2341 26.6023 15.2866C26.7672 13.8674 26.8562 12.4405 26.869 11.0119V8.99058C26.8539 7.56196 26.764 6.13512 26.5996 4.71591ZM11.0103 13.4546V5.96125L18.2103 9.71991L11.0103 13.4546Z"
            fill="white"
          />
        </svg>
      </span>
      Youtube
    </button>
  )
}

export default YoutubeMarketButton
