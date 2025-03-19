<template>
  <div class="rules">
    <a-select v-model:value="modelValue.field" :options="fieldOptions"></a-select>
    <a-select v-model:value="modelValue.operator" :options="operatorOptions" />
    <a-date-picker v-model:value="modelValue.date" style="width: 200px" /> - <a-date-picker v-model:value="modelValue.date" style="width: 200px" />
    <a-input v-model:value="modelValue.value" style="width: 200px" />
  </div>
</template>
<script setup>
import { ref } from 'vue'

const { modelValue } = defineProps({
  modelValue: {
    type: Object
  }
})

modelValue.field ??= 'daily_consumption'
modelValue.operator ??= 'eq'
modelValue.value ??= ''

const emit = defineEmits(['update:modelValue'])

// // 当组件内部需要更新 modelValue 时使用此函数
// const updateValue = (newValue) => {
//   emit('update:modelValue', newValue)
// }

const fieldOptions = ref([
  { label: '每日消费金额', value: 'daily_consumption' },
  { label: '累计消费金额', value: 'total_consumption' }
])
const operatorOptions = ref([
  { label: '等于', value: 'eq' },
  { label: '不等于', value: 'neq' },
  { label: '大于', value: 'gt' },
  { label: '小于', value: 'lt' },
  { label: '大于等于', value: 'gte' },
  { label: '小于等于', value: 'lte' }
])
</script>

<style scoped lang="scss">
@use './rule.scss';
</style>
