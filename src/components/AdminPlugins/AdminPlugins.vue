<template>
  <div class="relative flex w-[51.05%] left-[5.555%] flex-col items-start gap-[64px] p-0">
    <p class="font-Syne h-9 p-0 text-2xl font-bold leading-9">Plugins</p>
    <div v-for="(plugin, i) in pluginsState" :key="i" class="flex w-full flex-row items-center justify-between gap-[10px] p-0">
      <p class="h-[24px] font-body text-base font-normal leading-6 capitalize">
        {{plugin.name}}
      </p>
      <div class="border-[##040B10] flex h-[68px] flex-row items-center justify-start gap-[16px] rounded-[99px] border-[3px] border-[#040B10] p-1.5">
        <div :class="[!plugin.enable ? toggleEnableClasses : toggleDisableClasses]">
          <button
            @click="toggleActivation(1)"
            :disabled="!plugin.enable"
            class="h-[24px] font-body text-base font-normal leading-6"
          >
            {{
              count
            }}
            {{
              !plugin.enable
                ? "Disabled"
                : "Disable"
            }}
          </button>
        </div>
        <div :class="[plugin.enable ? toggleEnableClasses : toggleDisableClasses]">
          <button
            :disabled="plugin.enable"
            @click="toggleActivation(1)"
            class="h-[24px] font-body text-base font-normal leading-6"
          >
            {{
              plugin.enable
                ? "Enabled"
                : "Enable"
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'AdminPlugins',
    props: {
      plugins: Array,
    },
    data(instance) {
      return {
        count: 0,
        toggleEnableClasses: "h-[56px] rounded-[999px] bg-[#040B10] p-[16px] cursor-pointer",
        toggleDisableClasses: "h-[56px] rounded-[999px] b-0 p-[16px] cursor-pointer",
        pluginsState: instance.plugins,
      }
    },
    methods: {
      toggleActivation(index) {
        this.count++
        const replacementItem = this.pluginsState[index]
        replacementItem.enable = !replacementItem.enable
        this.$set(this.pluginsState, index, replacementItem)
      },
    },
  }
</script>
