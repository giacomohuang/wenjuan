<template>
  <div class="container">
    <div class="header">
      <a-radio-group v-model:value="resourceType">
        <a-radio-button value="0">{{ t('sys.permission.resource.all') }}</a-radio-button>
        <a-radio-button value="1">{{ t('sys.permission.resource.pagesOnly') }}</a-radio-button>
        <a-radio-button value="2">{{ t('sys.permission.resource.pagesAndFunctions') }}</a-radio-button>
        <a-radio-button value="3">{{ t('sys.permission.resource.pagesAndData') }}</a-radio-button>
      </a-radio-group>
      <div class="search-wrapper">
        <icon name="search" class="search-icon"></icon>
        <input class="search-input" :placeholder="t('sys.permission.resource.searchPlaceholder')" v-model="keywords" />
      </div>
    </div>

    <div class="content">
      <div class="sidebar">
        <div class="sticky-wrap">
          <ul ref="rootsRef">
            <li v-for="root in roots" :key="root.id" :data-id="root.id" draggable="true" class="nav-item" :class="{ active: currentRootId === root.id }" @click="onChange(root.id)">
              {{ root.name }}
            </li>
          </ul>
          <div class="add-button">
            <div class="button-inner" @click="openEditor(null, EDITOR_MODE.ADD)">+</div>
          </div>
        </div>
      </div>
      <div class="main-content hl-area">
        <div v-if="keywords && !resourceTree.children" class="empty-state">
          {{ t('sys.permission.resource.noMatchingData') }}
          <a-button type="link" size="small" @click="keywords = ''">
            {{ t('sys.permission.resource.clearSearchKeywords') }}
          </a-button>
        </div>
        <div class="list" ref="listRef">
          <ResourceList :data="resourceTree.children" @open="openEditor" @remove="remove" @reorder="reorder" @toggleCollapse="toggleCollapse" v-if="resourceTree"> </ResourceList>
        </div>
      </div>
    </div>
  </div>
  <a-drawer :title="t('sys.permission.resource.resourceEditor')" width="500px" :open="resourceEditor" @close="resourceEditor = false">
    <LangSelector />
    <a-form ref="resourceFormRef" autocomplete="off" :model="resourceForm" :rules="vRules" :label-col="{ span: 6 }" :wrapper-col="{ span: 20 }" @finish="submit">
      <a-form-item :label="t('sys.permission.resource.name')" :wrapper-col="{ span: 12 }" name="name">
        <mpInputI18n v-model="resourceForm.name" />
      </a-form-item>
      <a-form-item :label="t('sys.permission.resource.code')" name="code" required>
        <div dir="ltr">
          <a-input v-if="editorMode === 1 ? currentResource.code : getCodePrefix(currentResource.code)" v-model:value="resourceForm.code" :addon-before="editorMode === 1 ? currentResource.code + '.' : getCodePrefix(currentResource.code) + '.'" />
          <a-input v-else v-model:value="resourceForm.code" />
        </div>
      </a-form-item>
      <a-form-item :label="t('sys.permission.resource.type')" name="type" :wrapper-col="{ span: 20 }">
        <a-radio-group v-model:value="resourceForm.type">
          <a-radio :value="1" :checked="resourceType <= 1">{{ t('sys.permission.resource.page') }}</a-radio>
          <a-radio :value="2" :checked="resourceType == 2">{{ t('sys.permission.resource.function') }}</a-radio>
          <a-radio :value="3" :checked="resourceType == 3">{{ t('sys.permission.resource.data') }}</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item :label="t('sys.permission.resource.icon')" name="icon" v-if="resourceForm.type === 1">
        <div class="flex items-center gap-2">
          <a-input v-model:value="resourceForm.icon" placeholder="icon" style="display: none" />
          <a-button @click="openIconSelect">
            <Icon v-if="resourceForm.iconType" :name="resourceForm.icon" :key="resourceForm.icon" />
            <template v-else>{{ t('sys.permission.resource.selectIcon') }}</template>
          </a-button>
        </div>
      </a-form-item>
      <a-form-item :label="t('sys.permission.resource.linkType')" name="linkType" v-if="resourceForm.type == 1 && !currentResource.hasPageChildren">
        <a-radio-group v-model:value="resourceForm.linkType">
          <a-radio :value="1" :checked="resourceForm.linkType == 1">{{ t('sys.permission.resource.router') }}</a-radio>
          <a-radio :value="2" :checked="resourceForm.linkType == 2">{{ t('sys.permission.resource.url') }}</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item :label="t('sys.permission.resource.router')" name="link" v-if="resourceForm.type == 1 && !currentResource.hasPageChildren && resourceForm.linkType == 1">
        <a-select v-model:value="resourceForm.router" show-search :filter-option="false" optionLabelProp="name" :options="routerList.data" :fieldNames="{ label: 'name', value: 'path' }" @search="handleSearch">
          <template #option="{ name, path }">
            <div class="router-option">
              <div class="name">{{ name }}</div>
              <div class="path">{{ path }}</div>
            </div>
          </template>
          <template #dropdownRender="{ menuNode: menu }">
            <v-nodes :vnodes="menu" />
            <div v-if="routerList.total > 1" style="padding: 16px 0; border-top: 1px solid var(--border-light)">
              <a-pagination v-model:current="routerList.page" :total="routerList.total" show-less-items simple @change="changePage" />
            </div>
          </template>
          <template v-if="routerList.loading" #notFoundContent>
            <a-spin size="small" />
          </template>
        </a-select>
      </a-form-item>
      <a-form-item :label="t('sys.permission.resource.link')" name="link" v-if="resourceForm.type == 1 && !currentResource.hasPageChildren && resourceForm.linkType == 2">
        <a-input v-model:value="resourceForm.link" type="url" placeholder="https://" />
      </a-form-item>
      <a-form-item :label="t('sys.permission.resource.target')" name="target" v-if="resourceForm.type == 1 && !currentResource.hasPageChildren">
        <a-radio-group v-model:value="resourceForm.target">
          <a-radio value="self">{{ t('sys.permission.resource.currentPage') }}</a-radio>
          <a-radio value="_blank">{{ t('sys.permission.resource.newPage') }}</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item :label="t('sys.permission.resource.isHidden')" name="isHidden" v-if="resourceForm.type == 1 && !currentResource.hasPageChildren">
        <a-switch v-model:checked="resourceForm.isHidden" />
      </a-form-item>
      <a-form-item :wrapper-col="{ offset: 6 }">
        <a-button type="primary" html-type="submit">{{ t('common.save') }}</a-button>
        <a-button type="link" @click="resourceEditor = false">{{ t('common.cancel') }}</a-button>
      </a-form-item>
    </a-form>
  </a-drawer>
  <a-modal :title="t('sys.permission.resource.iconSelector')" v-model:open="iconSelectVisible" :footer="null" width="800px">
    <IconSelect @iconSelect="handleIconSelect" />
  </a-modal>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, watch, nextTick, provide, defineComponent } from 'vue'
