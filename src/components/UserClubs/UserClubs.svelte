<script lang="ts">
  import type { DraftOptions } from '@constants/draft'
  import type { ClubsConfiguration } from '@devprotocol/clubs-core'
  import { onMount } from 'svelte'
  import UserClubItem from './UserClubItem.svelte'

  export let id: string
  let publishedClubs: ClubsConfiguration[] = []
  let draftClubs: ClubsConfiguration[] = []
  let isLoading = false

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

  onMount(() => {
    fetchUserClubs(id)
  })
</script>

<div class="ml-auto mr-auto w-[50%] max-w-[50%]">
  <div class="mb-24">
    <h3 class="mb-8 font-body text-2xl font-bold text-white">Published</h3>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-8">
      {#if publishedClubs.length > 0}
        {#each publishedClubs as club}
          <UserClubItem config={club} isDraft={false} />
        {/each}
      {:else}
        <span class="font-bold">No published clubs found</span>
      {/if}
    </div>
  </div>

  <div>
    <h3 class="mb-8 font-body text-2xl font-bold text-white">Draft</h3>
    {#if draftClubs.length > 0}
      {#each draftClubs as club}
        <UserClubItem config={club} isDraft={true} />
      {/each}
    {:else}
      <span class="font-bold">No draft clubs found</span>
    {/if}
  </div>
</div>
