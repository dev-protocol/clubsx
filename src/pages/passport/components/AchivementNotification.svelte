<script lang="ts">
  import { onMount } from 'svelte'
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import type { connection as Connection } from '@devprotocol/clubs-core/connection'

  export let address: string | undefined

  let connection: UndefinedOr<typeof Connection> = undefined
    let achievements
  let eoa: UndefinedOr<string> = undefined

const fetchAchievement = async (eoa) => {
    const achievementResults = await fetch(
        `/api/notification/achievements/${eoa}`
    ).then((res) => res.json())
    if (achievementResults.achievements.length > 0) {
        achievements = achievementResults.achievements
    }
}

  onMount(async () => {
    const { connection: _conn } = await import(
      '@devprotocol/clubs-core/connection'
    )
    connection = _conn
    eoa = connection()?.account?.getValue()
    connection().account.subscribe((acc) => {
        fetchAchievement(acc)
      eoa = acc
    })
  })
</script>

{#if eoa === address}
<div
  class="flex flex-col justify-center items-center gap-[7px] w-full py-2 px-4 absolute rounded-b-2xl bg-[#FDAD00] shadow-lg z-50"
>
{#if achievements}
  {#each achievements as achievement}
  <div class="flex w-[1024px] justify-between items-center">
    <!-- left side -->
    <div class="flex items-center gap-[53px]">
      <span class="text-black font-dm-sans text-[11px] font-normal">
        You have a claimable reward by {achievement.clubsName}
      </span>
      <span class="text-black font-dm-sans text-[15px] italic font-bold">
        {achievement.achievementName}
      </span>
    </div>
    <!-- right side -->
    <div class="flex">
      <button class="hs-button is-filled"
      on:click={
        () => {
            window.open(achievement.achievementUrl, '_blank')
        }
      }
      > Claim </button>
    </div>
  </div>
  {/each}
{/if}
</div>
{/if}
