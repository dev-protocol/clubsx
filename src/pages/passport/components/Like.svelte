<script lang="ts">
  import PQueue from 'p-queue'
  export let props: {
    profileId: string
    skinIndex: number
    currentLikes: number
  }

  const queue = new PQueue({ concurrency: 1 })

  const { profileId, skinIndex, currentLikes } = props
  let localLikeState = currentLikes
  const like = () => {
    // / Optimistically update local like state for better UX
    localLikeState = localLikeState + 1
    //  Add the request to the queue
    queue.add(async () => {
      const res = await fetch(`/api/profile/updateLike`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileId: profileId, skinIndex: skinIndex }),
      })
      // revert the local like state if the request fails
      if (res.status !== 200) {
        localLikeState = localLikeState - 1
      }
    })
  }
</script>

<div>
  <button on:click={() => like()}>
    <span>
      {localLikeState}
    </span>
    <svg
      width="106"
      height="106"
      viewBox="0 0 106 106"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d_3007_3750)">
        <rect x="11" y="7" width="84" height="84" rx="42" fill="white" />
        <path
          d="M72.5 32.375C72.5 26.9908 67.9522 22.625 62.3427 22.625C58.1502 22.625 54.5492 25.0647 53 28.5465C51.4508 25.0647 47.8498 22.625 43.6552 22.625C38.05 22.625 33.5 26.9908 33.5 32.375C33.5 48.0183 53 58.375 53 58.375C53 58.375 72.5 48.0183 72.5 32.375Z"
          stroke="black"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path d="M52.12 79.5V70.4H53.875V79.5H52.12Z" fill="white" />
      </g>
      <defs>
        <filter
          id="filter0_d_3007_3750"
          x="0"
          y="0"
          width="106"
          height="106"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="5.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_3007_3750"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_3007_3750"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  </button>
</div>
