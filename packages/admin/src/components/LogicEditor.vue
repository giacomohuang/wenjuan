<template>
  <div class="logic-editor">
    <logic-node :data="modelValue" @update:data="$emit('update:modelValue', $event)" />
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, defineExpose, computed } from 'vue'
import LogicNode from './LogicNode.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      operator: 'and',
      children: []
    })
  }
})

const emit = defineEmits(['update:modelValue'])

// 提供创建新组的方法，可以从外部调用
const addNewGroup = () => {
  return {
    operator: 'and',
    children: []
  }
}

// 提供创建新条件的方法，可以从外部调用
const addNewCondition = () => {
  return {
    value: {}
  }
}

defineExpose({
  addNewGroup,
  addNewCondition
})
</script>

<style lang="scss" scoped>
.logic-editor {
  width: 100%;
}
</style>
