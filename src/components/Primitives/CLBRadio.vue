<template>
  <label class="clb-radio">
    <input
      class="clb-radio__input"
      type="radio"
      :id="value"
      name="input"
      :value="value"
      @change="action"
    />
    <div class="grid grid-cols-[max-content_1fr] items-center gap-3">
      <img
        class="clb-radio__icon"
        :src="media"
        width="50"
        height="50"
        :alt="mediaAlt"
      />
      <div class="flex flex-col items-start">
        <span class="clb-radio__label">{{ label }}</span>
        <span class="clb-radio__helper">{{ helper }}</span>
      </div>
    </div>
  </label>
</template>

<script>
export default {
  name: 'CLBRadio',
  props: ['action', 'value', 'label', 'helper', 'media', 'mediaAlt'],
}
</script>

<style lang="scss" scoped>
@use 'node_modules/@devprotocol/hashi' with (
  $vue-mode: true
);

.clb-radio {
  display: flex;
  flex-basis: 100%;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: hashi.token-get('margin-sm');
  padding: hashi.token-get('padding-sm') hashi.token-get('padding-lg');
  border-radius: hashi.token-get('radius-small');
  border: 1px solid hashi.token-get('native-blue-400');
  transition: all var(--hs-transition-time) ease;
  cursor: pointer;

  &:hover {
    background: rgba(116 172 255 / #{hashi.$color-fill-hover-opacity});
  }

  .clb-radio__label {
    font-family: hashi.token-get('family-subtitle');
    @apply text-xl;
    font-weight: hashi.token-get('weight-bold');
    line-height: hashi.token-get('line-height-condensed');
  }

  .clb-radio__input {
    appearance: none;
    border-radius: 50%;
    border: 8px solid #454545;
    transition: inherit;
    cursor: inherit;

    &:checked {
      border-color: hashi.token-get('native-blue-400');
    }
  }

  .clb-radio__helper {
    font-family: hashi.token-get('family-small');
    @apply text-xs;
    font-weight: hashi.token-get('weight-light');
    line-height: hashi.token-get('line-height-condensed');
  }

  .clb-radio__icon {
    width: clamp(42px, 5vw, 50px);
    height: clamp(42px, 5vw, 50px);
  }
}
</style>
