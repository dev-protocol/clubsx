<script lang="ts" setup>
import { onMounted, ref, type ComputedRef, computed } from 'vue'
import {
  type UndefinedOr,
  whenDefined,
  whenDefinedAll,
} from '@devprotocol/util-ts'
import { JsonRpcProvider } from 'ethers'
import Skeleton from '@components/Global/Skeleton.vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { clientsSTokens } from '@devprotocol/dev-kit'

type Props = {
  id?: number | string
  rpcUrl: string
}
const props = defineProps<Props>()

const tokenURI = ref<
  UndefinedOr<{
    readonly name: string
    readonly description: string
    readonly image: string
    readonly attributes: readonly [
      {
        readonly trait_type: 'Destination'
        readonly value: string
      },
      {
        readonly trait_type: 'Locked Amount'
        readonly display_type: 'number'
        readonly value: number
      },
    ]
  }>
>()

const htmlDescription: ComputedRef<UndefinedOr<string>> = computed(() => {
  return (
    tokenURI.value?.description &&
    DOMPurify.sanitize(marked.parse(tokenURI.value.description))
  )
})

onMounted(async () => {
  const provider = new JsonRpcProvider(props.rpcUrl)

  const [c1, c2] = await clientsSTokens(provider)
  const sTokens = c1 ?? c2
  const metadata = await whenDefinedAll([sTokens, props.id], ([client, id]) =>
    client.tokenURI(Number(id)),
  )
  tokenURI.value = metadata
  console.log({ metadata })
})
</script>

<template>
  <section class="rounded-md bg-white p-8 text-black shadow">
    <div class="mx-auto grid gap-8 md:max-w-lg">
      <slot name="before:preview" />
      <div
        class="-mx-8 grid gap-8 bg-dp-white-300 p-6 md:mx-auto md:rounded-md"
      >
        <div class="flex flex-col gap-6">
          <p class="font-mono font-bold">
            Minted <span class="text-black/50">#{{ id }}</span>
          </p>

          <div class="rounded-lg border border-black/20 bg-black/10 p-4">
            <img
              v-if="tokenURI?.image"
              :src="tokenURI?.image"
              class="h-auto w-full rounded object-cover object-center sm:h-full sm:w-full"
            />
            <Skeleton
              v-if="tokenURI?.image === undefined"
              class="mx-auto aspect-square h-full w-full"
            />
          </div>
          <span>
            <h3 class="text-sm text-black/50">
              <span v-if="tokenURI?.name">{{ tokenURI.name }}</span>
              <Skeleton
                v-if="tokenURI?.name === undefined"
                class="mx-auto h-full w-full"
              />
            </h3>
          </span>
          <aside
            v-if="htmlDescription"
            v-html="htmlDescription"
            class="mt-6 text-xl text-black/80"
          ></aside>
          <Skeleton
            v-if="htmlDescription === undefined"
            class="mx-auto h-full w-full"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss">
.md {
  h1 {
    @apply text-3xl font-bold;
  }
  h2 {
    @apply text-2xl font-bold;
  }
  h3 {
    @apply text-xl;
  }
  h4 {
    @apply font-bold;
  }
  h5 {
    @apply font-bold;
  }
  a {
    @apply inline-block rounded p-1 underline transition hover:bg-white/20;
  }
  ul li {
    @apply list-disc;
  }
  ol li {
    @apply list-decimal;
  }
  pre {
    @apply rounded p-3;
  }
}
</style>
