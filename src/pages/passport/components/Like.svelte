<script lang="ts">
  import humanNumber from 'human-number'
  import type { UndefinedOr } from '@devprotocol/util-ts'

  import FlyingHeart from './FlyingHeart.svelte'

  export let props: {
    profileId: string
    currentLikes: number
    skinId: UndefinedOr<string>
  }

  const { profileId, skinId, currentLikes } = props

  let pendingLikes = 0
  let clicks: number[] = []
  let localLikeState = currentLikes

  let timeoutId: NodeJS.Timeout
  let intervalId: NodeJS.Timeout

  $: {
    if (clicks.length !== 0) {
      setTimeout(() => {
        const [_, ...next] = clicks
        clicks = next
      }, 2100)
    }
  }

  const like = () => {
    // Optimistically update local like state for better UX.
    localLikeState = localLikeState + 1
    clicks = [...clicks, localLikeState]
    pendingLikes += 1

    // Clear the previous interval and set a new one.
    clearTimeout(timeoutId)

    timeoutId = setTimeout(async () => {
      if (pendingLikes === 0) return clearInterval(intervalId)
      await submitLikes()
    }, 1000)
  }

  const submitLikes = async () => {
    if (pendingLikes === 0) {
      // Only proceed if there are pending likes.
      return
    }

    try {
      const res = await fetch(`/api/profile/updateLike`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId: profileId,
          skinId: skinId,
          likesCount: pendingLikes,
        }),
      })

      if (res.ok) {
        pendingLikes = 0 // Reset the pending likes on successful submission.
      } else {
        console.error('Failed to update likes:', res.statusText)
      }
    } catch (error) {
      console.error('Network error while updating likes:', error)
    }
  }
</script>

<div>
  {#each clicks as click (`key-${click}`)}
    <FlyingHeart />
    {#if Math.random() > 0.8}
      <FlyingHeart />
    {/if}
  {/each}

  <button
    on:click={() => like()}
    class="flex shadow border border-black/10 justify-items-center items-center flex-col rounded-full size-16 lg:size-20 bg-white text-black transition active:scale-110"
    title={`${BigInt(localLikeState).toString()} Likes`}
  >
    {#each clicks as click (`key-${click}`)}
      <span class="absolute font-bold animate-[up_1s_ease-in-out_forwards]">
        {click}
      </span>
    {/each}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1"
      stroke="currentColor"
      class="size-10 lg:size-12"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
      />
    </svg>
    <span>
      {humanNumber(localLikeState)}
    </span>
  </button>
</div>

<style>
  @keyframes -global-up {
    0% {
      transform: translateY(0);
      opacity: 100%;
    }
    80% {
      transform: translateY(-50%);
    }
    100% {
      transform: translateY(-52%);
      opacity: 0%;
    }
  }
</style>
