<template>
  <label class="mp-checkbox" :class="{ checked: checked, disabled: disabled }">
    <span class="inner"></span>
  </label>
</template>

<script setup>
const { checked, disabled } = defineProps(['checked', 'disabled'])
</script>

<style lang="scss">
.mp-checkbox {
  box-sizing: border-box;
  font-size: 14px;

  line-height: 1;
  position: relative;
  white-space: nowrap;
  cursor: pointer;
  align-self: center;

  &.checked {
    opacity: 1;
    .inner {
      border-color: #2893ff;
      background-color: #2893ff;
      &::after {
        opacity: 1;
        transform: rotate(45deg) scale(1) translate(-50%, -50%);
        transition: all 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46) 0.1s;
      }
    }
  }

  &:hover:not(.disabled) {
    .inner {
      border-color: #2893ff;
    }
  }

  &.disabled {
    cursor: not-allowed;
    opacity: 0.3;
  }

  .inner {
    height: 18px;
    width: 18px;
    display: block;
    background-color: var(--bg-primary);
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    transition: all 0.3s;

    &::after {
      content: '';
      position: absolute;
      top: 45%;
      left: 28%;
      width: 6px;
      height: 9px;
      border: 2px solid #fff;
      border-top: 0;
      border-left: 0;
      transform: scale(0) translate(-50%, -50%);
      opacity: 0;
      transition:
        all 0.1s cubic-bezier(0.71, -0.46, 0.88, 0.6),
        opacity 0.1s;
    }
  }
}
</style>
