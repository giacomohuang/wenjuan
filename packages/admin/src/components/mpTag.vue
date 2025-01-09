<template>
  <span class="tag" :class="[size, color]">
    <slot></slot>
  </span>
</template>

<script setup>
const { size, color } = defineProps(['size', 'color'])
</script>

<style lang="scss" scoped>
/*rtl:begin:ignore*/
.tag {
  border-radius: 3px;
  // border: 1px solid;
  padding: 2px 8px;
  font-size: 0.875em;
  color: var(--text-primary);
  &.small {
    font-size: 0.8em;
    padding: 2px 4px;
  }
  &.large {
    font-size: 1em;
    padding: 4px 8px;
  }

  &.small {
    font-size: 0.8em;
    padding: 2px 4px;
  }
  &.gray {
    color: var(--text-tertiary);
    background: var(--bg-gray-100);
  }

  &.blue {
    color: var(--c-blue-700);
    background: var(--c-blue-100);
  }

  &.green {
    color: var(--c-green-700);
    background: var(--c-green-100);
  }

  &.red {
    color: var(--c-red-700);
    background: var(--c-red-100);
  }
}

// rtl:end:ignore

[data-theme='dark'] .tag {
  &.gray {
    color: var(--c-gray-300);

    background-color: var(--c-gray-800);
  }

  &.green {
    color: var(--c-green-300);

    background-color: var(--c-green-800);
  }

  &.blue {
    color: var(--c-blue-300);

    background-color: var(--c-blue-800);
  }

  &.red {
    color: var(--c-red-300);

    background-color: var(--c-red-800);
  }
}
</style>
