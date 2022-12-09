<script lang="ts">
  import { uploadImageAndGetPath } from '@fixtures/imgur'

  let clubName = ''
  const projectCategories = [
    {
      label: 'YouTube',
      value: 'YOUTUBE',
    },
    {
      label: 'GitHub',
      value: 'GITHUB',
    },
    {
      label: 'Discord',
      value: 'DISCORD',
    },
  ]
  let projectCategory = 'GITHUB'
  let twitterHandle = ''
  let avatarPath = ''

  const onFileSelected = async (
    e: Event & {
      currentTarget: EventTarget & HTMLInputElement
    }
  ) => {
    if (!e.currentTarget.files) {
      return
    }

    const file = e.currentTarget.files[0]

    avatarPath = await uploadImageAndGetPath(file)
  }
</script>

<div>
  <div class="mb-10 flex flex-col">
    <label class="mb-1" for="club-name">
      Club Name
      <span class="text-purple-400">*</span>
    </label>
    <input
      class="rounded bg-[#040B10] px-8 py-4"
      bind:value={clubName}
      id="club-name"
      name="club-name"
    />
  </div>

  <div class="mb-10 flex flex-col">
    <label class="mb-1" for="project-category">
      Project Category
      <span class="text-purple-400">*</span>
    </label>
    <select
      bind:value={projectCategory}
      id="project-category"
      name="project-category"
    >
      {#each projectCategories as cat}
        <option value={cat.value}>{cat.label}</option>
      {/each}
    </select>
  </div>

  <div class="mb-10 flex flex-col">
    <label class="mb-1" for="twitter-handle"> Twitter Handle </label>
    <input
      class="rounded bg-[#040B10] px-8 py-4"
      bind:value={twitterHandle}
      id="twitter-handle"
      name="twitter-handle"
    />
  </div>

  <div class="mb-10 flex flex-col">
    <label class="mb-1" for="avatar">
      <span>Avatar</span>

      {#if avatarPath && avatarPath != ''}
        <input
          class="rounded bg-[#040B10] px-8 py-4"
          bind:value={avatarPath}
          id={`avatar`}
          name={`avatar`}
        />
      {:else}
        <button class="hs-button is-filled" type="button">Choose Image</button>
      {/if}
      <input
        id={`avatarPath`}
        name={`avatarPath`}
        style="display:none"
        type="file"
        on:change={onFileSelected}
      />
    </label>
  </div>
</div>
