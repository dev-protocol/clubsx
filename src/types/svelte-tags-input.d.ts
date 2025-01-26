import type { SvelteComponentTyped } from 'svelte'

declare module 'svelte-tags-input' {
  // https://github.com/agustinl/svelte-tags-input/blob/master/README.md
  export default class extends SvelteComponentTyped<{
    tags: string[]
    allowPaste?: boolean
    allowDrop?: boolean
    splitWith?: string
    addKeys?: number[]
  }> {}
}
