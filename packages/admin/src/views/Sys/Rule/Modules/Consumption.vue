<template>
  <div class="rules">
    <a-form :model="modelValue" layout="inline" :rules="validateRules">
      <a-form-item name="merchantRange">
        <a-select v-model:value="modelValue.merchantRange" :options="merchantRangeOptions" :dropdownMatchSelectWidth="false"></a-select>
      </a-form-item>
      <a-form-item name="merchant">
        <a-button type="primary" @click="merchantModalOpen = true">选择商户</a-button>
      </a-form-item>
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
  <a-modal v-model:open="merchantModalOpen" title="选择商户" @ok="handleMerchantOk" width="1000px">
    <div class="modal-wrap">
      <div class="left-wrap" v-if="projects.length > 0">
        <mp-tabs v-model="activeProjectKey" :tabs="projects" style="width: 150px; height: 400px">
          <template #item="{ data }">
            <span>{{ data.name }} (23)</span>
          </template>
        </mp-tabs>
      </div>
      <div class="right-wrap">
        <a-radio-group v-model:value="activeFilter" style="align-self: center">
          <a-radio-button value="floor">楼层</a-radio-button>
          <a-radio-button value="category">业态</a-radio-button>
        </a-radio-group>
        <div class="merchant-wrap" v-if="activeFilter === 'floor'">
          <div v-for="floor in floorsComputed" :key="floor.code">
            <a-checkbox v-model:checked="selectedFloors[floor.code]">
              <span class="floor-name">{{ floor.name }}</span>
            </a-checkbox>
            <div class="merchant-list">
              <a-tag v-for="merchant in getMerchantsGroupByFloor(floor.code)" :key="merchant.id">{{ merchant.name }}</a-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { projects, categories, merchants, floors, blocks } from './testdata'
import mpTabs from '@/components/mpTabs.vue'

const emit = defineEmits(['update:modelValue'])
const { modelValue } = defineProps({
  modelValue: {
    type: Object
  }
})

modelValue.merchantRange ??= 'All'
modelValue.timeRange ??= 'NoLimit'
modelValue.consumptionType ??= 'ConsumptionAmount'
modelValue.operator ??= 'gte'

const merchantModalOpen = ref(false)
const activeProjectKey = ref(projects[0]?.id)
const activeFilter = ref('floor')
const selectedFloors = ref([])

const merchantsComputed = computed(() => {
  console.log(activeProjectKey.value)
  return merchants.filter((item) => item.projectId === activeProjectKey.value)
})

const floorsComputed = computed(() => {
  return floors.filter((item) => item.projectId === activeProjectKey.value).sort((a, b) => a.code - b.code)
})

const categoriesComputed = computed(() => {
  return categories.filter((item) => item.projectId === activeProjectKey.value)
})

function getMerchantsGroupByFloor(code) {
  return merchantsComputed.value.filter((item) => item.floorCode === code)
}

const merchantRangeOptions = [
  { label: '全部商户', value: 'All' },
  { label: '包含指定商户', value: 'Include' },
  { label: '排除指定商户', value: 'Exclude' }
]

const consumptionTypeOptions = [
  { label: '消费金额', value: 'ConsumptionAmount', placeholder: '请输入消费金额', unit: '元' },
  { label: '消费积分', value: 'ConsumptionPoint', placeholder: '请输入消费积分', unit: '分' },
  { label: '消费积分+其他积分', value: 'AllPoint', placeholder: '请输入积分', unit: '分' }
]

const operatorOptions = [
  { label: '>=', value: 'gte' },
  { label: '>', value: 'gt' }
]

const rangeOptions = [
  { label: '任意时间', value: 'NoLimit' },
  { label: '最近一年', value: 'LastYear' },
  { label: '当天', value: 'Today' },
  { label: '当月', value: 'CurrentMonth' },
  { label: '连续三个月', value: 'ThreeConsecMonths' },
  { label: '本财年', value: 'CurrFiscalYear' },
  { label: '办卡之日起', value: 'SinceCardIssuance' },
  { label: '变为当前等级之日起', value: 'SinceCurrLevel' },
  { label: '最近30天', value: 'Last30Days' },
  { label: '最近90天', value: 'Last90Days' },
  { label: '最近180天', value: 'Last180Days' }
]

const amountPlaceholder = computed(() => {
  return consumptionTypeOptions.find((item) => item.value === modelValue.consumptionType)?.placeholder
})

const unit = computed(() => {
  return consumptionTypeOptions.find((item) => item.value === modelValue.consumptionType)?.unit
})

// 当组件内部需要更新 modelValue 时使用此函数
const updateValue = (newValue) => {
  emit('update:modelValue', newValue)
}

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

const handleMerchantOk = () => {
  merchantModalOpen.value = false
}
</script>

<style scoped lang="scss">
@use './rule.scss';

.modal-wrap {
  display: flex;
  gap: 20px;
}
.right-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-grow: 1;
}
.merchant-wrap {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.floor-name {
  font-size: 16px;
  line-height: 32px;
  // font-weight: 600;
}
</style>
