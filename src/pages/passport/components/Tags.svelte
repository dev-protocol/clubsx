<script lang="ts">
  import Tags from 'svelte-tags-input'

  export let tags: string[] = []
  export let allowPaste: boolean = true
  export let allowDrop: boolean = true
  export let splitWith: string = ' '
  export let addKeys: number[] = [13, 32]
</script>

<span class="tags-input">
  <Tags bind:tags {allowPaste} {allowDrop} {splitWith} {addKeys} />
</span>

<style scoped lang="scss">
  .tags-input {
    & :global(.svelte-tags-input-tag),
    & :global(.svelte-tags-input) {
      @apply text-xl;
      @apply items-center;
    }
    & :global(.svelte-tags-input-layout),
    & :global(.svelte-tags-input-layout):hover {
      border-radius: var(--hs-form-field-radius, var(--hs-theme-radius-small));
      padding: var(
        --hs-form-field-padding,
        var(--hs-theme-padding-lg) var(--hs-theme-padding-xl)
      );
      padding-top: calc(var(--hs-theme-padding-lg) - 5px);
      border-width: var(--hs-form-field-border-width, var(--hs-theme-stroke));
      border-style: var(--hs-form-field-border-style, solid);
      outline: none;
      background-color: var(--hs-form-field-fill, var(--hs-theme-primary-300));
      color: var(--hs-form-field-ink, var(--hs-theme-surface-ink));
      border-color: var(--hs-form-field-border, var(--hs-theme-surface-200));
    }
    & :global(.svelte-tags-input-layout):hover {
      --hs-form-field-border: var(--hs-theme-accent-400);
    }
  }
</style>
