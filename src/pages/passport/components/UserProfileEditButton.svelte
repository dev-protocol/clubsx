<script lang="ts">
  import { onMount } from 'svelte'
  import type { UndefinedOr } from '@devprotocol/util-ts'
  import type { connection as Connection } from '@devprotocol/clubs-core/connection'

  export let id: string | undefined
  export let additionalClasses: string = ''

  let connection: UndefinedOr<typeof Connection> = undefined
  let eoa: UndefinedOr<string> = undefined

  onMount(async () => {
    const { connection: _conn } = await import(
      '@devprotocol/clubs-core/connection'
    )
    connection = _conn
    eoa = connection()?.account?.getValue()
    connection().account.subscribe((acc) => {
      eoa = acc
    })
  })
</script>

{#if eoa === id}
  <a href={`/passport/${id}/edit`} class={additionalClasses}
    ><svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="w-6 h-6"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
      />
    </svg>
  </a>
{/if}
