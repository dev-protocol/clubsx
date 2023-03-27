<script lang="ts">
  import { type PluginMeta, allTags } from '@constants/plugins'
  import { onMount } from 'svelte'
  import sticky from '../utils/sticky'

  export let plugins: PluginMeta[]
  let navEl: HTMLElement
  let isStuck: boolean = false
  let navInitialHeight: number | undefined

  const navs = allTags.map((tag) => ({
    tag,
    exists: plugins.some((x) => x.tag === tag),
    anchor: `#${tag.toLowerCase().replace(/\W/g, '')}`,
  }))

  const handleStuck = (e: any) => {
    isStuck = e.detail.isStuck
  }

  onMount(() => {
    // `on:stuck` expression is alerting an error, so use this
    navEl.addEventListener('stuck', handleStuck)
    navInitialHeight = navEl.clientHeight
  })
</script>

<nav
  bind:this={navEl}
  use:sticky={{ stickToTop: true }}
  class="sticky top-0 mx-[calc((100vw-100%)/-2)] grid items-start lg:mx-0"
  style={navInitialHeight && isStuck ? `height: ${navInitialHeight}px` : ''}
>
  <ul
    class={`flex items-start justify-start gap-4 overflow-x-auto bg-dp-white-300 px-2 pt-5 pb-4 ${
      isStuck ? 'border-b border-b-black/20' : 'lg:flex-wrap'
    }`}
  >
    {#each navs.filter((x) => x.exists) as nav}
      <li>
        <a
          href={nav.anchor}
          class="inline-block whitespace-nowrap break-keep rounded-full px-4 py-2 text-sm capitalize shadow-[0_0_0_1px_rgba(0,0,0,1)] transition hover:shadow-[0_0_0_3px_rgba(0,0,0,1)]"
        >
          {nav.tag}
        </a>
      </li>
    {/each}
    {#each navs.filter((x) => !x.exists) as nav}
      <li>
        <span
          class="inline-block flex items-center gap-2 whitespace-nowrap break-keep rounded-full px-4 py-2 text-sm capitalize text-black/50 shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
        >
          {nav.tag}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-4 w-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </span>
      </li>
    {/each}
  </ul>
</nav>
