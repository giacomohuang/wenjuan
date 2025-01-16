<template>
  <div class="options">
    <a-select v-model:value="resourceType" style="width: 100px">
      <a-select-option value="0">{{ t('sys.permission.resource.all') }}</a-select-option>
      <a-select-option value="1">{{ t('sys.permission.resource.pagesOnly') }}</a-select-option>
      <a-select-option value="2">{{ t('sys.permission.resource.pagesAndFunctions') }}</a-select-option>
      <a-select-option value="3">{{ t('sys.permission.resource.pagesAndData') }}</a-select-option>
    </a-select>
    <div class="search">
      <icon name="search"></icon>
      <input class="inputbox" :placeholder="t('sys.permission.resource.searchKeywords')" v-model="keywords" />
    </div>
    <a-checkbox v-model:checked="settings.isRecursive">{{ t('sys.permission.resource.autoSelectChildren') }}</a-checkbox>
  </div>

  <div class="list" style="max-height: calc(100vh - 400px)">
    <div class="root-outline">
      <div class="root-stikcy">
        <ul ref="rootsRef">
          <li v-for="root in roots" :key="root.id" :data-id="root.id" class="root-item" :class="{ cur: currentRootId === root.id }" @click="onChange(root.id)">{{ root.name }}</li>
        </ul>
      </div>
    </div>
    <div class="items-outline">
      <div v-if="keywords && !resourceTree.children" class="hint">
        {{ t('sys.permission.resource.noMatchingData') }}
        <a-button type="link" size="small" @click="keywords = ''">{{ t('sys.permission.resource.clearSearchKeywords') }}</a-button>
      </div>
      <div ref="listRef">
        <ResourceSelectorList :data="resourceTree.children" pidEnabled="true" @toggleCollapse="toggleCollapse" @toggleSelect="toggleSelect" v-if="resourceTree" />
      </div>
    </div>
  </div>
</template>

<router lang="json">
{
  "isRouter": false
}
</router>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, watch, nextTick, provide, computed, inject } from 'vue'
import debounceRef from '@/js/debounceRef'
import ResourceSelectorList from './ResourceSelectorList.vue'
import API from '@/api/API'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const { parentData } = defineProps(['parentData']),
  settings = reactive({ isRecursive: false }),
  isLoading = ref(false),
  currentRootId = ref(null),
  keywords = debounceRef('', 500),
  resourceTree = ref(null),
  collapseIds = ref(new Set()),
  resourceType = ref('0'),
  roots = ref(null),
  rootsRef = ref(null),
  listRef = ref(null)

provide('resourceType', resourceType)
provide('collapseIds', collapseIds)
const selectedIds = inject('selectedIds')

let resourceData = null

const buildTree = (data) => {
  const rsdata = JSON.parse(JSON.stringify(data))
  const parentIds = parentData ? new Set([...parentData.resources]) : new Set()
  let items

  // 根据关键词过滤
  if (keywords.value) {
    const nodes = new Map()
    const itemMap = new Map(rsdata.map((item) => [item.id, item]))
    const hitItems = rsdata.filter((item) => item.name.toLowerCase().includes(keywords.value) && (!parentData || parentIds.has(item.id)))
    console.log(keywords.value)
    hitItems.forEach((item) => {
      const id = item.id
      let pid = item.pid
      if (!nodes.has(id)) {
        nodes.set(id, item)
        while (pid) {
          const parent = itemMap.get(pid)
          if (!parent) break
          nodes.set(parent.id, parent)
          pid = parent.pid
        }
        getChildren(id)
      }
    })
    items = Array.from(nodes.values())
    // 获取当前节点下的所有子节点
    function getChildren(id) {
      rsdata.forEach((itm) => {
        if (itm.pid == id) {
          nodes.set(itm.id, itm)
          getChildren(itm.id)
        }
      })
    }
  } else {
    items = rsdata.filter((item) => !parentData || parentIds.has(item.id))
  }

  // 构建树形结构
  const tree = []
  const itemMap = new Map(items.map((item) => [item.id, item]))
  items.forEach((item) => {
    const parent = item.pid === null ? tree : itemMap.get(item.pid)
    if (!parent.children) {
      parent.children = []
    }
    let index = parent.children.findIndex((itm) => item.type < itm.type || (item.type === itm.type && item.order < itm.order))
    if (index != -1) {
      parent.children.splice(index, 0, item)
    } else {
      parent.children.push(item)
    }
  })
  return tree
}

watch(keywords, (val) => {
  resourceTree.value = buildTree(resourceData)
  nextTick(() => highlight())
})

