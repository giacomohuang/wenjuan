<template>
  <div>适用商户</div>
  <a-select v-model:value="modelValue.method">
    <a-select-option value="include">包含</a-select-option>
    <a-select-option value="exclude">排除</a-select-option>
  </a-select>
  <div class="selected-merchants-display">
    <template v-for="(merchant, index) in displaySelectedMerchants" :key="merchant.id">
      <a-tag v-if="index < maxDisplayCount">{{ merchant.name }}</a-tag>
      <a-tag v-if="index === maxDisplayCount - 1 && actualSelectedMerchants.length > maxDisplayCount">其他({{ actualSelectedMerchants.length - maxDisplayCount }})</a-tag>
    </template>
    <a-button type="primary" @click="openModal = true">选择商户</a-button>
  </div>
  <a-modal v-model:open="openModal" title="选择商户" style="width: 1000px" @ok="handleOk">
    <div class="merchants-selector">
      <div class="filter-section">
        <div class="floor-filter">
          <h4>按楼层筛选</h4>
          <div class="floor-list">
            <a-checkbox v-for="floor in floors" :key="floor" :checked="isFloorChecked(floor)" :indeterminate="isFloorIndeterminate(floor)" @change="(e) => handleFloorChange(floor, e.target.checked)">
              {{ floor }}
            </a-checkbox>
          </div>
        </div>

        <div class="category-filter">
          <h4>按分类筛选</h4>
          <div class="category-tree">
            <a-tree :treeData="categoryTree" checkable :checkedKeys="selectedCategoryKeys" :checkStrictly="true" @check="handleCategoryCheck" :fieldNames="{ key: 'code', title: 'name', children: 'children' }" />
          </div>
        </div>
      </div>

      <div class="transfer-section">
        <a-transfer
          :dataSource="transferDataSource"
          :titles="['可选商户', '已选商户']"
          :targetKeys="selectedMerchantKeys"
          :selectedKeys="transferSelectedKeys"
          :listStyle="{
            width: '350px',
            height: '550px'
          }"
          @change="handleTransferChange"
          @selectChange="handleTransferSelectChange"
          :render="(item) => item.title"
          showSearch
          :filterOption="filterOption"
        />
      </div>
    </div>
    <div class="selected-info">
      <div>选中分类: {{ selectedCategoryKeys }}</div>
      <div>选中楼层: {{ selectedFloors }}</div>
      <div>选中商户: {{ selectedMerchantKeys }}</div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { category, merchants, floors } from './testdata'

const { modelValue } = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
})

// 构建分类树
const categoryTree = computed(() => {
  const tree = []
  const map = {}

  // 先构建每个节点
  category.forEach((item) => {
    map[item.code] = {
      ...item,
      children: []
    }
  })

  // 构建树结构
  category.forEach((item) => {
    if (item.parent_id === 0) {
      tree.push(map[item.code])
    } else if (map[item.parent_id]) {
      map[item.parent_id].children.push(map[item.code])
    }
  })
  return tree
})

const emit = defineEmits(['update:modelValue'])
const openModal = ref(false)

// 最大显示商户数量
const maxDisplayCount = 5
// 选中的楼层列表
const selectedFloors = ref(modelValue.floors ?? [])
// 选中的分类列表
const selectedCategoryKeys = ref(modelValue.categories ?? [])
const halfCheckedCategoryKeys = ref([])
// 选中的商户ID列表
const selectedMerchantKeys = ref(fixSelectedMerchantKeys())
// 穿梭框中当前选中的项目
const transferSelectedKeys = ref([])
// 构建Transfer数据源
const transferDataSource = computed(() => {
  return merchants.map((merchant) => ({
    key: merchant.id,
    title: merchant.name,
    description: merchant.name,
    disabled: false,
    category: merchant.category,
    floor: merchant.floor
  }))
})

// 根据分类获取对应的所有商户ID
const getMerchantsByCategoryCode = (categoryCode) => {
  // 获取该分类和所有子分类的编码
  const getAllChildCodes = (code) => {
    const result = [code]
    category.forEach((item) => {
      if (item.parent_id === code) {
        result.push(...getAllChildCodes(item.code))
      }
    })
    return result
  }

  const categoryCodes = getAllChildCodes(categoryCode)
  return merchants.filter((merchant) => categoryCodes.includes(merchant.category)).map((merchant) => merchant.id)
}