import debounceRef from '@/js/debounceRef'
import ResourceList from './ResourceList.vue'
import API from '@/api/API'
import { DnD } from '@/js/DnD.js'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import IconSelect from '@/components/IconSelect.vue'

const { t, locale } = useI18n()

const VNodes = defineComponent({
  props: {
    vnodes: {
      type: Object,
      required: true
    }
  },
  render() {
    return this.vnodes
  }
})

const routerList = reactive({
  data: [],
  loading: false,
  page: 1,
  total: 1,
  keyword: ''
})

// 常量定义
const EDITOR_MODE = { ADD: 1, EDIT: 2 }

// 响应式状态
const resourceEditor = ref(false)
const resourceFormRef = ref()
const resourceForm = reactive({
  type: 1,
  name: {},
  router: null,
  link: null,
  linkType: 1,
  target: 'self',
  isHidden: false,
  icon: null,
  iconType: null
})
const isLoading = ref(false)
const currentRootId = ref(null)
const keywords = debounceRef('', 500)
const resourceTree = ref(null)
const collapseIds = ref(new Set())
const resourceType = ref('0')
const roots = ref(null)
const rootsRef = ref(null)
const listRef = ref(null)

// DnD 实例
const dndResource = new DnD(listRef, { onReorder: (ids) => reorder(ids), allowNesting: false })
const dndRoot = new DnD(rootsRef, { onReorder: (ids) => reorder(ids), allowNesting: false })

// 非响应式状态
let editorMode
let currentResource = null
let resourceData = null

// 提供上下文
provide('resourceType', resourceType)
provide('collapseIds', collapseIds)

