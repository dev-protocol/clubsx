<script lang="ts">
  import type { ClubsConfiguration } from '@devprotocol/clubs-core'

  export let config: ClubsConfiguration
  export let isDraft: boolean

  const imagePath =
    (config.options?.find((option) => option.key === 'avatarImgSrc')
      ?.value as string) ?? ''

  // Fail safe to replace default sitename
  const url = new URL(config.url.replace('<USERS_SITE_NAME_HERE>', config.name))

  const path = isDraft
    ? `/${url.hostname.split('.')[0]}/setup/basic`
    : `${url.toString()}admin/theme`
</script>

<div
  class="item-shadow grid grid-cols-[auto_1fr] items-center justify-start gap-x-2.5 rounded-[5px] bg-white p-4 text-black"
>
  <div class="row-span-2 h-16 w-16 overflow-hidden rounded-full">
    <img
      class="h-full w-full object-cover"
      src={imagePath || '/favicon.svg'}
      alt={config.name}
    />
  </div>
  <span class="truncate font-body text-xl font-bold text-black"
    >{config.name}</span
  >
  <ul class="flex gap-2">
    <li>
      <a
        href={path}
        class="bg-native-blue-200 hover:bg-native-blue-300 rounded px-2 py-1 transition"
        >{isDraft ? 'Edit' : 'Manage'}</a
      >
    </li>
    {#if isDraft === false}
      <li>
        <a
          href={url.toString()}
          class="bg-native-blue-200 hover:bg-native-blue-300 rounded px-2 py-1 transition"
          >Club page</a
        >
      </li>
    {/if}
  </ul>
</div>

<style>
  .item-shadow {
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
  }
</style>
