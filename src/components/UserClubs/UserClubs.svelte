<script lang="ts">
  import type { DraftOptions } from '@constants/draft'
  import type { ClubsConfiguration } from '@devprotocol/clubs-core'
  import { onMount } from 'svelte'
  import UserClubItem from './UserClubItem.svelte'

  export let id: string

  let isLoading = false
  let draftClubs: ClubsConfiguration[] = []
  let publishedClubs: ClubsConfiguration[] = []

  const fetchUserClubs = async (id: string) => {
    isLoading = true

    const req = await fetch('/api/fetchClubs', {
      method: 'POST',
      body: JSON.stringify({ identifier: id }),
    })

    if (req.status !== 200) {
      isLoading = false
      return
    }

    const clubs = (await req.json()) as ClubsConfiguration[]

    for (const club of clubs) {
      const isDraft = club.options?.find(
        (option) => option.key === '__draft'
      ) as DraftOptions | undefined

      if (isDraft?.value.isInDraft) {
        draftClubs.push(club)
        draftClubs = draftClubs
      } else {
        publishedClubs.push(club)
        publishedClubs = publishedClubs
      }
    }

    isLoading = false
  }

  onMount(async () => {
    await fetchUserClubs(id)
  })
</script>

<div class="mx-auto mb-5 max-w-5xl px-4">
  <div class="mb-24">
    <h3 class="mb-8 font-body text-2xl font-bold text-white">Published</h3>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-8">
      {#if isLoading}
        <p
          class="h-20 w-full animate-pulse cursor-progress rounded bg-gray-500/60"
        />
        <p
          class="h-20 w-full animate-pulse cursor-progress rounded bg-gray-500/60"
        />
        <p
          class="h-20 w-full animate-pulse cursor-progress rounded bg-gray-500/60"
        />
      {:else if publishedClubs.length > 0}
        {#each publishedClubs as club}
          <UserClubItem config={club} isDraft={false} />
        {/each}
      {:else if draftClubs.length > 0 && publishedClubs.length <= 0}
        <p class="border-0 font-bold text-inherit no-underline">
          No published clubs found. You have clubs in drafting phase. Publish
          them to unlock their full potential and make them accessible.
        </p>
      {:else}
        <p class="border-0 font-bold text-inherit no-underline">
          {'No clubs found.'}
        </p>
      {/if}
    </div>
  </div>

  <div class="mb-24">
    <h3 class="mb-8 font-body text-2xl font-bold text-white">Draft</h3>
    <div
      class="mb-5 grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-8"
    >
      {#if isLoading}
        <p
          class="h-20 w-full animate-pulse cursor-progress rounded bg-gray-500/60"
        />
        <p
          class="h-20 w-full animate-pulse cursor-progress rounded bg-gray-500/60"
        />
        <p
          class="h-20 w-full animate-pulse cursor-progress rounded bg-gray-500/60"
        />
      {:else if draftClubs.length > 0}
        {#each draftClubs as club}
          <UserClubItem config={club} isDraft={true} />
        {/each}
      {:else if draftClubs.length <= 0 && publishedClubs.length > 0}
        <a
          href={'/domain'}
          class="hs-button is-filled bg-native-blue-300 w-fit border-0 px-8 py-4 text-inherit no-underline"
        >
          {'No draft clubs found. Create clubs now'}
        </a>
      {:else if draftClubs.length <= 0 && publishedClubs.length <= 0}
        <p class="border-0 font-bold text-inherit no-underline">
          {'No draft clubs found.'}
        </p>
      {/if}
    </div>
  </div>

  <div class="mb-5">
    {#if draftClubs.length <= 0 && publishedClubs.length <= 0 && isLoading === false}
      <a
        href={'/domain'}
        class="hs-button is-filled bg-native-blue-300 w-fit border-0 px-8 py-4 text-inherit no-underline"
      >
        {'Create clubs now'}
      </a>
    {/if}
  </div>
</div>
