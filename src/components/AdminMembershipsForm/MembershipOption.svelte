<script lang="ts">
  import { marked } from 'marked'
  import { onMount } from 'svelte'
  import { CurrencyOption } from '@constants/currencyOption'
  import DOMPurify from 'dompurify'

  export let name: string
  export let clubName: string
  export let imagePath: string
  export let id: string
  export let price: string = '0'
  export let currency: CurrencyOption | Uppercase<CurrencyOption> =
    CurrencyOption.USDC
  export let description: string | undefined = undefined
  export let action: string | undefined = undefined
  export let actionLabel: string | undefined = undefined
  export let className: string = ''
  let modal = false
  let modalGroup: Element | undefined

  const mdToHtml = (str?: string) => DOMPurify.sanitize(marked.parse(str ?? ''))

  let content = mdToHtml(description)

  $: {
    content = mdToHtml(description)
  }

  const hash = `#membership:${id}`
  const handleHashChange = (event: HashChangeEvent) => {
    console.log({ event })
    const newUrl = new URL(event.newURL)
    const oldUrl = new URL(event.oldURL)
    if (newUrl.hash === hash) {
      modal = true
      document.body.classList.add('overflow-y-hidden')
    }
    if (oldUrl.hash === hash) {
      modal = false
      document.body.classList.remove('overflow-y-hidden')
    }
  }

  const handleClickOpen = () => {
    window.location.hash = hash
  }
  const handleClickClose = () => {
    window.history.back()
  }

  onMount(() => {
    window.addEventListener('hashchange', handleHashChange)

    modalGroup && document.body.appendChild(modalGroup)
  })
</script>

<svelte:head>
  <link rel="prefetch" href={imagePath} />
</svelte:head>

<div
  class={`grid grid-rows-[auto_1fr] overflow-hidden rounded-xl shadow-2xl ${className}`}
>
  <img class="w-full bg-black/20" src={imagePath} alt={`${name} Membership`} />

  <div
    class="relative grid grid-cols-[1fr_auto] content-baseline items-center gap-3 overflow-hidden p-2.5 text-white"
  >
    <img
      class="pointer-events-none absolute -left-1/2 top-1/2 h-auto w-[200%] max-w-none -translate-y-1/2 blur-[120px]"
      src={imagePath}
      role="presentation"
    />

    <div class="relative col-start-1">
      <p>{name}</p>
      <p
        class="grid grid-cols-[auto_1fr] items-center gap-1 text-sm opacity-70"
      >
        <span class="truncate">{price}</span>
        {currency.toUpperCase()}
      </p>
    </div>

    <button
      class="relative col-start-2 rounded-full bg-white/50 p-2"
      on:click={handleClickOpen}
      ><svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="h-6 w-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      </svg>
    </button>

    {#if description}
      <div class="md md-mini relative col-span-2 grid gap-2 text-xs opacity-70">
        {@html content}
      </div>
    {/if}
  </div>
</div>

<div
  bind:this={modalGroup}
  class={`inset-0 z-[9999] grid items-center justify-center overflow-y-scroll bg-black/20 p-8 backdrop-blur-3xl ${
    modal ? 'fixed' : 'hidden'
  }`}
>
  {#if modal === true}
    <div class="grid max-w-lg gap-4 p-2">
      <span class="flex items-center gap-3 overflow-hidden">
        <button on:click={handleClickClose}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-6 w-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <span class="truncate text-3xl font-bold">{name}</span>
      </span>
      <img
        class="w-full rounded-xl bg-black/20 shadow-xl"
        src={imagePath}
        alt={`${name} Membership`}
      />

      <div class="px-2.5">
        <p class="font-bold">{name}</p>
        <p class="opacity-50">{clubName}</p>
      </div>

      <div
        class="grid grid-cols-[1fr_auto] content-baseline items-center gap-3 overflow-hidden px-2.5"
      >
        <p class="text-2xl font-bold">{price} {currency.toUpperCase()}</p>

        {#if action && actionLabel}
          <a
            class="flex items-center gap-2 rounded-full bg-white/20 px-5 py-2.5"
            href={action}
            >{actionLabel}<svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-6 w-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </a>
        {/if}
      </div>

      {#if description}
        <div class="md grid gap-2">
          {@html content}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style lang="scss">
  .md {
    @apply text-white;
    :global(h1) {
      @apply text-3xl font-bold;
    }
    :global(h2) {
      @apply text-2xl font-bold;
    }
    :global(h3) {
      @apply text-xl;
    }
    :global(h4) {
      @apply font-bold;
    }
    :global(h5) {
      @apply font-bold;
    }
    :global(a) {
      @apply inline-block rounded p-1 underline transition hover:bg-white/20;
    }
    :global(ul) {
      @apply list-none;
      :global(li::before) {
        content: '\2022';
        @apply mr-2 text-zinc-300;
      }
    }
    :global(pre) {
      @apply rounded p-3;
    }
  }
  .md.md-mini {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
</style>
