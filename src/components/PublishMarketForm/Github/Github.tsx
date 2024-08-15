import React from 'react'
import type { UndefinedOr } from '@devprotocol/util-ts'

import { Market } from '../types'

interface IGithubButtonProps {
  domain: string
  market: UndefinedOr<Market>
  changeMarket: (market: Market) => void
}

const GithubButtonProps = (props: IGithubButtonProps) => {
  const onClickGithub = () => {
    props.changeMarket(Market.GITHUB)

    const tokenizePageState: { clubsDomain: string } = {
      clubsDomain: props.domain,
    }
    const stateParam = encodeURIComponent(
      window.btoa(JSON.stringify(tokenizePageState)),
    )

    window.location.assign(
      `${location.protocol}//${location.host}/auth/callback/github?state=${stateParam}` as string,
    )
  }

  return (
    <button
      onClick={onClickGithub}
      className={`hs-button is-large is-filled flex flex-col items-center justify-center gap-2.5 text-surface-ink border-surface-200 bg-surface-300 hover:bg-surface-400 ${
        props.market !== Market.GITHUB && 'opacity-50'
      } self-stretch justify-self-stretch h-full max-h-full min-h-full`}
      id="github-icon"
      name="github-icon"
    >
      <span className="h-auto w-auto">
        <svg
          width="33"
          height="32"
          viewBox="0 0 33 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M16.341 2.6665C13.1603 2.66794 10.0882 3.82398 7.69567 5.91984C5.26986 8.04689 3.66859 10.9587 3.17167 14.1465C2.66377 17.3477 3.28453 20.6259 4.92767 23.4198C6.54676 26.1806 9.10094 28.2703 12.1277 29.3105C12.7997 29.4372 13.0383 29.0132 13.0383 28.6518C13.0383 28.3252 13.025 27.2492 13.0197 26.1078C9.31301 26.9345 8.53167 24.4945 8.53167 24.4945C8.29055 23.6737 7.76613 22.965 7.05167 22.4945C5.84234 21.6452 7.14501 21.6665 7.14501 21.6665C7.56767 21.7252 7.97167 21.8838 8.32501 22.1278C8.67967 22.3718 8.97434 22.6958 9.18767 23.0745C9.36767 23.4118 9.61167 23.7092 9.90501 23.9478C10.3418 24.3093 10.8789 24.5282 11.444 24.5749C12.009 24.6217 12.5748 24.494 13.065 24.2092C13.125 23.5158 13.425 22.8678 13.9117 22.3825C10.953 22.0372 7.83967 20.8652 7.83967 15.6225C7.81932 14.2707 8.31031 12.9611 9.21434 11.9558C8.80634 10.776 8.85196 9.48655 9.34234 8.3385C9.34234 8.3385 10.461 7.97184 13.0077 9.7385C15.1895 9.1262 17.4978 9.1262 19.6797 9.7385C22.221 7.97184 23.333 8.3385 23.333 8.3385C23.8263 9.4825 23.8743 10.7758 23.4677 11.9558C24.3713 12.9611 24.8614 14.2709 24.8397 15.6225C24.8397 20.8745 21.721 22.0292 18.7543 22.3665C19.0745 22.7008 19.3205 23.0989 19.4765 23.5347C19.6325 23.9705 19.6949 24.4343 19.6597 24.8958C19.6597 26.7252 19.6437 28.1985 19.6437 28.6478C19.6437 29.0105 19.8837 29.4372 20.5597 29.3038C23.5808 28.2588 26.1288 26.1681 27.7437 23.4092C29.3836 20.6175 30.0024 17.3427 29.4943 14.1452C28.997 10.9603 27.3973 8.05116 24.9743 5.92517C22.586 3.8304 19.5192 2.67264 16.3423 2.6665H16.341Z"
            fill="currentColor"
          />
        </svg>
      </span>
      Github
    </button>
  )
}

export default GithubButtonProps