// 根据楼层获取对应的所有商户ID
const getMerchantsByFloor = (floor) => {
  return merchants.filter((merchant) => merchant.floor.includes(floor)).map((merchant) => merchant.id)
}

// 检查楼层是否被选中
const isFloorChecked = (floor) => {
  return selectedFloors.value.includes(floor)
}

// 检查楼层是否部分选中
const isFloorIndeterminate = (floor) => {
  const merchantsInFloor = getMerchantsByFloor(floor)
  const hasSelected = merchantsInFloor.some((id) => selectedMerchantKeys.value.includes(id))
  return hasSelected && !selectedFloors.value.includes(floor)
}

// 更新选中的楼层列表
const updateSelectedFloors = () => {
  const newSelectedFloors = []

  floors.forEach((floor) => {
    const merchantsInFloor = getMerchantsByFloor(floor)
    // 如果该楼层的所有商户都已选中，则楼层被选中
    if (merchantsInFloor.every((id) => selectedMerchantKeys.value.includes(id))) {
      newSelectedFloors.push(floor)
    }
  })

  selectedFloors.value = newSelectedFloors
}

// 更新分类选中状态
const updateCategoryCheckState = () => {
  const checkedCategories = []
  const halfCheckedCategories = []

  // 递归检查每个分类状态
  const checkCategoryState = (categoryCode) => {
    const merchantIds = getMerchantsByCategoryCode(categoryCode)

    if (merchantIds.length === 0) return false

    const allSelected = merchantIds.every((id) => selectedMerchantKeys.value.includes(id))
    const someSelected = merchantIds.some((id) => selectedMerchantKeys.value.includes(id))

    if (allSelected) {
      checkedCategories.push(categoryCode)
      return 'full'
    } else if (someSelected) {
      halfCheckedCategories.push(categoryCode)
      return 'half'
    }
    return 'none'
  }

  // 从根分类开始检查
  category
    .filter((c) => c.parent_id === 0)
    .forEach((rootCategory) => {
      const result = checkCategoryState(rootCategory.code)

      // 检查子分类
      const checkChildren = (parentCode) => {
        category
          .filter((c) => c.parent_id === parentCode)
          .forEach((child) => {
            const childResult = checkCategoryState(child.code)
            if (childResult === 'half' && !halfCheckedCategories.includes(parentCode)) {
              halfCheckedCategories.push(parentCode)
            }
            checkChildren(child.code)
          })
      }

      checkChildren(rootCategory.code)
    })

  selectedCategoryKeys.value = checkedCategories
  halfCheckedCategoryKeys.value = halfCheckedCategories
}

function fixSelectedMerchantKeys() {
  const selectedMerchantKeys = []
  merchants.forEach((merchant) => {
    // 如果选中的商户ID包含该商户ID，或者选中的楼层包含该商户的楼层(商户有可能属于多个楼层)，或者选中的分类包含该商户的分类，则将该商户ID加入到选中的商户ID列表中
    if (modelValue.merchants?.includes(merchant.id) || modelValue.floors.some((f) => merchant.floor.includes(f)) || modelValue.categories?.includes(merchant.category)) {
      selectedMerchantKeys.push(merchant.id)
    }
  })
  return selectedMerchantKeys
}

// 处理楼层切换
const handleFloorChange = (floor, checked) => {
  const merchantsInFloor = getMerchantsByFloor(floor)

  // 更新选中楼层列表
  if (checked) {
    if (!selectedFloors.value.includes(floor)) {
      selectedFloors.value = [...selectedFloors.value, floor]
    }

    // 添加该楼层所有未选中的商户
    const newSelected = [...selectedMerchantKeys.value]
    merchantsInFloor.forEach((id) => {
      if (!newSelected.includes(id)) {
        newSelected.push(id)
      }
    })
    selectedMerchantKeys.value = newSelected
  } else {
    // 从选中楼层中移除
    selectedFloors.value = selectedFloors.value.filter((f) => f !== floor)

    // 移除该楼层所有选中的商户
    selectedMerchantKeys.value = selectedMerchantKeys.value.filter((id) => !merchantsInFloor.includes(id))
  }
}