watch(resourceType, (val) => {
  resourceTree.value = buildTree(resourceData)
  nextTick(() => highlight())
})

const highlight = () => {
  if (!CSS.highlights) {
    warn(t('sys.permission.resource.warn.cssHighlightNotSupported'))
    return
  }
  // 清除上个高亮
  CSS.highlights.clear()
  if (!resourceTree.value.children || !keywords.value) return
  const article = document.querySelector('.items-outline')
  if (!article) return

  const treeWalker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT)
  const allTextNodes = []
  let currentNode = treeWalker.nextNode()
  while (currentNode) {
    allTextNodes.push(currentNode)
    currentNode = treeWalker.nextNode()
  }
  // 查找所有文本节点是否包含搜索词
  const ranges = allTextNodes
    .map((el) => {
      return { el, text: el.textContent.toLowerCase() }
    })
    .map(({ text, el }) => {
      const indices = []
      let startPos = 0
      while (startPos < text.length) {
        const index = text.indexOf(keywords.value, startPos)
        if (index === -1) break
        indices.push(index)
        startPos = index + keywords.value.length
      }

      // 根据搜索词的位置创建选区
      return indices.map((index) => {
        const range = new Range()
        range.setStart(el, index)
        range.setEnd(el, index + keywords.value.length)
        return range
      })
    })
  // 创建高亮对象
  const searchResultsHighlight = new Highlight(...ranges.flat())
  // 注册高亮
  CSS.highlights.set('search-results', searchResultsHighlight)
}

async function onChange(val) {
  currentRootId.value = val
  resourceData = await API.permission.resource.list(currentRootId.value, false)
  resourceTree.value = buildTree(resourceData)
  nextTick(() => highlight())
}

function getCodePrefix(code) {
  if (!code || code.indexOf('.') === -1) {
    return ''
  }
  return code.replace(/\.[^.]+$/, '')
}

function toggleSelect(id) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
    getChildrenIds(id).forEach((id) => selectedIds.value.delete(id))
  } else {
    if (settings.isRecursive) {
      selectedIds.value.add(id)
      getChildrenIds(id).forEach((id) => selectedIds.value.add(id))
    } else {
      selectedIds.value.add(id)
    }
  }
}

function getChildrenIds(id) {
  const children = []
  resourceData.forEach((item) => {
    if (item.pid == id) {
      children.push(item.id)
      children.push(...getChildrenIds(item.id))
    }
  })
  return children
}

function toggleCollapse(id) {
  if (collapseIds.value.has(id)) {
    collapseIds.value.delete(id)
  } else {
    collapseIds.value.add(id)
  }
}

onMounted(async () => {
  isLoading.value = true
  const res = await API.permission.resource.list(null, true)
  const parentIds = parentData ? new Set([...parentData.resources]) : new Set()
  if (parentData) {
    roots.value = res.filter((item) => parentIds.has(item.id))
  } else {
    roots.value = res
  }
  roots.value.sort((a, b) => a.order - b.order)

  currentRootId.value = roots.value[0]?.id

  resourceData = await API.permission.resource.list(currentRootId.value, false)
  resourceTree.value = buildTree(resourceData)

  nextTick(() => {
    highlight()
  })
})

onBeforeUnmount(() => {})
</script>

<style scoped lang="scss">
.options {
  z-index: 50;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.search {
  position: relative;
  display: flex;
  align-items: center;
  .inputbox {
    border: 1px solid var(--border-light);
    background-color: var(--bg-primary);
    height: 32px;
    width: 224px;
    border-radius: 6px;
    padding-left: 32px;
    padding-right: 32px;
    outline: none;
    transition-duration: 300ms;
    &:focus {
      border-color: var(--c-brand);
      transition-timing-function: ease-in;
    }
  }
}

.list {
  border: 1px solid var(--border-light);
  display: flex;
  min-height: 500px;
  overflow-y: auto;
  border-radius: 6px;
}

.root-outline {
  border-right: 1px solid var(--border-light);
}
.root-stikcy {
  position: sticky;
  top: 0;
}

.root-item {
  cursor: pointer;
  justify-content: center;
  padding: 12px 20px;
  font-size: 16px;

  &.cur {
    background-color: var(--bg-tertiary);
    font-weight: 600;
  }
}

.items-outline {
  flex: 1;
  overflow-y: auto;

  ::highlight(search-results) {
    background: #4e9a06;
    color: white;
  }
}

.hint {
  color: var(--text-secondary);
  padding: 12px 20px;
}
</style>
