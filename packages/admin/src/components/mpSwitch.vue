<template>
  <label class="mp-switch" :class="{ checked, disabled }">
    <span class="handle"></span>
  </label>
</template>

<script setup>
const { checked, disabled } = defineProps(['checked', 'disabled'])
</script>

<style lang="scss">
.mp-switch {
  margin: 0;
  padding: 0;
  color: rgba(0, 0, 0, 0.88);
  font-size: 14px;
  line-height: 22px;
  position: relative;
  display: inline-block;
  min-width: 44px;
  height: 22px;
  vertical-align: middle;
  background: rgba(0, 0, 0, 0.25);
  border: 0;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  outline: 1px solid transparent;

  .handle {
    width: 18px;
    height: 18px;
    position: absolute;
    top: 2px;

    inset-inline-start: 2px;
    background-color: #fff;
    border-radius: 9px;
    box-shadow: 0 2px 4px 0 rgba(0, 35, 11, 0.2);
    transition: all 0.2s ease-in-out;
  }

  &.disabled {
    cursor: not-allowed;
    opacity: 0.3;
  }

  &.checked {
    background: #2893ff !important;
    .handle {
      inset-inline-start: calc(100% - 20px);
      position: absolute;
      transition: all 0.2s ease-in-out;
    }
  }
}

[data-theme='dark'] {
  .mp-switch {
    background: rgba(255, 255, 255, 0.25);
  }
}
</style>
