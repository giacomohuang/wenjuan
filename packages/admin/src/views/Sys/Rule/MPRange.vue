<template>
  <div class="rules">
    <a-select v-model:value="modelValue.range" :options="rangeOptions"></a-select>
    <a-date-picker v-model:value="modelValue.date" style="width: 200px" />
  </div>
</template>
<script setup>
import { ref } from 'vue'

const { modelValue } = defineProps({
  modelValue: {
    type: Object
  }
})

modelValue.range ??= 'range1'

const emit = defineEmits(['update:modelValue'])

// 当组件内部需要更新 modelValue 时使用此函数
// const updateValue = (newValue) => {
//   emit('update:modelValue', newValue)
// }

const rangeOptions = ref([
  { label: '范围1', value: 'range1' },
  { label: '范围2', value: 'range2' }
])
</script>

<style scoped lang="scss">
@use './rule.scss';
</style>
