<template>
  <div class="merchants-filter">
    <a-card title="商户筛选" :bordered="false">
      <a-row :gutter="16">
        <a-col :span="6">
          <div class="filter-section">
            <h3>商户分类</h3>
            <a-tree checkable v-model:checkedKeys="checkedKeys" v-model:expandedKeys="expandedKeys" :tree-data="treeData" :fieldNames="{ title: 'name', key: 'code' }" @check="onCategoryCheck" :selectable="false" />
          </div>
        </a-col>
        <a-col :span="4">
          <div class="filter-section">
            <h3>楼层选择</h3>
            <div v-for="floor in floors" :key="floor">
              <a-checkbox :value="floor" :checked="isFloorChecked(floor)" :indeterminate="isFloorIndeterminate(floor)" @change="(e) => onSingleFloorChange(floor, e.target.checked)">{{ floor }}</a-checkbox>
            </div>
          </div>
          <div class="filter-actions">
            <a-button type="primary" @click="applyFilter" style="margin-top: 16px">应用筛选</a-button>
            <a-button @click="resetFilter" style="margin-top: 8px">重置</a-button>
          </div>
        </a-col>
        <a-col :span="14">
          <div class="merchant-selection">
            <h3>商户选择</h3>
            <a-transfer
              v-model:targetKeys="selectedMerchantKeys"
              :dataSource="transferDataSource"
              :titles="['可选商户', '已选商户']"
              :render="(item) => item.title"
              @change="handleMerchantTransferChange"
              :showSearch="true"
              :filterOption="filterMerchantOption"
              :listStyle="{
                width: '100%',
                height: '400px'
              }"
            />
            <div class="selection-summary" style="margin-top: 16px">
              <span>已选商户数量: {{ selectedMerchantKeys.length }}</span>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'

const category = [
  { code: 'R1001', name: '零售', parent_id: 0 },
  { code: 'R100101', name: '时尚服饰', parent_id: 'R1001' },
  { code: 'R10010101', name: '女装', parent_id: 'R100101' },
  { code: 'R10010102', name: '男装', parent_id: 'R100101' },
  { code: 'R100102', name: '美妆个护', parent_id: 'R1001' },

  { code: 'R10010201', name: '国际美妆', parent_id: 'R100102' },
  { code: 'R100103', name: '运动户外', parent_id: 'R1001' },
  { code: 'R100104', name: '电子产品', parent_id: 'R1001' },
  { code: 'R100105', name: '内衣', parent_id: 'R1001' },
  { code: 'R100106', name: '珠宝首饰', parent_id: 'R1001' },
  { code: 'R100107', name: '鞋类', parent_id: 'R1001' },
  { code: 'F2001', name: '餐饮', parent_id: 0 },
  { code: 'F200101', name: '中式餐饮', parent_id: 'F2001' },
  { code: 'F20010101', name: '川湘菜系', parent_id: 'F200101' },
  { code: 'F20010102', name: '酸菜鱼', parent_id: 'F200101' },
  { code: 'F20010103', name: '火锅', parent_id: 'F200101' },
  { code: 'F200102', name: '西式餐饮', parent_id: 'F2001' },
  { code: 'F20010201', name: '意式餐厅', parent_id: 'F200102' },
  { code: 'F200103', name: '甜品饮品', parent_id: 'F2001' },
  { code: 'F20010301', name: '咖啡茶饮', parent_id: 'F200103' },
  { code: 'F20010302', name: '甜品饮品', parent_id: 'F200103' },

  { code: 'E3001', name: '休闲娱乐', parent_id: 0 },
  { code: 'E300101', name: '影院', parent_id: 'E3001' },
  { code: 'E300102', name: '健身中心', parent_id: 'E3001' },
  { code: 'E300103', name: '电玩城', parent_id: 'E3001' },

  { code: 'K4001', name: '儿童亲子', parent_id: 0 },
  { code: 'K400101', name: '儿童教育', parent_id: 'K4001' },
  { code: 'K400102', name: '儿童游乐', parent_id: 'K4001' },

  { code: 'S5001', name: '生活服务', parent_id: 0 },
  { code: 'S500101', name: '金融服务', parent_id: 'S5001' },
  { code: 'S500102', name: '生活服务A', parent_id: 'S5001' },
  { code: 'S500103', name: '生活服务B', parent_id: 'S5001' },
  { code: 'S500104', name: '照相', parent_id: 'S5001' }
]

