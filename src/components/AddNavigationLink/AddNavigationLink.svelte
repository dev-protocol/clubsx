<script lang="ts">
  import type { NavLink } from '@constants/navLink'
  import {
    type ClubsConfiguration,
    ClubsEvents,
    setConfig,
  } from '@devprotocol/clubs-core'
  import { buildConfig } from '@devprotocol/clubs-core/events'
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import { onMount } from 'svelte'

  const key = 'navigationLinks'
  export let config: ClubsConfiguration
  export let label: string
  export let link: NavLink
  const existingLinks =
    (config.options?.find((opt) => opt.key === key)?.value as UndefinedOr<
      NavLink[]
    >) ?? []
  let hasMenu = existingLinks.some((nav) => nav.path === link.path)
  let waiting = false

  const action = () => {
    waiting = true
    setConfig({
      ...config,
      options: [
        ...(config.options?.filter((o) => o.key !== key) ?? []),
        {
          key,
          value: [...existingLinks, link],
        },
      ],
    })
    setTimeout(buildConfig, 50)
  }

  onMount(() => {
    document.body.addEventListener(
      ClubsEvents.FinishConfiguration,
      (ev: any) => {
        if (typeof ev.detail.success === 'boolean') {
          if (ev.detail.success) {
            waiting = false
            hasMenu = true
          } else {
            // TODO: Add an error handling
          }
        }
      }
    )
  })
</script>

{#if hasMenu === false}
  <div class="flex w-full justify-end">
    <button
      type="button"
      on:click|preventDefault={() => action()}
      class={`hs-button is-large is-filled ${
        waiting ? 'animate-pulse bg-gray-500/60' : ''
      }`}
      disabled={waiting}>{label}</button
    >
  </div>
{/if}
