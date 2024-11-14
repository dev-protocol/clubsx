<script lang="ts">
  import { onMount } from 'svelte'
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import type { connection as Connection } from '@devprotocol/clubs-core/connection'

  export let address: string | undefined

  type AchievementClaimable = {
    clubsName: string
    achievementName: string
    achievementUrl: string
  }
  let connection: UndefinedOr<typeof Connection> = undefined
  let achievements: AchievementClaimable[] = []
  let showNotification = true
  let eoa: UndefinedOr<string> = undefined

  const fetchAchievement = async (eoa: string) => {
    const achievementResults = await fetch(
      `/api/notification/achievements/${eoa}`,
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
      eoa = acc
      if (eoa) {
        fetchAchievement(eoa)
      }
    })
  })
</script>

{#if eoa === address && achievements.length > 0}
  <div
    class="flex flex-col justify-center items-center gap-[7px] w-full py-2 px-4 absolute rounded-b-2xl bg-[#FDAD00] shadow-lg z-50"
  >
    {#if achievements && showNotification}
      {#each achievements as achievement}
        <div class="flex w-[1024px] justify-between items-center">
          <!-- left side -->
          <div class="flex items-center gap-[53px]">
            <span class="text-black font-dm-sans text-xs font-normal">
              You have a claimable reward by {achievement.clubsName}
            </span>
            <span class="text-black font-dm-sans text-base italic font-bold">
              {achievement.achievementName}
            </span>
          </div>
          <!-- right side -->
          <div class="flex">
            <button
              class="hs-button is-filled"
              on:click={() => {
                window.open(achievement.achievementUrl, '_blank')
              }}
            >
              Claim
            </button>
          </div>
        </div>
      {/each}
    {/if}
    <div class="flex flex-col justify-center">
      <button
        class="place-items-center"
        on:click={() => {
          showNotification = !showNotification
        }}
      >
        {#if showNotification}
          <svg
            class="w-8"
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18.221,7.206l9.585,9.585c0.879,0.879,0.879,2.317,0,3.195l-0.8,0.801c-0.877,0.878-2.316,0.878-3.194,0  l-7.315-7.315l-7.315,7.315c-0.878,0.878-2.317,0.878-3.194,0l-0.8-0.801c-0.879-0.878-0.879-2.316,0-3.195l9.587-9.585  c0.471-0.472,1.103-0.682,1.723-0.647C17.115,6.524,17.748,6.734,18.221,7.206z"
              class="fill-[#515151]"
            />
          </svg>
        {:else}
          <svg
            class="w-8 h-8"
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.77,23.795L5.185,14.21c-0.879-0.879-0.879-2.317,0-3.195l0.8-0.801c0.877-0.878,2.316-0.878,3.194,0  l7.315,7.315l7.316-7.315c0.878-0.878,2.317-0.878,3.194,0l0.8,0.801c0.879,0.878,0.879,2.316,0,3.195l-9.587,9.585  c-0.471,0.472-1.104,0.682-1.723,0.647C15.875,24.477,15.243,24.267,14.77,23.795z"
              class="fill-[#515151]"
            />
          </svg>
        {/if}
      </button>
    </div>
  </div>
{/if}
