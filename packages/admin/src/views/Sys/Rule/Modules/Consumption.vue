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
            <div class="project-item">
              <span class="project-name">{{ data.name }}</span>
              <span class="project-count">({{ getSelectedMerchantsCountByProject(data.id) }}/{{ getMerchantsCountByProject(data.id) }})</span>
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
            <a-checkbox v-if="getMerchantsGroupByFloor(floor.id).length > 0" @change="handleFloorChecked($event, floor.id)" :checked="isMerchantsAllChecked('floor', floor.id)" :indeterminate="isMerchantsSomeChecked('floor', floor.id)">
              <span class="floor-name">{{ floor.name }}</span>
            </a-checkbox>
            <div class="merchant-list">
              <mp-tag v-for="merchant in getMerchantsGroupByFloor(floor.id)" :key="merchant.id" @click.stop="handleMerchantChecked(merchant.id)" :color="selectedMerchants.has(merchant.id) ? 'blue' : 'gray'">{{ merchant.id }}{{ merchant.name }}</mp-tag>
            </div>
          </div>
        </div>
        <div class="merchant-wrap" v-if="activeFilter === 'category'">
          <div v-for="category in categoriesComputed" :key="category.id">
            <a-checkbox v-if="getMerchantsGroupByCategory(category.id).length > 0" @change="handleCategoryChecked($event, category.id)" :checked="isMerchantsAllChecked('category', category.id)" :indeterminate="isMerchantsSomeChecked('category', category.id)">
              <span class="category-name">{{ category.name }}</span>
            </a-checkbox>
            <div class="merchant-list">
              <mp-tag v-for="merchant in getMerchantsGroupByCategory(category.id)" :key="merchant.id" @click.stop="handleMerchantChecked(merchant.id)" :color="selectedMerchants.has(merchant.id) ? 'blue' : 'gray'">{{ merchant.id }}{{ merchant.name }}</mp-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
    floors:{{ selectedFloors }} category:{{ selectedCategories }} merchants:{{ selectedMerchants }}
  </a-modal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { projects, categories, merchants, floors, blocks } from './testdata'
import mpTabs from '@/components/mpTabs.vue'
import 'simplebar'
import 'simplebar/dist/simplebar.min.css'

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
const selectedCategories = ref(new Set(modelValue.categories))

fixSelectedMerchants()

// 根据选中的楼层，从商户基本表中表中获取当前最新的商户数据，解决规则表中的商户数据可能滞后的问题
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
  for (const categoryId of selectedCategories.value) {
    const m = merchants.filter((item) => item.categoryId == categoryId).map((item) => item.id)
    selectedMerchants.value = new Set([...selectedMerchants.value, ...m])
  }
}

function getSelectedMerchantsCountByProject(id) {
  return merchants.filter((item) => item.projectId === id && selectedMerchants.value.has(item.id)).length
}

function getMerchantsCountByProject(id) {
  return merchants.filter((item) => item.projectId === id).length
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
  console.log(e.target.checked, floorId)
  const merchants = getMerchantsGroupByFloor(floorId)
  if (e.target.checked) {
    for (const merchant of merchants) {
      selectedMerchants.value.add(merchant.id)
    }
    selectedFloors.value.add(floorId)
  } else {
    for (const merchant of merchants) {
      selectedMerchants.value.delete(merchant.id)
    }
    selectedFloors.value.delete(floorId)
  }
}

// 处理业态选中
function handleCategoryChecked(e, categoryId) {
  console.log(e.target.checked, categoryId)
  const merchants = getMerchantsGroupByCategory(categoryId)
  if (e.target.checked) {
    for (const merchant of merchants) {
      selectedMerchants.value.add(merchant.id)
    }
    selectedCategories.value.add(categoryId)
  } else {
    for (const merchant of merchants) {
      selectedMerchants.value.delete(merchant.id)
    }
    selectedCategories.value.delete(categoryId)
  }
}

// 处理商户选中
function handleMerchantChecked(merchantId) {
  // 如果该商户被选中，则取消选中该商户
  if (selectedMerchants.value.has(merchantId)) {
    selectedMerchants.value.delete(merchantId)
  } else {
    selectedMerchants.value.add(merchantId)
  }

  // 考虑一个商户可能属于多个楼层
  const floors = merchants.find((item) => item.id === merchantId)?.floorId
  const floorIds = Array.isArray(floors) ? floors : [floors]
  for (let floorId of floorIds) {
    // 如果该楼层的所有商户都没有被选中，则取消选中该楼层
    if (getMerchantsGroupByFloor(floorId).every((item) => selectedMerchants.value.has(item.id))) {
      selectedFloors.value.add(floorId)
    } else {
      selectedFloors.value.delete(floorId)
    }
  }
  // 考虑一个商户只属于一个业态
  const category = merchants.find((item) => item.id === merchantId)?.categoryId
  if (getMerchantsGroupByCategory(category).every((item) => selectedMerchants.value.has(item.id))) {
    selectedCategories.value.add(category)
  } else {
    selectedCategories.value.delete(category)
  }
}

// 判断某个楼层下的商户是否部分选中
function isMerchantsSomeChecked(type, id) {
  const merchants = type === 'floor' ? getMerchantsGroupByFloor(id) : getMerchantsGroupByCategory(id)
  // 如果该楼层下的商户部分选中，则返回 true
  const isSomeChecked = merchants.some((item) => selectedMerchants.value.has(item.id)) && !merchants.every((item) => selectedMerchants.value.has(item.id))
  // console.log('isMerchantsSomeChecked', id, isSomeChecked)
  return isSomeChecked
}

// 判断某个楼层下的商户是否全部选中
function isMerchantsAllChecked(type, id) {
  const merchants = type === 'floor' ? getMerchantsGroupByFloor(id) : getMerchantsGroupByCategory(id)
  const isAllChecked = merchants.length > 0 && merchants.every((item) => selectedMerchants.value.has(item.id))
  console.log('isMerchantsAllChecked', id, isAllChecked)
  return isAllChecked
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
.left-wrap {
  flex-shrink: 1;
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
  user-select: none;

  height: 400px;
  overflow: auto;
  margin-bottom: 20px;
  margin-bottom: 20px;
}
.project-item {
  display: flex;
  align-items: center;
  padding-right: 12px;
  cursor: pointer;
}
.project-name {
  display: inline-block;
  // width: 100px;
  line-height: 32px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-count {
  padding-left: 4px;
  flex-shrink: 0;
  font-size: 12px;
  color: var(--text-tertiary);
}
.floor-name,
.category-name {
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
