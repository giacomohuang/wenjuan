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
        <mp-tabs v-model="activeProjectKey" :tabs="projects" style="width: 150px; height: 600px">
          <template #item="{ data }">
            <div class="project-item">
              <span class="project-name">{{ data.name }}</span>
              <span class="project-count">({{ getSelectedMerchantsCountByProject(data.id) }})</span>
            </div>
          </template>
        </mp-tabs>
      </div>
      <div class="right-wrap">
        <a-radio-group v-model:value="activeFilter" style="align-self: center">
          <a-radio-button value="floor">楼层</a-radio-button>
          <a-radio-button value="category">业态</a-radio-button>
        </a-radio-group>
        <div class="merchant-wrap" v-if="activeFilter === 'floor'">
          <div v-for="floor in floorsComputed" :key="floor.id">
            <a-checkbox v-if="getMerchantsGroupByFloor(floor.id).length > 0" @change="handleFloorChecked($event, floor.id)" :checked="isMerchantsAllChecked(floor.id)" :indeterminate="isMerchantsSomeChecked(floor.id)">
              <span class="floor-name">{{ floor.name }}</span>
            </a-checkbox>
            <div class="merchant-list">
              <mp-tag v-for="merchant in getMerchantsGroupByFloor(floor.id)" :key="merchant.id" @click.stop="handleMerchantChecked(floor.id, merchant.id)" :color="selectedMerchants.has(merchant.id) ? 'blue' : 'gray'">{{ merchant.id }}{{ merchant.name }}</mp-tag>
            </div>
          </div>
        </div>
        <div class="merchant-wrap" v-if="activeFilter === 'category'">
          <div v-for="category in categoriesComputed" :key="category.id">
            <a-checkbox @change="handleCategoryChecked($event, category.id)" :checked="isMerchantsAllChecked(category.id)" :indeterminate="isMerchantsSomeChecked(category.id)">
              <span class="category-name">{{ category.name }}</span>
            </a-checkbox>
            <div class="merchant-list">
              <mp-tag v-for="merchant in getMerchantsGroupByCategory(category.id)" :key="merchant.id" @click.stop="handleMerchantChecked(floor.id, merchant.id)" :color="selectedMerchants.has(merchant.id) ? 'blue' : 'gray'">{{ merchant.id }}{{ merchant.name }}</mp-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    floors:{{ selectedFloors }} merchants:{{ selectedMerchants }}
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

const selectedFloors = ref(new Set(modelValue.floors))
const selectedMerchants = ref(new Set(modelValue.merchants))

fixSelectedMerchants()
fixSelectedFloors()
function fixSelectedMerchants() {
  for (const floorId of selectedFloors.value) {
    // console.log('floor', floorId)
    const m = merchants
      .filter((item) => {
        if (Array.isArray(item.floorId)) {
          return item.floorId.includes(floorId)
        } else {
          return item.floorId == floorId
        }
      })
      .map((item) => item.id)
    selectedMerchants.value = new Set([...selectedMerchants.value, ...m])
  }
}

function getSelectedMerchantsCountByProject(id) {
  return merchants.filter((item) => item.projectId === id && selectedMerchants.value.has(item.id)).length
}

function fixSelectedFloors() {
  // 根据merchants的商户数据，如果楼层所在商户全部被选中，则选中该楼层
  // for (const floor of floorsComputed.value) {
  //   if (getMerchantsGroupByFloor(floor.id).every((item) => selectedMerchants.value.has(item.id))) {
  //     selectedFloors.value.add(floor.id)
  //   } else {
  //     selectedFloors.value.delete(floor.id)
  //   }
  // }
}

// 获取某个项目下的所有商户
const merchantsComputed = computed(() => {
  return merchants.filter((item) => item.projectId === activeProjectKey.value)
})

// 获取某个项目下的所有楼层
const floorsComputed = computed(() => {
  return floors.filter((item) => item.projectId === activeProjectKey.value).sort((a, b) => a.code - b.code)
})

// 获取某个项目下的所有业态，需要考虑嵌套
const categoriesComputed = computed(() => {
  return categories.filter((item) => item.projectId === activeProjectKey.value)
})

// 获取某个项目下的所有商户，根据楼层分组
function getMerchantsGroupByFloor(id) {
  return merchantsComputed.value.filter((item) => {
    if (Array.isArray(item.floorId)) {
      return item.floorId.includes(id)
    } else {
      return item.floorId === id
    }
  })
}

// 获取某个项目下的所有商户，根据业态分组
function getMerchantsGroupByCategory(id) {
  return merchantsComputed.value.filter((item) => item.categoryId === id)
}

// 处理楼层选中
function handleFloorChecked(e, floorId) {
  // console.log(selectedFloors.value)
  if (e.target.checked) {
    selectedFloors.value.add(floorId)
    const merchants = getMerchantsGroupByFloor(floorId)
    for (const merchant of merchants) {
      selectedMerchants.value.add(merchant.id)
    }
  } else {
    selectedFloors.value.delete(floorId)
    const merchants = getMerchantsGroupByFloor(floorId)
    for (const merchant of merchants) {
      selectedMerchants.value.delete(merchant.id)
    }
  }
}

// 处理商户选中
function handleMerchantChecked(floorId, merchantId) {
  if (selectedMerchants.value.has(merchantId)) {
    selectedMerchants.value.delete(merchantId)
  } else {
    selectedMerchants.value.add(merchantId)
  }
  // 如果该楼层的所有商户都没有被选中，则取消选中该楼层
  if (getMerchantsGroupByFloor(floorId).every((item) => selectedMerchants.value.has(item.id))) {
    selectedFloors.value.add(floorId)
  } else {
    selectedFloors.value.delete(floorId)
  }
}

// 判断某个楼层下的商户是否部分选中
function isMerchantsSomeChecked(floorId) {
  const merchants = getMerchantsGroupByFloor(floorId)
  // 如果该楼层下的商户部分选中，则返回 true
  return merchants.some((item) => selectedMerchants.value.has(item.id)) && !merchants.every((item) => selectedMerchants.value.has(item.id))
}

// 判断某个楼层下的商户是否全部选中
function isMerchantsAllChecked(floorId) {
  return selectedFloors.value.has(floorId) || getMerchantsGroupByFloor(floorId).every((item) => selectedMerchants.value.has(item.id))
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
  // height: 300px;
}
.merchant-wrap {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 600px;
  overflow: auto;
}
.project-item {
  display: flex;
  align-items: center;
  padding-right: 12px;
}
.project-name {
  display: inline-block;
  // width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.project-count {
  padding-left: 4px;
  flex-shrink: 0;
  font-size: 12px;
  color: var(--text-tertiary);
}
.floor-name {
  font-size: 16px;
  line-height: 32px;
  // font-weight: 600;
}
.merchant-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  > span {
    cursor: pointer;
  }
}
</style>
