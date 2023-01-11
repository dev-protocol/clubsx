<script lang="ts">
  import { ClubsConfiguration } from '@devprotocol/clubs-core'
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
      ) as boolean | undefined

      if (isDraft) {
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

<div>
  <div class="mb-12">
    <h3 class="mb-4">Published</h3>

    <div class="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-8">
      {#if publishedClubs.length > 0}
        {#each publishedClubs as club}
          <UserClubItem config={club} />
        {/each}
      {:else}
        <span class="font-bold">No published clubs found</span>
      {/if}
    </div>
  </div>

  <div>
    <h3>Draft</h3>
    {#if draftClubs.length > 0}
      {#each draftClubs as club}
        <UserClubItem config={club} />
      {/each}
    {:else}
      <span class="font-bold">No draft clubs found</span>
    {/if}
  </div>
</div>