// 处理分类选中/取消选中
const handleCategoryCheck = (checkedKeys, e) => {
  const { checked, node } = e
  const categoryCode = node.code
  const merchantIdsInCategory = getMerchantsByCategoryCode(categoryCode)

  if (checked) {
    // 添加该分类所有未选中的商户
    const newSelected = [...selectedMerchantKeys.value]
    merchantIdsInCategory.forEach((id) => {
      if (!newSelected.includes(id)) {
        newSelected.push(id)
      }
    })
    selectedMerchantKeys.value = newSelected
  } else {
    // 移除该分类所有选中的商户
    selectedMerchantKeys.value = selectedMerchantKeys.value.filter((id) => !merchantIdsInCategory.includes(id))
  }

  // 更新分类树选中状态
  updateCategoryCheckState()
  // 更新楼层选中状态
  updateSelectedFloors()
}

// 处理穿梭框变化 (移动项目)
const handleTransferChange = (nextTargetKeys) => {
  selectedMerchantKeys.value = nextTargetKeys
  updateCategoryCheckState()
  updateSelectedFloors()
}

// 处理穿梭框选择变化
const handleTransferSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
  transferSelectedKeys.value = [...sourceSelectedKeys, ...targetSelectedKeys]
}

// 穿梭框搜索过滤
const filterOption = (inputValue, item) => {
  return item.title.indexOf(inputValue) !== -1
}

const handleOk = () => {
  // 获取实际选中的所有商户ID
  const allSelectedMerchantIds = actualSelectedMerchants.value.map((merchant) => merchant.id)

  // 确保更新的数据包含type字段，保持数据结构一致
  emit('update:modelValue', {
    ...modelValue,
    merchants: allSelectedMerchantIds,
    floors: selectedFloors.value,
    categories: selectedCategoryKeys.value
  })
  openModal.value = false
}

// 获取实际选中的商户列表（包括通过楼层和分类选中的）
const actualSelectedMerchants = computed(() => {
  // 已明确选择的商户ID
  const explicitlySelectedIds = selectedMerchantKeys.value

  // 从全选楼层获取的商户ID
  const selectedFloorMerchantIds = selectedFloors.value.flatMap((floor) => getMerchantsByFloor(floor))

  // 从全选分类获取的商户ID
  const selectedCategoryMerchantIds = selectedCategoryKeys.value.flatMap((categoryCode) => getMerchantsByCategoryCode(categoryCode))

  // 合并所有选中的商户ID并去重
  const allSelectedIds = [...new Set([...explicitlySelectedIds, ...selectedFloorMerchantIds, ...selectedCategoryMerchantIds])]

  // 从选中ID转换为完整商户对象
  return merchants.filter((merchant) => allSelectedIds.includes(merchant.id))
})

// 用于显示的商户列表
const displaySelectedMerchants = computed(() => {
  return actualSelectedMerchants.value.slice(0, maxDisplayCount + 1)
})

// 初始化
onMounted(() => {
  updateCategoryCheckState()
  updateSelectedFloors()
})
</script>

<style scoped lang="scss">
.merchants-selector {
  display: flex;
  flex-direction: row;
  gap: 20px;
  // min-height: 600px;
  // width: 1000px;
  flex-wrap: nowrap;

  .filter-section {
    // flex-basis: 260px;
    flex-shrink: 0;
    width: 200px;
    display: flex;
    flex-direction: column;
    gap: 20px;

    .floor-filter,
    .category-filter {
      padding: 15px;
      border: 1px solid var(--border-medium);
      border-radius: 4px;

      h4 {
        margin-top: 0;
        margin-bottom: 12px;
      }
    }

    .floor-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .category-tree {
      max-height: 350px;
      overflow-y: auto;
    }

    .category-filter {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }
  }

  .transfer-section {
    flex: 1;
    display: flex;
    align-items: flex-start;
  }

  .selected-info {
    flex-basis: 100%;
    margin-top: 20px;
    padding: 10px;
    border: 1px solid var(--border-medium);
    border-radius: 4px;
    background-color: var(--bg-secondary);
  }
}

.selected-merchants-display {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  // margin-left: 8px;
}
</style>