const merchants = {
  merchants: [
    {
      id: 'M001',
      name: 'ZARA女装旗舰店',
      category: 'R10010101',
      floor: 'L1'
    },
    {
      id: 'M015',
      name: '海底捞火锅',
      category: 'F20010101',
      floor: 'L5'
    },
    {
      id: 'M023',
      name: '万达影城IMAX',
      category: 'E300101',
      floor: 'L6'
    },
    {
      id: 'M037',
      name: '乐高教育中心',
      category: 'K400101',
      floor: 'L3'
    },
    {
      id: 'M044',
      name: '星巴克臻选店',
      category: 'F20010201',
      floor: 'L1'
    },
    {
      id: 'M062',
      name: '迪卡侬运动超市',
      category: 'R100103',
      floor: 'L2'
    },
    {
      id: 'M078',
      name: '招商银行网点',
      category: 'S500101',
      floor: 'B1'
    },
    {
      id: 'M083',
      name: '汤姆熊电玩城',
      category: 'E300103',
      floor: 'L4'
    },
    {
      id: 'M091',
      name: '孩子王母婴店',
      category: 'K400102',
      floor: 'L3'
    },
    {
      id: 'M100',
      name: '华为智能生活馆',
      category: 'R100103',
      floor: 'L1'
    },
    {
      id: 'M101',
      name: '雅诗兰黛专柜',
      category: 'R10010201',
      floor: 'L1'
    },
    {
      id: 'M102',
      name: '优衣库旗舰店',
      category: 'R10010102',
      floor: 'L2'
    },
    {
      id: 'M103',
      name: '西西弗书店',
      category: 'S500102',
      floor: 'L3'
    },
    {
      id: 'M104',
      name: '喜茶LAB店',
      category: 'F20010301',
      floor: 'L5'
    },
    {
      id: 'M105',
      name: '金宝贝早教中心',
      category: 'K400101',
      floor: 'L3'
    },
    {
      id: 'M106',
      name: '大疆体验店',
      category: 'R100104',
      floor: 'L1'
    },
    {
      id: 'M107',
      name: '全棉时代',
      category: 'R100105',
      floor: 'B1'
    },
    {
      id: 'M108',
      name: '海底捞智慧餐厅',
      category: 'F20010101',
      floor: 'L6'
    },
    {
      id: 'M109',
      name: '乐刻运动24H',
      category: 'E300102',
      floor: 'L4'
    },
    {
      id: 'M110',
      name: '盒马鲜生',
      category: 'S500103',
      floor: 'B1'
    },
    {
      id: 'M111',
      name: '泡泡玛特主题店',
      category: 'R100106',
      floor: 'L2'
    },
    {
      id: 'M112',
      name: '太二酸菜鱼',
      category: 'F20010102',
      floor: 'L5'
    },
    {
      id: 'M113',
      name: '星际传奇电玩',
      category: 'E300103',
      floor: 'L4'
    },
    {
      id: 'M114',
      name: '周大福传承馆',
      category: 'R100107',
      floor: 'L1'
    },
    {
      id: 'M115',
      name: '美吉姆国际早教',
      category: 'K400101',
      floor: 'L3'
    },
    {
      id: 'M116',
      name: '苹果授权店',
      category: 'R100104',
      floor: 'L1'
    },
    {
      id: 'M117',
      name: '西西弗矢量咖啡',
      category: 'F20010302',
      floor: 'L3'
    },
    {
      id: 'M118',
      name: '海马体照相馆',
      category: 'S500104',
      floor: 'L2'
    },
    {
      id: 'M119',
      name: '超级猩猩健身',
      category: 'E300102',
      floor: 'L4'
    },
    {
      id: 'M120',
      name: '小米之家',
      category: 'R100104',
      floor: 'L2'
    },
    {
      id: 'M121',
      name: '奈雪の茶PRO',
      category: 'F20010301',
      floor: 'L5'
    },
    {
      id: 'M122',
      name: '孩子王儿童乐园',
      category: 'K400102',
      floor: 'L3'
    },
    {
      id: 'M123',
      name: '顺电脉体验店',
      category: 'R100104',
      floor: 'L1'
    },
    {
      id: 'M124',
      name: '钟书阁书店',
      category: 'S500102',
      floor: 'L3'
    },
    {
      id: 'M125',
      name: '捞王锅物料理',
      category: 'F20010103',
      floor: 'L5'
    },
    {
      id: 'M126',
      name: '星际传奇VR体验馆',
      category: 'E300103',
      floor: 'L4'
    },
    {
      id: 'M127',
      name: '完美日记体验店',
      category: 'R10010201',
      floor: 'L1'
    },
    {
      id: 'M128',
      name: '中信银行网点',
      category: 'S500101',
      floor: 'B1'
    },
    {
      id: 'M129',
      name: 'Meland儿童乐园',
      category: 'K400102',
      floor: 'L3'
    },
    {
      id: 'M130',
      name: '华为智能家居馆',
      category: 'R100104',
      floor: 'L1'
    }
  ]
}