// 辅助函数
const buildTree = (data) => {
  const rsdata = JSON.parse(JSON.stringify(data))
  // console.log(rsdata)
  let items

  // 根据关键词过滤
  if (keywords.value) {
    const nodes = new Map()
    const itemMap = new Map(rsdata.map((item) => [item.id, item]))
    const hitItems = rsdata.filter((item) => item.name.toLowerCase().includes(keywords.value) && (resourceType.value == 0 || resourceType.value == item.type))
    // console.log(keywords.value)
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
    items = rsdata
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

const highlight = () => {
  if (!CSS.highlights) {
    warn('CSS Custom Highlight API not supported.')
    return
  }
  // 清除上个高亮
  CSS.highlights.clear()
  if (!resourceTree.value.children || !keywords.value) return
  const article = document.querySelector('.hl-area')
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

const getCodePrefix = (code) => {
  if (!code || code.indexOf('.') === -1) {
    return ''
  }
  return code.replace(/\.[^.]+$/, '')
}

const clearFormData = (data) => {
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      data[key] = null
    }
  }
}

// 主要功能函数
const onChange = async (val) => {
  currentRootId.value = val
  resourceData = await API.permission.resource.list(currentRootId.value, false)
  resourceTree.value = buildTree(resourceData)
  nextTick(() => highlight())
}

const reorder = async (ids) => {
  await API.permission.resource.reorder(ids)
  resourceData = await API.permission.resource.list(currentRootId.value, false)
  resourceTree.value = buildTree(resourceData)
  nextTick(() => highlight())
}

const toggleCollapse = (id) => {
  if (collapseIds.value.has(id)) {
    collapseIds.value.delete(id)
  } else {
    collapseIds.value.add(id)
  }
}

const remove = async (path, pid) => {
  const result = await API.permission.resource.remove(path)
  // 如果删除的是根节点数据，刷新roots列表
  if (pid == null) {
    roots.value = await API.permission.resource.list(null, true)
    roots.value.sort((a, b) => a.order - b.order)
    currentRootId.value = roots.value[0]?.id
  }
  resourceData = await API.permission.resource.list(currentRootId.value, false)
  resourceTree.value = buildTree(resourceData)
  nextTick(() => highlight())
}

const openEditor = async (item, mode) => {
  currentResource = item ? await API.permission.resource.get(item.id) : {}
  resourceEditor.value = true
  editorMode = mode
  if (item) {
    currentResource.maxOrder = item.children?.length
    currentResource.hasPageChildren = item.children?.some((child) => child.type === 1)
  } else {
    currentResource.maxOrder = roots.value.length
    currentResource.hasPageChildren = false
  }

  // 新增模式
  if (editorMode === EDITOR_MODE.ADD) {
    nextTick(() => {
      clearFormData(resourceForm)
      if (resourceType.value == 2) {
        resourceForm.type = 2
      } else if (resourceType.value == 3) {
        resourceForm.type = 3
      } else {
        resourceForm.type = 1
      }
    })
  }
  // 修改模式
  else if (editorMode === EDITOR_MODE.EDIT) {
    console.log(currentResource.name)
    resourceForm.name = currentResource.name
    resourceForm.code = currentResource.code.split('.').pop()
    resourceForm.type = currentResource.type
    resourceForm.icon = currentResource.icon
    resourceForm.iconType = currentResource.iconType

    if (item.type === 1 && currentResource.hasPageChildren) {
      resourceForm.router = null
      resourceForm.link = null
      resourceForm.linkType = null
      resourceForm.target = 'self'
      resourceForm.isHidden = false
    } else {
      resourceForm.router = currentResource.router || ''
      resourceForm.linkType = currentResource.linkType || 1
      resourceForm.link = currentResource.link || ''
      resourceForm.target = currentResource.target || 'self'
      resourceForm.isHidden = currentResource.isHidden || false
    }
  }

  // console.log(item)

  // 如果是页面类型且没有设置 router，尝试根据 name 自动匹配
  if (resourceForm.type === 1 && !resourceForm.router && resourceForm.name) {
    nextTick(() => {
      const name = resourceForm.name?.[locale.value]?.toLowerCase()
      if (name) {
        // 在所有路由中查找最匹配的路由
        const matchedRoute = routes.find((route) => {
          const routeName = (route.name || '').toLowerCase()
          const routePath = route.path.toLowerCase()
          return routeName === name || routePath.includes(name)
        })

        if (matchedRoute) {
          resourceForm.router = matchedRoute.path
        }
      }
    })
  }

  if (resourceForm.router) {
    // 根据router path初始化下拉框内容
    // console.log('refreshing router list')
    getRouterList(1, resourceForm.router)
  }
}

const submit = async () => {
  const item = { ...resourceForm }

  // // 处理链接相关字段
  // if (item.type === 1) {
  //   if (currentResource.hasPageChildren) {
  //     item.router = null
  //     item.link = null
  //     item.linkType = null
  //   } else {
  //     if (item.linkType === 1) {
  //       item.link = null
  //     } else {
  //       item.router = null
  //     }
  //   }
  // } else {
  //   item.router = null
  //   item.link = null
  //   item.linkType = null
  // }

  let res
  // 新增模式
  if (editorMode === EDITOR_MODE.ADD) {
    item.id = null
    item.pid = currentResource?.id ? currentResource.id : null
    // 这里先传父节点路径，到服务器端获得了节点id后再拼接成完整的path
    item.path = currentResource?.path ? currentResource.path : ''
    item.code = currentResource?.code ? currentResource.code + '.' + resourceForm.code : resourceForm.code
    item.order = currentResource.maxOrder + 1
    res = await API.permission.resource.add(item)
    // 如果是顶层菜单
    if (!item.pid) {
      roots.value = await API.permission.resource.list(null, true)
      roots.value.sort((a, b) => a.order - b.order)
      currentRootId.value = res.id
    }
  }
  // 修改模式
  else if (editorMode === EDITOR_MODE.EDIT) {
    item.path = currentResource.path
    item.code = currentResource.code
    item.pid = currentResource.pid
    item.id = currentResource.id
    item.order = currentResource.order
    const prefix = getCodePrefix(currentResource.code)
    item.code = prefix ? prefix + '.' + resourceForm.code : resourceForm.code
    res = await API.permission.resource.update(item)
    if (!item.pid) {
      roots.value = await API.permission.resource.list(null, true)
      roots.value.sort((a, b) => a.order - b.order)
    }
  } else {
    throw new Error('Invalid Editor Mode.')
  }

  resourceData = await API.permission.resource.list(currentRootId.value, false)
  resourceTree.value = buildTree(resourceData)
  nextTick(() => highlight())

  // 滚动到新增节点的位置
  if (editorMode === EDITOR_MODE.ADD) {
    nextTick(() => {
      const el = document.getElementById('_MPRES_' + res.id)
      // 判断节点是不是在可视范围
      const rect = el.getBoundingClientRect()
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight
      if (!isVisible) {
        el.scrollIntoView({ behavior: 'instant', block: 'center' })
      }
      el.classList.add('blink')
      el.onanimationend = () => {
        el.classList.remove('blink')
      }
    })
  }

  resourceEditor.value = false
}

// 生命周期钩子
onMounted(async () => {
  isLoading.value = true
  roots.value = await API.permission.resource.list(null, true)
  roots.value.sort((a, b) => a.order - b.order)

  currentRootId.value = roots.value[0]?.id

  resourceData = await API.permission.resource.list(currentRootId.value, false)
  resourceTree.value = buildTree(resourceData)

  dndResource.init()
  dndRoot.init()

  getRouterList()

  nextTick(() => {
    highlight()
  })
})

onBeforeUnmount(() => {
  dndResource.destroy()
  dndRoot.destroy()
})

// 监听器
watch(keywords, (val) => {
  resourceTree.value = buildTree(resourceData)
  nextTick(() => highlight())
})

watch(resourceType, (val) => {
  resourceTree.value = buildTree(resourceData)
  nextTick(() => highlight())
})

// 表单验证规则
const vRules = {
  name: [
    { required: true },
    {
      validator: async (_rule, value) => {
        if (!value[locale.value]) {
          return Promise.reject('名称不能为空')
        } else {
          return Promise.resolve()
        }
      },
      trigger: 'blur'
    }
  ],
  code: [
    { required: true, message: t('sys.permission.resource.codeRequired') },
    {
      validator: async (_rule, value) => {
        const code = getCodePrefix(currentResource.code) + value
        console.log(code)
        if (code === 'dashboard.lalala') {
          return Promise.reject(t('sys.permission.resource.codeDuplicate'))
        } else {
          return Promise.resolve()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 在 script setup 中添加
const router = useRouter()

const routes = router.getRoutes().map((route) => ({
  name: route.meta?.title ? t(route.meta.title) : route.name || route.path,
  path: route.path
}))

// console.log(routes)

// 获取路由列表函数
const getRouterList = (page = 1, keyword = '') => {
  routerList.loading = true
  routerList.page = page
  routerList.keyword = keyword

  // 获取所有路由

  // 过滤和格式化路由
  let filteredRoutes = routes.filter((route) => {
    // 排除一些特殊路由
    if (route.path.includes('*') || route.path === '/' || route.path === '/signin' || route.path === '/404') return false
    // 如果有关键词则进行过滤
    if (keyword) {
      return route.path.toLowerCase().includes(keyword.toLowerCase()) || (route.name || '').toLowerCase().includes(keyword.toLowerCase())
    }
    return true
  })

  // 分页处理
  const pageSize = 10
  const total = filteredRoutes.length
  const start = (page - 1) * pageSize
  const end = start + pageSize

  routerList.data = filteredRoutes.slice(start, end)
  routerList.total = total
  routerList.loading = false
}

// 分页改变事件处理
const changePage = (page) => {
  getRouterList(page, routerList.keyword)
}

// 搜索处理
const handleSearch = (value) => {
  getRouterList(1, value)
}

// 修改 a-select 组件，添加搜索功能

// 添加新的响应式状态
const iconSelectVisible = ref(false)

// 添加图标选择相关方法
const openIconSelect = () => {
  iconSelectVisible.value = true
}

const handleIconSelect = (icon) => {
  // console.log('handleIconSelect', icon)
  resourceForm.icon = icon.icon
  resourceForm.iconType = icon.iconType
  iconSelectVisible.value = false
  // console.log(resourceForm.icon)
}
</script>

<style scoped lang="scss">
.dragging {
  outline: 2px dashed var(--c-brand-500);
  background-color: var(--bg-brand);
  > * {
    opacity: 0;
  }
}
// 避免在拖拽时触发子级元素事件
.list:has(.dragging) {
  .item * {
    pointer-events: none;
  }
  .item > .tools {
    display: none;
  }
}

/*rtl:begin:ignore*/
::highlight(search-results) {
  background-color: #4e9a06;
  color: white;
}

:deep(.blink) {
  border: 2px dashed #4e9a06;
  animation: blink 0.15s 6;
  @keyframes blink {
    0%,
    80%,
    100% {
      opacity: 1;
    }
    40% {
      opacity: 0;
    }
  }
}
/*rtl:end:ignore*/

.router-option {
  .path {
    font-size: 0.8em;
    color: #888;
  }
}
.custom-icon {
  width: 1.5em;
  height: 1.5em;
  background-color: var(--text-primary);
  mask-size: 1.5em 1.5em;
  mask-repeat: no-repeat;
  mask-position: center;
}

// 新增转换的Tailwind类
.container {
  margin: 32px;

  .header {
    z-index: 50;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 12px;

    .search-wrapper {
      position: relative;
      display: flex;
      align-items: center;

      .search-icon {
        position: absolute;
        margin: 8px;
      }

      .search-input {
        height: 32px;
        width: 224px;
        border-radius: 6px;
        border: 1px solid var(--border-light);
        background-color: var(--bg-primary);
        padding-left: 32px;
        padding-right: 32px;
        outline: none;
        transition: border-color 0.3s;

        &:focus {
          border-color: var(--c-brand-500);
        }
      }
    }
  }

  .content {
    display: flex;
    width: 800px;
    border-radius: 6px;
    border: 1px solid var(--border-light);
    background-color: var(--bg-primary);

    .sticky-wrap {
      position: sticky;
      top: 0;
    }
    .sidebar {
      border-right: 1px solid var(--border-light);

      .nav-item {
        display: flex;
        cursor: pointer;
        justify-content: center;
        padding: 18px 20px;
        font-size: 1.2em;

        &.active {
          background-color: var(--bg-secondary);
          font-weight: 600;
        }
      }

      .add-button {
        display: flex;
        cursor: pointer;
        justify-content: center;
        padding: 12px 20px;

        .button-inner {
          width: 60px;
          border-radius: 6px;
          border: 1px solid transparent;
          padding: 4px;
          text-align: center;
          font-size: 1.2em;

          &:hover {
            border-color: var(--c-brand-500);
            color: var(--c-brand-500);
          }
        }
      }
    }

    .main-content {
      position: relative;
      flex: 1;
      overflow-y: auto;

      .empty-state {
        padding: 16px;
        color: var(--text-secondary);
      }
    }
  }
}

.custom-icon {
  width: 24px;
  height: 24px;
  mask-size: 24px 24px;
}
</style>
