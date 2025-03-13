<template>
  <view class="mp-radio-group" :class="{ 'mp-radio-group--column': placement === 'column' }">
    <slot></slot>
  </view>
</template>

<script setup>
import { ref, provide, watch } from 'vue'

const props = defineProps({
  // 绑定的值，单选框组选中的值，是单个name值
  modelValue: {
    type: [String, Number, Boolean],
    default: ''
  },
  // 排列方式，row-横向，column-纵向
  placement: {
    type: String,
    default: 'row'
  },
  // 是否禁用所有单选框
  disabled: {
    type: Boolean,
    default: false
  },
  // 图标大小
  iconSize: {
    type: [String, Number],
    default: 36
  },
  // 选中状态下的颜色
  activeColor: {
    type: String,
    default: '#2979ff'
  },
  // 形状，circle-圆形，square-方形
  shape: {
    type: String,
    default: 'circle'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const radioValue = ref(props.modelValue)

// 监听modelValue变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== radioValue.value) {
      radioValue.value = newValue
    }
  }
)

// 更新选中状态
const updateValue = (name) => {
  radioValue.value = name
  emit('update:modelValue', name)
  emit('change', name)
  return true
}

// 提供给子组件的数据和方法
provide('radioGroup', {
  modelValue: radioValue,
  disabled: props.disabled,
  iconSize: props.iconSize,
  activeColor: props.activeColor,
  shape: props.shape,
  updateValue
})
</script>

<style lang="scss" scoped>
.mp-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;

  &--column {
    flex-direction: column;
  }
}
</style>
