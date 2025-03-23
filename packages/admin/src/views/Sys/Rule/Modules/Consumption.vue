<template>
  <div class="rules">
    <a-form :model="modelValue" layout="inline" :rules="validateRules">
      <a-form-item name="timeRange">
        <a-select v-model:value="modelValue.timeRange" :options="rangeOptions" :dropdownMatchSelectWidth="false"></a-select>
      </a-form-item>
      <a-form-item name="consumptionType">
        <a-select v-model:value="modelValue.consumptionType" :options="consumptionTypeOptions" :dropdownMatchSelectWidth="false"></a-select>
      </a-form-item>
      <a-form-item name="operator">
        <a-select v-model:value="modelValue.operator" :showArrow="false" :options="operatorOptions" :dropdownMatchSelectWidth="false"></a-select>
      </a-form-item>
      <a-form-item name="amount">
        <a-input v-model:value="modelValue.amount" :placeholder="amountPlaceholder">
          <template #suffix>
            {{ unit }}
          </template>
        </a-input>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['update:modelValue'])

const { modelValue } = defineProps({
  modelValue: {
    type: Object
  }
})

modelValue.timeRange ??= 'NoLimit'
modelValue.consumptionType ??= 'ConsumptionAmount'
modelValue.operator ??= 'gte'

const consumptionTypeOptions = ref([
  {
    label: '消费金额',
    value: 'ConsumptionAmount',
    placeholder: '请输入消费金额',
    unit: '元'
  },
  {
    label: '消费积分',
    value: 'ConsumptionPoint',
    placeholder: '请输入消费积分',
    unit: '分'
  },
  {
    label: '消费积分+其他积分',
    value: 'AllPoint',
    placeholder: '请输入积分',
    unit: '分'
  }
])

const amountPlaceholder = computed(() => {
  return consumptionTypeOptions.value.find((item) => item.value === modelValue.consumptionType)?.placeholder
})

const unit = computed(() => {
  return consumptionTypeOptions.value.find((item) => item.value === modelValue.consumptionType)?.unit
})

const operatorOptions = ref([
  {
    label: '>=',
    value: 'gte'
  },
  {
    label: '=',
    value: 'eq'
  }
])

// 当组件内部需要更新 modelValue 时使用此函数
// const updateValue = (newValue) => {
//   emit('update:modelValue', newValue)
// }

const rangeOptions = ref([
  {
    label: '任意时间',
    value: 'NoLimit'
  },
  {
    label: '最近一年',
    value: 'LastYear'
  },
  {
    label: '当天',
    value: 'Today'
  },
  {
    label: '当月',
    value: 'CurrentMonth'
  },
  {
    label: '连续三个月',
    value: 'ThreeConsecMonths'
  },
  {
    label: '本财年',
    value: 'CurrFiscalYear'
  },
  {
    label: '办卡之日起',
    value: 'SinceCardIssuance'
  },
  {
    label: '变为当前等级之日起',
    value: 'SinceCurrLevel'
  },
  {
    label: '最近30天',
    value: 'Last30Days'
  },
  {
    label: '最近90天',
    value: 'Last90Days'
  },
  {
    label: '最近180天',
    value: 'Last180Days'
  }
])

const validateRules = ref({
  amount: [
    { required: true, message: '请输入消费金额', trigger: 'blur' },
    { type: 'number', transform: (value) => Number(value), message: '请输入数字', trigger: 'blur' },
    {
      type: 'number',
      asyncValidator: (_, value) => {
        return new Promise((resolve, reject) => {
          if (value <= 0) {
            reject(new Error('必须大于0'))
          } else {
            resolve()
          }
        })
      },
      message: '必须大于0',
      trigger: 'blur'
    }
  ]
})
</script>

<style scoped lang="scss">
@use './rule.scss';
</style>