const floors = ref(['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'B1'])
const selectedFloors = ref([])

// 定义表格列
const columns = [
  {
    title: '商户ID',
    dataIndex: 'id',
    key: 'id'
  },
  {
    title: '商户名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '分类',
    dataIndex: 'category',
    key: 'category'
  },
  {
    title: '楼层',
    dataIndex: 'floor',
    key: 'floor'
  }
]

// 树形结构数据
const categoryTree = ref([])
// 选中的分类键
const checkedKeys = ref([])
// 半选中状态的分类键
const halfCheckedKeys = ref([])
// 展开的节点
const expandedKeys = ref([])
// 扁平化的分类Map，用于快速查找
const categoryMap = ref({})
// 所有分类的叶子节点
const leafCategories = ref([])

// 转换树数据为组件需要的格式
const treeData = computed(() => {
  return categoryTree.value
})

// 筛选条件应用状态
const appliedCategoryKeys = ref([])
const appliedFloors = ref([])

// 商户穿梭框数据源
const transferDataSource = computed(() => {
  return merchants.merchants.map((merchant) => ({
    key: merchant.id,
    title: merchant.name,
    description: `${getCategoryName(merchant.category)} - ${merchant.floor}`,
    category: merchant.category,
    floor: merchant.floor
  }))
})

// 已选中的商户ID列表
const selectedMerchantKeys = ref([])

// 显示已选分类的文本
const selectedCategoriesText = computed(() => {
  if (appliedCategoryKeys.value.length === 0) return '全部'
  return appliedCategoryKeys.value.map((code) => getCategoryName(code)).join(', ')
})

// 显示已选楼层的文本
const selectedFloorsText = computed(() => {
  if (appliedFloors.value.length === 0) return '全部'
  return appliedFloors.value.join(', ')
})

// 根据选中的分类和楼层过滤商户
const filteredMerchants = computed(() => {
  let result = merchants.merchants

  // 应用分类筛选
  if (appliedCategoryKeys.value.length > 0) {
    // 获取所有选中的叶子节点
    const selectedLeafCategories = getSelectedLeafCategories(appliedCategoryKeys.value)
    result = result.filter((merchant) => selectedLeafCategories.includes(merchant.category))
  }

  // 应用楼层筛选
  if (appliedFloors.value.length > 0) {
    result = result.filter((merchant) => appliedFloors.value.includes(merchant.floor))
  }

  return result
})

// 获取所有选中的叶子节点类别
function getSelectedLeafCategories(keys = checkedKeys.value) {
  // 如果没有选中项，返回空数组
  if (keys.length === 0) {
    return []
  }

  const result = []
  const addLeafCategories = (code) => {
    const item = categoryMap.value[code]
    if (!item) return

    // 如果没有子节点，则是叶子节点
    if (!item.children || item.children.length === 0) {
      result.push(code)
    } else {
      // 递归添加所有子节点
      item.children.forEach((child) => {
        addLeafCategories(child.code)
      })
    }
  }

  // 处理每个选中的节点
  keys.forEach((code) => {
    addLeafCategories(code)
  })

  return result
}

// 通过分类代码获取分类名称
function getCategoryName(code) {
  return categoryMap.value[code]?.name || code
}

// 选中分类节点变化处理
function onCategoryCheck(checkedKeys, e) {
  updateMerchantSelectionByCategory(checkedKeys.checked)
  updateCategorySelectionState()
}

// 检查楼层是否被选中
function isFloorChecked(floor) {
  const merchantsInFloor = merchants.merchants.filter((m) => m.floor === floor)
  const selectedMerchantsInFloor = merchantsInFloor.filter((m) => selectedMerchantKeys.value.includes(m.id))

  return merchantsInFloor.length > 0 && selectedMerchantsInFloor.length === merchantsInFloor.length
}

// 检查楼层是否处于部分选中状态
function isFloorIndeterminate(floor) {
  const merchantsInFloor = merchants.merchants.filter((m) => m.floor === floor)
  const selectedMerchantsInFloor = merchantsInFloor.filter((m) => selectedMerchantKeys.value.includes(m.id))

  return selectedMerchantsInFloor.length > 0 && selectedMerchantsInFloor.length < merchantsInFloor.length
}

// 单个楼层选择变化
function onSingleFloorChange(floor, checked) {
  const merchantsInFloor = merchants.merchants.filter((m) => m.floor === floor)
  const newSelectedMerchantIds = new Set(selectedMerchantKeys.value)

  if (checked) {
    // 如果选中，添加该楼层的所有商户
    merchantsInFloor.forEach((merchant) => {
      newSelectedMerchantIds.add(merchant.id)
    })
  } else {
    // 如果取消选中，移除该楼层的所有商户
    merchantsInFloor.forEach((merchant) => {
      newSelectedMerchantIds.delete(merchant.id)
    })
  }

  selectedMerchantKeys.value = Array.from(newSelectedMerchantIds)
  updateCategorySelectionState()
}

// 商户选择变化处理
function handleMerchantTransferChange(nextTargetKeys) {
  selectedMerchantKeys.value = nextTargetKeys
  updateCategorySelectionState()
  updateFloorSelectionState()
}

// 更新分类选择状态
function updateCategorySelectionState() {
  // 获取当前选中的商户
  const selectedMerchants = merchants.merchants.filter((m) => selectedMerchantKeys.value.includes(m.id))

  // 获取所有选中商户的分类
  const selectedCategories = selectedMerchants.map((m) => m.category)

  // 根据已选商户更新分类的选中状态
  const allLeafCategories = leafCategories.value
  const newCheckedKeys = []
  const newHalfCheckedKeys = []

  // 遍历所有顶级分类
  categoryTree.value.forEach((topCategory) => {
    checkCategorySelection(topCategory, selectedCategories, newCheckedKeys, newHalfCheckedKeys)
  })

  // 更新选中状态
  checkedKeys.value = newCheckedKeys
  halfCheckedKeys.value = newHalfCheckedKeys
}

// 检查分类选择状态（递归）
function checkCategorySelection(category, selectedCategories, newCheckedKeys, newHalfCheckedKeys) {
  const code = category.code

  // 如果是叶子节点
  if (!category.children || category.children.length === 0) {
    // 检查该分类下是否有商户被选中
    const hasMerchant = merchants.merchants.some((m) => m.category === code)
    if (hasMerchant) {
      const allMerchantsInCategory = merchants.merchants.filter((m) => m.category === code)
      const selectedMerchantsInCategory = allMerchantsInCategory.filter((m) => selectedMerchantKeys.value.includes(m.id))

      // 如果该分类下的所有商户都被选中，则选中该分类
      if (selectedMerchantsInCategory.length === allMerchantsInCategory.length && allMerchantsInCategory.length > 0) {
        newCheckedKeys.push(code)
        return true
      }
      // 如果该分类下有部分商户被选中，则设置为半选状态
      else if (selectedMerchantsInCategory.length > 0) {
        newHalfCheckedKeys.push(code)
        return true
      }
    }
    return false
  }

  // 如果是非叶子节点，检查其子节点
  let allChildrenSelected = category.children.length > 0
  let hasPartialSelection = false
  let hasChildSelected = false

  category.children.forEach((child) => {
    const childResult = checkCategorySelection(child, selectedCategories, newCheckedKeys, newHalfCheckedKeys)

    // 检查子节点是否全部被选中
    const childCode = child.code
    const isChildSelected = newCheckedKeys.includes(childCode)
    const isChildHalfSelected = newHalfCheckedKeys.includes(childCode)

    if (isChildSelected) {
      hasChildSelected = true
    } else if (isChildHalfSelected) {
      hasPartialSelection = true
    }

    // 如果子节点返回了true，表示有选中或部分选中
    if (childResult) {
      hasChildSelected = true
    }

    if (!isChildSelected) {
      allChildrenSelected = false
    }
  })

  // 如果所有子节点都被选中，则选中当前父节点
  if (allChildrenSelected) {
    newCheckedKeys.push(code)
    return true
  }
  // 如果有部分子节点被选中或有子节点处于半选状态，则当前节点为半选状态
  else if (hasChildSelected || hasPartialSelection) {
    newHalfCheckedKeys.push(code)
    return true
  }

  return false
}

// 更新楼层选择状态
function updateFloorSelectionState() {
  const newSelectedFloors = []

  // 只显示在UI上更新楼层选择框状态，不再更新selectedFloors
  // 选中状态由isFloorChecked和isFloorIndeterminate函数动态计算

  floors.value.forEach((floor) => {
    if (isFloorChecked(floor)) {
      newSelectedFloors.push(floor)
    }
  })

  selectedFloors.value = newSelectedFloors
}

// 根据分类选择更新商户选择
function updateMerchantSelectionByCategory(selectedCategories) {
  // 获取所有选中分类下的叶子节点
  const leafCategoryCodes = getSelectedLeafCategories(selectedCategories)

  // 获取这些分类下的所有商户
  const merchantsInCategories = merchants.merchants.filter((m) => leafCategoryCodes.includes(m.category))

  // 创建新的已选商户ID集合
  const newSelectedMerchantIds = new Set(selectedMerchantKeys.value)

  // 处理商户选择状态
  merchantsInCategories.forEach((merchant) => {
    // 如果该分类下的商户ID不在已选列表中，添加它
    if (!newSelectedMerchantIds.has(merchant.id)) {
      newSelectedMerchantIds.add(merchant.id)
    }
  })

  // 如果有分类被取消选中，需要移除对应的商户
  // 只考虑当前显示的商户类别，而不是所有类别
  const merchantsByCategory = {}

  // 按类别分组商户
  merchants.merchants.forEach((merchant) => {
    if (!merchantsByCategory[merchant.category]) {
      merchantsByCategory[merchant.category] = []
    }
    merchantsByCategory[merchant.category].push(merchant)
  })

  // 对于每个类别，如果该类别没有被选中，则移除该类别下的所有商户
  Object.keys(merchantsByCategory).forEach((category) => {
    // 如果这个类别不在已选中的叶子节点中
    if (!leafCategoryCodes.includes(category)) {
      // 移除该类别下的所有商户
      merchantsByCategory[category].forEach((merchant) => {
        newSelectedMerchantIds.delete(merchant.id)
      })
    }
  })

  // 更新已选商户列表
  selectedMerchantKeys.value = Array.from(newSelectedMerchantIds)
}

// 商户搜索过滤
function filterMerchantOption(inputValue, option) {
  return option.title.indexOf(inputValue) > -1 || option.description.indexOf(inputValue) > -1
}

// 应用筛选条件
function applyFilter() {
  appliedCategoryKeys.value = [...checkedKeys.value]
  appliedFloors.value = [...selectedFloors.value]

  // 根据筛选条件更新可选商户
  updateMerchantSelectionByFilter()
}

// 根据筛选条件更新商户选择
function updateMerchantSelectionByFilter() {
  // 获取符合筛选条件的商户
  let filteredMerchantList = merchants.merchants

  // 应用分类筛选
  if (appliedCategoryKeys.value.length > 0) {
    const selectedLeafCategories = getSelectedLeafCategories(appliedCategoryKeys.value)
    if (selectedLeafCategories.length > 0) {
      filteredMerchantList = filteredMerchantList.filter((merchant) => selectedLeafCategories.includes(merchant.category))
    }
  }

  // 应用楼层筛选
  if (appliedFloors.value.length > 0) {
    filteredMerchantList = filteredMerchantList.filter((merchant) => appliedFloors.value.includes(merchant.floor))
  }

  const filteredMerchantIds = filteredMerchantList.map((m) => m.id)

  // 创建新的已选商户ID集合，只保留符合筛选条件的商户
  selectedMerchantKeys.value = selectedMerchantKeys.value.filter((id) => filteredMerchantIds.includes(id))
}

// 重置筛选条件
function resetFilter() {
  checkedKeys.value = []
  halfCheckedKeys.value = []
  selectedFloors.value = []
  appliedCategoryKeys.value = []
  appliedFloors.value = []
  selectedMerchantKeys.value = []
  updateCategorySelectionState()
  updateFloorSelectionState()
}

onMounted(() => {
  // 转换扁平分类数组为树形结构
  const tempCategoryMap = {}

  // 首先创建所有分类的映射
  category.forEach((item) => {
    tempCategoryMap[item.code] = { ...item, children: [] }
  })

  // 然后构建树形结构
  const tempCategoryTree = []
  category.forEach((item) => {
    if (item.parent_id === 0) {
      // 根级分类
      tempCategoryTree.push(tempCategoryMap[item.code])
    } else {
      // 添加到父级的子节点
      tempCategoryMap[item.parent_id].children.push(tempCategoryMap[item.code])
    }

    // 收集叶子节点
    const hasChildren = category.some((c) => c.parent_id === item.code)
    if (!hasChildren) {
      leafCategories.value.push(item.code)
    }
  })

  categoryTree.value = tempCategoryTree
  categoryMap.value = tempCategoryMap

  // 默认展开所有根级分类
  expandedKeys.value = tempCategoryTree.map((item) => item.code)

  console.log('分类树结构:', categoryTree.value)
})

// 监听已选商户变化，更新分类和楼层选择状态
watch(selectedMerchantKeys, (newValue) => {
  updateCategorySelectionState()
  updateFloorSelectionState()
})
</script>

<style scoped>
.merchants-filter {
  margin-bottom: 20px;
}

.merchant-list {
  margin-top: 10px;
}

.merchant-selection {
  margin-top: 10px;
}

.filter-section {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
  background-color: #fafafa;
}

.filter-section h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  color: #333;
}

.filter-actions {
  display: flex;
  flex-direction: column;
  padding: 0 16px;
}

.filter-summary {
  margin-bottom: 16px;
  padding: 8px 16px;
  background-color: #f0f7ff;
  border-radius: 4px;
  font-size: 14px;
}

.selection-summary {
  padding: 8px 16px;
  background-color: #f0f7ff;
  border-radius: 4px;
  font-size: 14px;
}
</style>
