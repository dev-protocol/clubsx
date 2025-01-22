<script lang="ts">
  import type { Profile } from '@pages/api/profile'
  import X from '@components/Icons/X.svelte'
  import Twitch from '@components/Icons/Twitch.svelte'
  import Instagram from '@components/Icons/Instagram.svelte'
  import TikTok from '@components/Icons/TikTok.svelte'
  import YouTube from '@components/Icons/YouTubeColor.svelte'
  import type { UndefinedOr } from '@devprotocol/util-ts'

  export let profile: Profile
  export let skinId: UndefinedOr<string> = undefined
  export let className = ''
</script>

<div class={`grid grid-flow-col items-center justify-start gap-2 ${className}`}>
  <div
    class="bg-surface-300 size-16 rounded-full overflow-hidden border border-surface-400 p-1"
  >
    <img
      src={profile.avatar}
      class="rounded-full w-full h-full object-cover"
      alt="Avatar"
    />
  </div>
  <p>{profile.username}</p>
  <p>·</p>
  {#if profile.skins?.find((x) => x.id === skinId)?.description}
    <p class="truncate text-xs">
      {profile.skins
        ?.find((x) => x.id === skinId)
        ?.description?.replace(/\n/g, ' ')}
    </p>
  {:else}
    <p class="truncate text-xs opacity-20">( ... )</p>
  {/if}
  <p>·</p>
  {#if profile.sns?.tiktok}
    <TikTok className="size-4" />
  {/if}
  {#if profile.sns?.youtube}
    <YouTube className="size-4" />
  {/if}
  {#if profile.sns?.instagram}
    <Instagram className="size-4" />
  {/if}
  {#if profile.sns?.x}
    <X className="size-4" />
  {/if}
  {#if profile.sns?.twitch}
    <Twitch className="size-4" />
  {/if}
  {#if !profile.sns?.tiktok && !profile.sns?.youtube && !profile.sns?.instagram && !profile.sns?.x && !profile.sns?.twitch}
    <span class="flex items-center gap-2">
      <TikTok className="size-4 opacity-20" />
      <YouTube className="size-4 opacity-20" />
      <Instagram className="size-4 opacity-20" />
      <X className="size-4 opacity-20" />
      <Twitch className="size-4 opacity-20" />
    </span>
  {/if}
</div>
