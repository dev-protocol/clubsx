<script lang="ts">
  export let site: string | undefined
  export let baseUrl: string
  export let inAdmin: boolean = false

  const dist = site ? `${baseUrl}/${site}/setup/publish` : `${baseUrl}/signin`
</script>

<a
  href={dist}
  class="fixed bottom-0 left-1 right-1 z-50 block rounded-t-3xl bg-black/50 px-8 py-4 text-white backdrop-blur-3xl transition-all hover:bg-black/70 hover:py-8"
>
  {#if inAdmin}
    <p class="mb-2 text-center text-sm opacity-70">
      If you're using email sign-on, setting updating is unavailable in the
      draft.
    </p>
  {/if}
  <div class="flex items-center justify-center">
    <p class="mr-4 rounded border px-4 py-1">Preview</p>
    <p class="font-bold">Send blockchain transactions to complete process</p>
  </div>
</a>
