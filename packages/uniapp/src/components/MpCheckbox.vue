<template>
  <view class="mp-checkbox" :class="[isDisabled ? 'mp-checkbox--disabled' : '', isChecked ? 'mp-checkbox--checked' : '']" @tap.stop="handleClick">
    <view class="mp-checkbox__icon">
      <view class="mp-checkbox__icon-box" :style="isChecked ? { borderColor: activeColorComputed, backgroundColor: activeColorComputed } : ''">
        <view class="mp-checkbox__icon-inner"></view>
      </view>
    </view>
    <view class="mp-checkbox__label" v-if="$slots.default || label">
      <slot>{{ label }}</slot>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'

const props = defineProps({
  // 复选框的选中状态
  modelValue: {
    type: Boolean,
    default: false
  },
  // 复选框的值
  name: {
    type: [String, Number, Boolean],
    default: ''
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 复选框显示的文本
  label: {
    type: String,
    default: ''
  },
  // 选中状态下的颜色
  activeColor: {
    type: String,
    default: '#2979ff'
  },
  // 图标大小
  iconSize: {
    type: [String, Number],
    default: 36
  },
  // 形状，circle-圆形，square-方形
  shape: {
    type: String,
    default: 'square'
  },
  // 图标与文字的间距，单位rpx
  labelGap: {
    type: [String, Number],
    default: 12
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 尝试注入复选框组的上下文
const checkboxGroup = inject('checkboxGroup', null)

// 计算是否禁用
const isDisabled = computed(() => {
  if (checkboxGroup) {
    return checkboxGroup.disabled || props.disabled
  }
  return props.disabled
})

// 计算选中状态
const isChecked = computed(() => {
  if (checkboxGroup) {
    return checkboxGroup.modelValue.value.includes(props.name)
  }
  return checked.value
})

// 计算选中颜色
const activeColorComputed = computed(() => {
  if (checkboxGroup) {
    return checkboxGroup.activeColor
  }
  return props.activeColor
})

// 计算图标大小
const iconSizeComputed = computed(() => {
  if (checkboxGroup) {
    return checkboxGroup.iconSize
  }
  return props.iconSize
})

// 计算形状
const shapeComputed = computed(() => {
  if (checkboxGroup) {
    return checkboxGroup.shape
  }
  return props.shape
})

// 内部选中状态
const checked = ref(props.modelValue)

// 监听modelValue变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (!checkboxGroup) {
      checked.value = newValue
    }
  }
)

// 复选框点击事件
const handleClick = (e) => {
  if (isDisabled.value) return

  const newValue = !isChecked.value

  if (checkboxGroup) {
    // 如果是复选框组的子元素，则通过组来更新状态
    // 这里将检查是否满足最小选中数量要求
    const canChange = checkboxGroup.updateValue(props.name, newValue)
    if (!canChange) {
      // 如果不能更改状态（例如会导致选中数量低于最小要求），则直接返回
      return
    }
  } else {
    // 单独使用时，直接更新自身状态
    checked.value = newValue
    emit('update:modelValue', newValue)
  }

  emit('change', {
    name: props.name,
    checked: newValue
  })
}
</script>

<style lang="scss" scoped>
.mp-checkbox {
  display: inline-flex;
  align-items: flex-start;
  overflow: hidden;
  user-select: none;
  line-height: 1.8;

  &__icon {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #606266;
    font-size: v-bind('iconSizeComputed + "rpx"');
    margin-right: v-bind('props.labelGap + "rpx"');
    margin-top: v-bind('(28 * 1.8 / 2) - (Number(iconSizeComputed) / 2) + "rpx"');

    &-box {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1em;
      height: 1em;
      position: relative;
      border: 1px solid #c8c9cc;
      transition: border-color 0.2s;
      border-radius: v-bind('shapeComputed === "square" ? "8rpx" : "100%"');
    }

    &-inner {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 2px;
      left: 2px;
      width: calc(100% - 4px);
      height: calc(100% - 4px);
      transform: scale(0);
      transition: all 0.2s;
      border-radius: v-bind('shapeComputed === "square" ? "2rpx" : "100%"');
    }
  }

  &__label {
    word-wrap: break-word;
    font-size: 28rpx;
    color: #606266;
  }

  &--checked {
    .mp-checkbox__icon-inner {
      position: absolute;
      transform: scale(0.8);
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      top: 0;
      left: 0;
      &::before {
        border: 4rpx solid #fff;
        border-top: 4rpx solid #fff;
        content: '';
        position: absolute;
        width: 60%;
        height: 30%;
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        transform-origin: center;
        color: #ffffff;
        border-top: 0;
        border-right: 0;
      }
    }
  }

  &--disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}
</style>
