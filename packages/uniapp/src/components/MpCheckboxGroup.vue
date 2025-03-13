<template>
  <view class="mp-checkbox-group" :class="{ 'mp-checkbox-group--column': placement === 'column' }">
    <slot></slot>
  </view>
</template>

<script setup>
import { ref, provide, watch } from 'vue'

const props = defineProps({
  // 绑定的值，一个数组，包含所有选中的checkbox的name值
  modelValue: {
    type: Array,
    default: () => []
  },
  // 排列方式，row-横向，column-纵向
  placement: {
    type: String,
    default: 'row'
  },
  // 是否禁用所有复选框
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
    default: 'square'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const checkboxValues = ref(props.modelValue || [])

// 监听modelValue变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== checkboxValues.value) {
      checkboxValues.value = newValue
    }
  }
)

// 更新选中状态
const updateValue = (name, checked) => {
  let values = [...checkboxValues.value]

  if (checked) {
    // 不存在则添加
    if (values.indexOf(name) === -1) {
      values.push(name)
    }
  } else {
    // 移除选项
    const index = values.indexOf(name)
    if (index !== -1) {
      values.splice(index, 1)
    }
  }

  checkboxValues.value = values
  emit('update:modelValue', values)
  emit('change', values)

  return true
}

// 提供给子组件的数据和方法
provide('checkboxGroup', {
  modelValue: checkboxValues,
  disabled: props.disabled,
  iconSize: props.iconSize,
  activeColor: props.activeColor,
  shape: props.shape,
  updateValue
})
</script>

<style lang="scss" scoped>
.mp-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;

  &--column {
    flex-direction: column;
  }
}
</style>
