<script lang="ts">

import type { Collection } from '@plugins/collections'

export let collection: Collection
</script>

<div class="flex flex-col items-center px-9">
    <!-- Header -->
    <div class="h-20 p-5 flex justify-between items-center gap-6">
        <div class="text-white text-lg font-medium uppercase">Demo</div>
        <button class="px-4 py-2 text-white text-lg font-medium uppercase border rounded-sm opacity-50">Sign in</button>
    </div>
    <!-- Hero Image -->
    <div class="gap-12">
        <img class="rounded-[32px]"
        src={collection.imageSrc}
        />
    </div>

    <div class="flex flex-col items-start gap-12">
        <div class="flex flex-col items-start gap-[76px]">
            <!-- Collection Name -->
            <div class="flex items-center gap-2.5">
                <div class="text-justify">
                <span class="text-2xl font-bold leading-9">{collection.name}</span>
                </div>
            </div>  
            <!-- Collection Description -->
            <div class="flex flex-col items-start self-stretch gap-2.5">
                <p class="text-justify text-2xl font-normal">
                    {collection.description}
                </p>
            </div>
        </div>
    </div>     
</div>