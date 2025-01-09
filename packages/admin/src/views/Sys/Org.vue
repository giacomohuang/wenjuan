<template>
  <div id="org-content" class="main" data-simplebar :data-simplebar-direction="isRTL ? 'rtl' : 'ltr'">
    <div class="canvas">
      <div id="scaler">
        <div id="nodes" ref="orgRef">
          <OrgNode :data="orgTree" :level="1" @add="add" @remove="remove" @rename="rename" @openEditor="openEditor"></OrgNode>
        </div>
      </div>
    </div>
  </div>

  <a-drawer :title="orgForm.name" width="500px" :open="orgEditor" @close="orgEditor = false">
    <a-form ref="orgFormRef" :model="orgForm" :rules="formRules" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <a-form-item :label="t('sys.org.fullname')" name="fullname">
        <div>{{ orgForm.fullname }}</div>
      </a-form-item>
      <a-form-item :label="t('sys.org.leader')" name="leaderId">
        <a-select v-model:value="orgForm.leaderId" show-search :filter-option="false" @search="getUserList" optionLabelProp="realname" :options="userList.data" :fieldNames="{ label: 'realname', value: '_id' }">
          <template #option="{ realname, avatar, accountname }">
            <div class="user-option">
              <div class="avatar-name">
                <img :src="avatar" /><span>{{ realname }}({{ accountname }})</span>
              </div>
            </div>
          </template>
          <template #dropdownRender="{ menuNode: menu }">
            <v-nodes :vnodes="menu" />
            <div v-if="userList.total > 1" style="padding: 16px 0; border-top: 1px solid var(--border-light)">
              <a-pagination v-model:current="userList.page" :total="userList.total" show-less-items simple @change="changePage" />
            </div>
          </template>
          <template v-if="userList.loading" #notFoundContent>
            <a-spin size="small" />
          </template>
        </a-select>
      </a-form-item>
      <a-form-item :label="t('sys.org.roles')" name="roles">
        <a-select v-model:value="orgForm.roles" mode="multiple">
          <a-select-option v-for="role in roleList" :value="role.id" :key="role.id">
            {{ role.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :wrapper-col="{ offset: 6, span: 18 }">
        <a-button type="primary" @click="submitForm">{{ t('common.save') }}</a-button>
        <a-button style="margin-left: 10px" @click="orgEditor = false">{{ t('common.cancel') }}</a-button>
      </a-form-item>
    </a-form>
  </a-drawer>

  <div id="zoom">
    <div class="item" @click.stop="zoom('out')"><icon name="zoom-out"></icon></div>
    <div class="item" style="width: 58px; text-align: center" @click.stop="zoom('reset')">{{ zoom_percent }}%</div>
    <div class="item" @click.stop="zoom('in')"><icon name="zoom-in"></icon></div>
    <div class="item" @click.stop="center"><icon name="fit-center"></icon></div>
  </div>
</template>

<script setup>
import { defineComponent, provide, onMounted, ref, nextTick, reactive, onUnmounted } from 'vue'

import OrgNode from './OrgNode.vue'
import Drag from '@/js/dragCanvas'
import API from '@/api/API'
import 'simplebar'
import '@/assets/simplebar.css'
import { DnD } from '@/js/DnDTree'
import { debounce } from 'lodash-es'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const isRTL = document.dir === 'rtl'

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

// 侧边栏打开状态
const orgEditor = ref(false)
const orgForm = reactive({})
const orgFormRef = ref(null)
// 画布缩放倍率
const zoom_percent = ref(100)
const roleList = ref([])

const userList = reactive({
  data: [],
  loading: false,
  page: 1,
  total: 1,
  keyword: ''
})

const formRules = {
  leaderId: [{ required: true, message: t('sys.org.selectLeader'), trigger: 'change' }],
  roles: [{ type: 'array', min: 1, message: t('sys.org.selectRoles'), trigger: 'change' }]
}

// 主数据
// const orgTree = computed(() => buildTree())
const orgTree = ref(null)
const cur_id = ref(null)

provide('cur_id', cur_id)

const orgRef = ref(null)
const orgDnD = new DnD(orgRef, (el) => reorder(el))

// let orgData = null
const orgMap = ref(new Map())
const buildTree = () => {
  // 构建树形结构
  const tree = []
  const itemMap = new Map(Array.from(orgMap.value.values()).map((item) => [item.id, { ...item, children: [] }]))

  itemMap.forEach((item) => {
    const node = itemMap.get(item.id)
    if (item.pid === null) {
      tree.push(node)
    } else {
      const parent = itemMap.get(item.pid)
      if (parent) {
        const index = parent.children.findIndex((child) => node.order < child.order)
        if (index !== -1) {
          parent.children.splice(index, 0, node)
        } else {
          parent.children.push(node)
        }
      }
    }
  })
  orgTree.value = tree
}

// 重新计算画布大小，并居中内容，并调整滚动条位置
const center = () => {
  let canvas = document.querySelector('.canvas')
  let scrollbar = document.querySelector('#org-content .simplebar-content-wrapper')
  let isRTL = document.dir === 'rtl'

  resizeCanvas()

  // 对于 RTL 布局，需要反转水平滚动条位置的计算方式
  if (isRTL) {
    scrollbar.scrollLeft = -((canvas.offsetWidth - scrollbar.clientWidth) / 2)
  } else {
    scrollbar.scrollLeft = (canvas.offsetWidth - scrollbar.clientWidth) / 2
  }

  scrollbar.scrollTop = (canvas.offsetHeight - scrollbar.clientHeight) / 2
}

// 重新计算画布大小
const resizeCanvas = () => {
  console.log('resizeCanvas')
  let canvas = document.querySelector('.canvas')
  let nodes = document.getElementById('nodes')
  canvas.style.width = Math.max(nodes.offsetWidth, document.body.clientWidth) * 1.5 + 'px'
  canvas.style.height = Math.max(nodes.offsetHeight, document.body.clientHeight) * 1.5 + 'px'
}

// 缩放画布
const zoom = (mode) => {
  switch (mode) {
    case 'out':
      if (zoom_percent.value >= 50) {
        zoom_percent.value -= 25
      }
      break
    case 'in':
      if (zoom_percent.value < 300) {
        zoom_percent.value += 25
      }
      break
    case 'reset':
      zoom_percent.value = 100
  }
  document.getElementById('scaler').style.transform = `scale(${zoom_percent.value / 100})`
}

// 清除needUpdate标记
const clearUpdateFlag = () => {
  // orgData.forEach((item) => {
  //   delete item.needUpdate
  // })
  orgMap.value.forEach((item) => {
    delete item.needUpdate
  })
  // console.log('clear update flag', orgData)
}

// 添加节点
const add = async (item, direction) => {
  // const orgMap = new Map(orgData.map((item) => [item.id, item]))

  const newData = {
    id: null,
    pid: null,
    name: t('sys.org.department'),
    type: 0,
    isEntity: false,
    leaderId: null,
    leaderName: '',
    order: 1,
    status: 1,
    // level: null,
    path: item.path,
    children: []
  }

  switch (direction) {
    case 'child':
      newData.pid = item.id
      // newData.level = item.level + 1
      newData.order = item.children?.length === 0 ? 1 : item.children[item.children.length - 1].order + 1
      newData.fullname = `${item.fullname}-${t('sys.org.department')}`
      break
    case 'previous':
    case 'next':
      const siblings = Array.from(orgMap.value.values())
        .filter((node) => node.pid == item.pid)
        .sort((a, b) => a.order - b.order)
      // 在兄弟节点中找到插入位置的索��
      const insertIndex = siblings.findIndex((node) => node.id === item.id) + (direction === 'next' ? 1 : 0)
      const parent = orgMap.value.get(item.pid)
      newData.pid = item.pid
      // newData.level = item.level
      newData.path = parent.path
      newData.fullname = `${parent.fullname}-${t('sys.org.department')}`
      // 先确定新节点的order：插入位置的前一个节点的order + 1
      if (direction === 'previous') {
        newData.order = insertIndex === 0 ? 1 : siblings[insertIndex - 1].order + 1
      } else if (direction === 'next') {
        newData.order = item.order + 1
      }
      // 更新兄弟节点的order，从插入节点后开始更新
      siblings.slice(insertIndex).forEach((node, index) => {
        if (node.order <= newData.order + index) {
          node.order = newData.order + index + 1
          node.needUpdate = true
        }
      })
      // 从orgData中提取需要更新的数据
      const updateItems = siblings.filter((item) => item.needUpdate).map(({ id, path, fullname, order, pid }) => ({ id, path, fullname, order, pid }))
      if (updateItems.length > 0) {
        await API.org.reorder(updateItems)
        clearUpdateFlag()
      }
      break
  }
  const resData = await API.org.add(newData)
  orgMap.value.set(resData.id, resData)
  buildTree()
}

// 拖拽后的重新排序
const reorder = async (el) => {
  // const orgMap = new Map(orgData.map((item) => [item.id, item]))

  const pid = el.parentElement.closest('li').dataset.id
  const src = orgMap.value.get(+el.dataset.id)
  const parent = orgMap.value.get(+pid)
  const needUpdateChildren = +pid !== src.pid // 如果拖动的父节点发生变化，则需要更新所有子节点

  // 更新其他相关数据
  src.pid = +pid
  src.path = parent.path + '-' + src.id
  src.fullname = `${parent.fullname}-${src.name}`
  src.needUpdate = true

  // 更新子节点数据
  if (needUpdateChildren) {
    const updateChildren = (node) => {
      const children = Array.from(orgMap.value.values()).filter((item) => item.pid === node.id)
      children.forEach((child) => {
        child.path = src.path + '-' + child.id
        child.fullname = `${src.fullname}-${child.name}`
        child.needUpdate = true
        updateChildren(child)
      })
    }

    updateChildren(src)
  }

  const siblingsElements = Array.from(el.parentElement?.children)

  // 获取新的兄弟节点列表
  const siblings = Array.from(orgMap.value.values()).filter((node) => node.pid === +pid)
  siblings.forEach((item) => {
    const newOrder = siblingsElements.findIndex((child) => child.dataset.id == item.id) + 1
    if (item.order !== newOrder) {
      item.order = newOrder
      item.needUpdate = true
    }
  })

  buildTree()

  // 从orgData中提取需要更新的数据
  const updateItems = Array.from(orgMap.value.values())
    .filter((item) => item.needUpdate)
    .map(({ id, path, fullname, order, pid }) => ({ id, path, fullname, order, pid }))
  if (updateItems.length > 0) {
    await API.org.reorder(updateItems)
    clearUpdateFlag()
  }
}

// 删除节点
const remove = async (path) => {
  const res = await API.org.remove(path)
  // 从 orgMap 中移除指定 path 及其子级
  orgMap.value.forEach((value, key) => {
    if (value.path === path || value.path.startsWith(path + '-')) {
      orgMap.value.delete(key)
    }
  })
  buildTree()
}

// 修改组织名称
const rename = async (item) => {
  const parent = orgMap.value.get(item.pid)
  item.fullname = parent ? `${parent.fullname}-${item.name}` : item.name
  const res = await API.org.rename(item.id, item.name, item.fullname, item.path)
  orgMap.value.set(item.id, { ...orgMap.value.get(item.id), ...item })
  // 更新子元素的fullname
  const updateChildrenFullname = (parentId) => {
    orgMap.value.forEach((node) => {
      if (node.pid === parentId) {
        const parent = orgMap.value.get(parentId)
        node.fullname = `${parent.fullname}-${node.name}`
        updateChildrenFullname(node.id)
      }
    })
  }
  updateChildrenFullname(item.id)
  buildTree()
}

// 打开编辑器
const openEditor = async (item) => {
  orgForm.id = item.id
  orgForm.name = item.name
  orgForm.fullname = item.fullname
  orgForm.roles = [...(item.roles ?? [])]
  orgForm.leaderId = item.leaderId
  orgForm.leaderName = item.leaderName

  userList.data = []
  // 初始化下拉框
  if (orgForm.leaderId) {
    const user = await API.account.get(orgForm.leaderId)
    if (user) {
      userList.data.push(user)
    }
  }
  // // 获取负责人选项
  // const leadersRes = await API.org.getLeaders()
  // leaderOptions.value = leadersRes.map((leader) => ({
  //   id: leader.id,
  //   name: leader.name
  // }))

  // // 获取角色选项
  // const rolesRes = await API.org.getRoles()
  // roleOptions.value = rolesRes.map((role) => ({
  //   id: role.id,
  //   name: role.name
  // }))

  orgEditor.value = true
}

// const orgListFilter = (input, option) => {
//   console.log(option)
//   return option.name.toLowerCase().includes(input.toLowerCase())
// }

// 获取账户列表，用于编辑组织负责人
const getUserList = debounce(async (value) => {
  userList.loading = true
  const res = await API.account.searchByName(value, userList.page, 10)

  userList.data = res.accounts
  userList.total = res.total
  userList.page = 1

  userList.loading = false
  userList.keyword = value
}, 300)

// 切换用户列表分页
const changePage = async (page, pageSize) => {
  const res = await API.account.searchByName(userList.keyword, page, pageSize)
  userList.data = res.accounts
  userList.total = res.total
}
// 提交表单
const submitForm = async () => {
  try {
    await orgFormRef.value.validateFields()
  } catch {
    console.log('表单验证失败')
    return
  }

  const userMap = new Map(userList.data.map((item) => [item._id, item]))

  orgForm.leaderName = userMap.get(orgForm.leaderId).realname

  // 表单验证通过，执行提交逻辑
  const res = await API.org.update(orgForm)

  if (res) {
    // // 更新成功，关闭抽屉并刷新数据
    orgEditor.value = false
    // // 更新orgMap中的数据

    orgMap.value.set(orgForm.id, { ...orgMap.value.get(orgForm.id), ...orgForm })

    buildTree()
  }
}

let dragInstance = null

// 页面尺寸变化时重新计算画布大小
const resizeHandler = () => {
  // 重新计算画布大小
  resizeCanvas()
}

onMounted(async () => {
  const orgRes = await API.org.list()
  orgMap.value = new Map(orgRes.map((item) => [item.id, item]))
  roleList.value = await API.permission.role.list(null)
  buildTree()
  orgDnD.init()
  dragInstance = new Drag(document.querySelector('#org-content .simplebar-content-wrapper'))
  window.addEventListener('resize', resizeHandler)

  nextTick(() => {
    center()
  })
})

onUnmounted(() => {
  if (orgDnD) {
    orgDnD.destroy()
  }
  if (dragInstance) {
    dragInstance.destroy()
  }
  window.removeEventListener('resize', resizeHandler)
})
</script>

<style scoped lang="scss">
.main {
  position: relative;
  display: block;
  overflow: auto;
  cursor: grab;
  height: calc(100vh - 65px);
  background-image: radial-gradient(circle, var(--border-tertiary) 0.5px, transparent 0.5px);
  background-size: 15px 15px;
  background-position: 20px 20px;
}

.canvas {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: center;
}

#scaler {
  transform: scale(1);
  transform-origin: center top;
  flex-shrink: 0;
  flex-grow: 0;
  height: fit-content;
  width: fit-content;
  user-select: none;
  display: block;
  margin: 0;
  padding: 0;
  // background: red;x
}

#nodes {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

#zoom {
  [dir='rtl'] & {
    left: auto;
    right: 50px;
  }
  position: absolute;
  display: flex;
  flex-direction: row;
  left: 50px;
  bottom: 50px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-medium);
  z-index: 100;
  padding: 8px;
  border-radius: 12px;
  box-shadow: 2px 2px 4px 0 var(--border-medium);
  .item {
    user-select: none;
    border-radius: 8px;
    padding: 8px;
    line-height: 20px;
    cursor: pointer;
    &:hover {
      background: #eee;
    }
  }
}

.user-option {
  display: flex;
  .avatar-name {
    img {
      width: 30px;
      height: 30px;
      object-fit: cover;
      border-radius: 50%;
    }
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 5px;
  }
}
</style>
