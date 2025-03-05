<template>
  <div class="loading-wrapper" v-show="isLoading">
    <div class="loading-content">
      <a-spin />
    </div>
  </div>

  <div class="header" v-show="!isLoading">
    <div class="left">
      <icon name="arrow-right" class="ico-back" size="2em" @click="router.push('/wenjuan/project')" />
      <div class="q-name-wrapper">
        <div class="q-name" @click.stop="editQName">
          <!-- <a-tag color="red">已结束</a-tag> -->
          <span class="text">
            {{ Q.name }}
            <!-- <mp-tag size="small" color="blue">{{ teamId }}</mp-tag> -->
          </span>
          <icon class="icon-edit" name="edit" />
        </div>
        <div class="q-status">
          <mp-tag size="small" color="gray">自动保存: {{ savedTime }}</mp-tag>
          <mp-tag size="small" color="blue" v-if="isDraft">草稿</mp-tag>
          <div class="loading" :class="isSaving ? 'show' : 'hide'" />
        </div>
      </div>
    </div>
    <div class="mid">
      <a-space>
        <template #split>
          <a-divider type="vertical" style="border-color: var(--border-dark)" />
        </template>
        <a-button type="text" size="large" :disabled="isSaving" @click="settingsModal = true"><icon name="settings" />设置</a-button>
        <a-button type="text" size="large" :disabled="isSaving || !Q.data.length" @click="logicDrawer = true"><icon name="logic" />逻辑</a-button>
        <a-button type="text" size="large" :disabled="isSaving || !Q.data.length" @click="preview"><icon name="preview" />预览</a-button>
      </a-space>
    </div>
    <div class="actions">
      <a-button @click="openCooperatorModal" v-if="teamId">协作</a-button>
      <a-button @click="deleteDraft" :disabled="isSaving" v-if="isDraft">删除草稿</a-button>
      <a-button @click="publish" v-if="!isLoading" :disabled="isSaving || (isPublish && !isDraft) || !Q.data.length">发布</a-button>

      <a-select :dropdown-match-select-width="false" v-if="versionList.list.length > 0" v-model:value="versionList.selectedVersion" placement="bottomRight" :fieldNames="{ label: 'name', value: 'version' }" :disabled="isSaving" :options="versionList.list" @change="getVersion(versionList.selectedVersion)">
        <template #option="{ version, name }">
          <div class="version-name" :class="version == currentVersion ? 'current' : ''">
            {{ name }}
          </div>
        </template>
        <template #dropdownRender="{ menuNode: menu }">
          <v-nodes :vnodes="menu" />
          <a-pagination style="margin: 10px 0" hideOnSinglePage v-model:current="versionList.page" :total="versionList.total" :page-size="versionList.limit" @change="getVersionList" size="small" />
        </template>
        <template #tagRender="{ value }"> 版本: {{ value }} </template>
      </a-select>
    </div>
  </div>

  <div class="main" v-show="!isLoading">
    <aside class="q-types" width="200">
      <VueDraggable v-model="QTYPES" tag="ul" animation="100" :group="{ name: 'group', pull: 'clone', put: false }" :clone="onClone" :sort="false">
        <li v-for="item in QTYPES" :key="item.id" @click="addItem(item)">{{ item.title }}</li>
      </VueDraggable>
    </aside>
    <main class="q-items" data-simplebar>
      <div class="tips" v-if="!Q.data || Q.data.length == 0">请点击题型按钮或将题型拖动到这里</div>
      <VueDraggable v-model="Q.data" tag="ul" handle=".handle" animation="100" group="group" ghostClass="dragging" @end.stop="onDropped">
        <li v-for="(item, index) in Q.data" class="q-item" :id="item.id" :key="item.id" :class="index == seleItemIndex ? 'selected' : ''" @mouseup="changeEditingItem(index)">
          <div class="title">
            <div class="number">
              <icon name="handle" class="handle"></icon>
              <span class="required" :class="{ visible: item.required }">*</span>
              {{ index + 1 }}.&nbsp;&nbsp;
            </div>
            <XEditer class="text" v-model="Q.data[index].title"></XEditer>
            <!-- <div class="text">sdfhsdfhskdfgdfghjdgfjhsdfgjksh ghjsdfg jhsdfgjhsd gfjhsg dfjhsgdfjdfhsjsdf</div> -->
            <div class="opr">
              <a-tooltip title="复制" placement="top"><icon name="copy" class="items" @click="duplicateItem(index)" /></a-tooltip>
              <a-tooltip title="删除" placement="top"><icon name="remove" class="items" @click="removeItem(index)" /></a-tooltip>
            </div>
          </div>
          <div class="content"><component :is="QtypeComponents[item.type]" :itemIndex="index" :itemId="item.id" :key="item.id"></component></div>
          <div class="logic-tag" @click="logicDrawer = true" :class="hasLogic(item) ? 'enabled' : ''"><icon name="logic" /></div>
        </li>
      </VueDraggable>
    </main>
    <aside class="settings" width="300" id="__WENJUAN_SETTINGS">
      <div id="__WENJUAN_SETTINGS_CONTENT"></div>
    </aside>
  </div>
  <a-modal v-model:open="editNameModal" title="编辑问卷名称">
    <template #footer>
      <a-button @click.stop="editNameModal = false">取消</a-button>
      <a-button type="primary" @click.stop="updateQName">确定</a-button>
    </template>
    <a-input v-model:value="qNameInput" size="large" placeholder="请输入问卷名称" style="margin: 40px 0" />
  </a-modal>
  <Teleport to="body">
    <div class="drawer" v-if="logicDrawer" @animationend="showLogicContent = true">
      <div class="close" @click="closeLogicDrawer">
        <icon name="remove" />
      </div>
      <Logic v-if="showLogicContent" />
    </div>
  </Teleport>
  <a-modal v-model:open="previewModal" :footer="null" width="500px" wrapClassName="preview-modal">
    <template #closeIcon>
      <div class="preview-close">
        <icon name="remove" />
      </div>
    </template>
    <Preview v-if="previewModal" />
  </a-modal>

  <a-modal v-model:open="settingsModal" :footer="null" style="width: 800px" title="设置">
    <Settings v-if="settingsModal" />
  </a-modal>
  <a-modal v-model:open="cooperatorModal" :footer="null" style="width: 1000px" title="将团队成员添加为本问卷的协作者">
    <div class="cooperator-list">
      <a-card title="团队成员" class="list">
        <!-- <TeamMemberSelector v-model:value="teamMemberId" /> -->
        <a-table :dataSource="teamMemberListFiltered" :columns="teamMemberColumns" :pagination="false" :showHeader="false" size="small">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'name'">
              <div class="item" @click.stop="addCooperator(record.memberAcc)">
                <img :src="record.memberAcc.avatar" style="width: 32px; height: 32px; border-radius: 50%" />
                <span>{{ record.memberAcc.realname }} ({{ record.memberAcc.accountname }})</span>
              </div>
            </template>
          </template>
        </a-table>
      </a-card>
      <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; margin: 20px 0">
        <icon name="arrow-right" />
      </div>
      <a-card title="协作者" class="list">
        <a-table :dataSource="cooperatorList" :columns="cooperatorColumns" :pagination="false" :showHeader="false" size="small">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'avatar'">
              <div class="item">
                <img :src="record.account.avatar" style="width: 32px; height: 32px; border-radius: 50%" />
                {{ record.account.realname }} ({{ record.account.accountname }})
              </div>
            </template>
            <template v-if="column.key === 'role'">
              <a-select v-model:value="record.role">
                <a-select-option value="editor">可编辑</a-select-option>
                <a-select-option value="viewer" :disabled="cooperatorEditorCount <= 1">仅查看</a-select-option>
              </a-select>
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" danger @click="removeCooperator(record.account._id)" :disabled="record.role == 'editor' && cooperatorEditorCount <= 1">移除</a-button>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>
  </a-modal>
</template>

<router lang="json">
{
  "param": "/:id?"
}
</router>

<script setup>
import { provide, ref, reactive, nextTick, onBeforeMount, onBeforeUnmount, defineComponent, watch, onMounted, computed } from 'vue'
import XEditer from '@/components/XEditer.vue'
import { VueDraggable } from 'vue-draggable-plus'
import 'simplebar'
import '@/assets/simplebar.css'
import API from '@/api/API'
import { customAlphabet } from 'nanoid'
import Logic from './Logic.vue'
import Settings from './Settings.vue'
import { router } from '@/router/router'
import Preview from './Preview.vue'
import { debounce } from 'lodash-es'
import { cleanupConditions } from './cleanup'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'

// 导入问卷组件
import MultiChoice from './components/MultiChoice.vue'
import SingleChoice from './components/SingleChoice.vue'
import FillBlank from './components/FillBlank.vue'
import ImageChoice from './components/ImageChoice.vue'
import Rate from './components/Rate.vue'
import NPS from './components/NPS.vue'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 12)

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

const QTYPES = reactive([
  { id: '0', title: '填空题', type: 'FillBlank' },
  { id: '1', title: '多选题', type: 'MultiChoice' },
  { id: '2', title: '单选题', type: 'SingleChoice' },
  { id: '4', title: '图片选择', type: 'ImageChoice' },
  { id: '5', title: '评分题', type: 'Rate' },
  { id: '6', title: 'NPS', type: 'NPS' }
])

function onClone(data) {
  console.log('onClone', data)
  const d = JSON.parse(JSON.stringify(data))
  const id = nanoid()
  d.id = id
  return d
}
const QtypeComponents = {
  MultiChoice,
  SingleChoice,
  FillBlank,
  ImageChoice,
  Rate,
  NPS
}
const Q = reactive({ data: [] })
const seleItemIndex = ref(0)
// const qItems = reactive([])
const qId = ref(null)
const seleItemId = ref(null)
// 是否是发布状态
const isPublish = ref(false)
const isSaving = ref(false)
const isLoading = ref(true)
// 是否是修改状态
const isDraft = ref(false)
const qSettings = ref(null)
const logicDrawer = ref(false)
const showLogicContent = ref(false)

const editNameModal = ref(false)
const savedTime = ref('')
const qNameInput = ref('')
const previewModal = ref(false)
const settingsModal = ref(false)
const currentVersion = ref(null)
const teamId = ref(null)
const cooperatorModal = ref(false)
const cooperatorList = ref([])
const teamMemberList = ref([])

const versionList = reactive({
  list: [],
  total: 0,
  pages: 0,
  page: 1,
  limit: 10,
  selectedVersion: null
})

provide('Q', Q)
provide('seleItemIndex', seleItemIndex)
provide('seleItemId', seleItemId)
provide('settingsModal', settingsModal)

async function updateQName() {
  Q.name = qNameInput.value
  editNameModal.value = false
}

function editQName() {
  qNameInput.value = Q.name
  editNameModal.value = true
}

// 数据初始化

function addItem(payload) {
  const data = JSON.parse(JSON.stringify(payload))
  data.id = nanoid()
  Q.data.push(data)
  seleItemIndex.value = Q.data.length - 1
  seleItemId.value = data.id
  nextTick(() => {
    const el = document.getElementById(data.id)
    el.scrollIntoView({ block: 'nearest' })
  })
  cleanupConditions(Q.data)
}

function removeItem(index) {
  Q.data.splice(index, 1)
  // if (Q.data.length == 1) {
  //   seleItemIndex.value = 0
  //   seleItemId.value = Q.data[0].id
  // } else {
  //   seleItemIndex.value = Math.max(0, index - 1)
  //   seleItemId.value = Q.data[seleItemIndex.value].id
  // }
  if (index < seleItemIndex.value) {
    seleItemIndex.value = Math.max(0, seleItemIndex.value - 1)
  } else {
    seleItemIndex.value = Math.min(Q.data.length - 1, index)
  }
  if (Q.data.length !== 0) {
    seleItemId.value = Q.data[seleItemIndex.value].id
  } else {
    seleItemId.value = null
  }

  cleanupConditions(Q.data)
}

function duplicateItem(index) {
  const item = JSON.parse(JSON.stringify(Q.data[index]))
  item.id = nanoid()
  Q.data.splice(index, 0, item)
  seleItemIndex.value = index + 1
  seleItemId.value = item.id
  nextTick(() => {
    const el = document.getElementById(Q.data[index + 1].id)
    el.scrollIntoView({ block: 'nearest' })
  })
  cleanupConditions(Q.data)
}

function onDropped(e) {
  e.stopPropagation()
  seleItemIndex.value = e.newIndex
  seleItemId.value = Q.data[e.newIndex].id
  cleanupConditions(Q.data)
}

function changeEditingItem(index) {
  seleItemIndex.value = index
  seleItemId.value = Q.data[index].id
  // console.log('changeEditingItem', seleItemId.value)
}

function preview() {
  previewModal.value = true
}

// 判断本题是否有关联逻辑
function hasLogic(item) {
  if (!Q.data) return false
  if (item.logic?.conditions?.length > 0) {
    return true
  } else {
    return Q.data.some((itm) => itm.logic?.conditions?.some((cond) => cond.toLogicId === item.id))
  }
}

async function save(params) {
  // 保存前先清理失效的逻辑选项
  isSaving.value = true
  try {
    const res = await API.wenjuan.update({ _id: qId.value, ...params })
    console.log('save', res)
    savedTime.value = dayjs().format('MM-DD HH:mm:ss')
    return res
  } catch (e) {
    message.error('保存失败')
  } finally {
    isSaving.value = false
  }
}

async function getVersionList() {
  const vList = await API.wenjuan.getVersionList(qId.value, versionList.page, versionList.limit)
  versionList.list = vList.list
  versionList.total = vList.total
  versionList.pages = vList.pages
  versionList.page = vList.page
  versionList.list = versionList.list.map((item) => {
    item.name = '版本' + item.version
    return item
  })
  console.log('getVersionList', versionList)
}

async function addCooperator(account) {
  const res = await API.wenjuan.addCooperator(qId.value, account._id, 'editor')
  cooperatorList.value.push({ _id: account._id, role: 'editor', name: '可编辑', account: account })
}

async function publish() {
  const res = await save({ isPublish: true, data: Q.data, name: Q.name, settings: Q.settings, draft: null })
  await getVersionList()
  currentVersion.value = res.version
  versionList.selectedVersion = res.version
  isPublish.value = true
  isDraft.value = false
}

function deleteDraft() {
  save({ draft: null })
  isDraft.value = false
  router.replace(`/wenjuan/editor/${qId.value}?refresh=${Date.now()}`)
}

async function getVersion(version) {
  Modal.confirm({
    title: '确定要载入版本' + version + '吗？',
    onOk: async () => {
      const res = await API.wenjuan.getVersion(qId.value, version)
      currentVersion.value = version
      Q.name = res.name
      Q.data = res.data
      Q.settings = res.settings
    },
    onCancel: () => {
      versionList.selectedVersion = '版本' + currentVersion.value
    }
  })
}

async function openCooperatorModal() {
  cooperatorModal.value = true
  const res = await API.wenjuan.cooperatorList(qId.value)
  const list = res.cooperator.map((item) => {
    item.name = item.role === 'editor' ? '可编辑' : '仅查看'
    return item
  })
  console.log('list', list, teamId.value)
  cooperatorList.value = list
  if (!teamId.value) return
  const member = await API.team.memberList({ teamId: teamId.value })
  teamMemberList.value = member.members
  console.log('teamMemberList', teamMemberList.value)
}

const teamMemberListFiltered = computed(() => {
  if (!teamMemberList.value) return []
  return teamMemberList.value.filter((item) => !cooperatorList.value.some((cooperator) => cooperator.account._id === item.memberAcc._id))
})

const cooperatorEditorCount = computed(() => {
  return cooperatorList.value.filter((item) => item.role === 'editor').length
})

async function updateCooperatorRole(accountId, role) {
  const res = await API.wenjuan.updateCooperatorRole(qId.value, accountId, role)
  console.log('updateCooperatorRole', res)
}

async function removeCooperator(accountId) {
  try {
    const res = await API.wenjuan.removeCooperator(qId.value, accountId)
    cooperatorList.value = cooperatorList.value.filter((item) => item.account._id !== accountId)
  } catch (e) {
    message.error(e.data.message)
  }
}

// 自动保存草稿
const saveDraft = debounce(async (data) => {
  // delete data.version
  console.log('saveDraft', qId.value)
  if (!qId.value) return
  save({ draft: { name: data.name, data: data.data, settings: data.settings } })
}, 500)

onBeforeMount(async () => {
  try {
    isLoading.value = true
    const id = router.currentRoute.value.params.id
    let t = {}
    let res = {}
    if (!id) {
      teamId.value = localStorage.getItem('teamId')
      t = { _id: null, isPublish: false, name: '未命名问卷', settings: {}, draft: null, data: [], team: teamId.value }
      res = await API.wenjuan.update(t) // console.res
      router.replace(`/wenjuan/editor/${res._id}`)
    } else {
      res = await API.wenjuan.get(id)
      teamId.value = res.team
    }
    qId.value = res._id
    if (res.draft) {
      Q.name = res.draft.name
      Q.data = res.draft.data
      Q.team = res.team
      Q.settings = res.draft.settings
      isDraft.value = true
    } else {
      Q.name = res.name
      Q.data = res.data
      Q.team = res.team
      Q.settings = res.settings
      isDraft.value = false
    }
    Q.version = res.version
    currentVersion.value = res.version
    versionList.selectedVersion = res.version

    Q.data = [...Q.data]
    isPublish.value = res.isPublish
    qSettings.value = Q.settings
    savedTime.value = dayjs(res.updatedAt).format('MM-DD HH:mm:ss')
    if (Q.data.length > 0) {
      seleItemId.value = Q.data[0].id
    }

    await getVersionList()
  } catch (e) {
    router.replace('/404?type=wenjuan')
  } finally {
    isLoading.value = false
  }
  // zzz = Q.data

  watch(
    Q,
    (newValue) => {
      // console.log('oldValue', JSON.stringify(zzz))
      // console.log('newValue', JSON.stringify(newValue))
      // console.log('zzz', JSON.stringify(zzz) === JSON.stringify(newValue))
      // zzz = newValue
      console.log('NEW !!!! Q changeed')
      if (!isDraft.value && isPublish.value) {
        message.info({ content: '切换为草稿模式，修改不会影响正在收集的数据。点击"重新发布"应用修改。', key: 'Q_CHANGED' })
      }
      saveDraft(newValue)
      isDraft.value = true
    },
    { deep: true, immediate: false }
  )
})

onMounted(() => {})

onBeforeUnmount(() => {
  // dndQItems.destroy()
})

function closeLogicDrawer() {
  showLogicContent.value = false
  logicDrawer.value = false
}

const cooperatorColumns = [
  {
    title: '头像',
    key: 'avatar'
  },
  {
    title: '角色',
    dataIndex: 'role',
    key: 'role'
  },
  {
    title: '操作',
    key: 'action',
    width: 80
  }
]

const teamMemberColumns = [
  {
    title: '团队成员',
    key: 'name'
  }
]
</script>

<style scoped lang="scss">
.loading-wrapper {
  padding: 20px;
  // display: flex;
  // justify-content: center;
  // align-items: center;
}
.header {
  display: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  height: 60px;
  background: var(--bg-primary);
  max-width: 100%;
  border-bottom: 1px solid var(--border-medium);
  .left {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .ico-back {
    cursor: pointer;
    color: var(--text-secondary);
    transform: rotate(180deg);
    transition:
      color 0.15s ease,
      background 0.15s ease;
    border-radius: 5px;
    padding: 4px;

    &:hover {
      background: var(--bg-tertiary);
      color: var(--c-text-primary);
    }
  }

  .q-name-wrapper {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .q-name {
    display: flex;
    align-items: center;
    gap: 5px;

    &:hover {
      .icon-edit {
        opacity: 1;
      }
    }

    .text {
      cursor: pointer;
      font-size: 1.2em;
      font-weight: 500;
      max-width: 400px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .icon-edit {
      cursor: pointer;
      opacity: 0;
      color: var(--text-secondary);
      transition: opacity 0.15s ease;
    }
  }

  .q-status {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 5px;
  }

  .actions {
    margin-right: 6px;
    display: flex;
    align-items: center;
    gap: 5px;
  }
}
.version-name {
  display: flex;
  align-items: center;
  // justify-content: flex-;
  // justify-content: flex-end;
  &::before {
    display: inline-block;
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--c-gray-200);
    margin-right: 8px;
  }
  &.current {
    &::before {
      background: var(--c-green);
    }
  }
}

.main {
  position: relative;
  display: grid;
  grid-template-areas: 'q-types q-items settings';
  grid-template-columns: 200px 1fr 300px;
  background: var(--bg-primary);
  //撑满高度
  height: calc(100vh - 124px);
  overflow: hidden;
}

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

.q-types {
  grid-area: q-types;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-light);

  ul {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    // padding-inline-start: 0;
    padding: 15px;
    cursor: pointer;
  }

  li {
    width: 80px;
    list-style: none;
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: 5px;
    text-align: center;
    padding: 8px 2px;
    margin: 5px 0px;

    &:hover {
      border-color: #1890ff;
    }
  }
}

.tips {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  padding: 12px;
  margin: 20px;
  border: 1px dashed var(--border-dark);
  background: var(--bg-primary);
  border-radius: 4px;

  &:hover {
    border-color: var(--c-brand-500);
  }
}

.q-items {
  position: relative;
  // min-width: 400px;
  grid-area: q-items;
  overflow: auto;
  max-height: calc(100vh - 124px);
  min-width: 600px;
  background: var(--bg-main-content);

  .selected {
    outline: 2px solid var(--c-brand-500);
  }

  .dragging {
    content-visibility: hidden;
    content: '';
    outline: 2px dashed var(--c-brand-500);
    // border: 0;
    box-shadow: none;
    background-color: var(--bg-brand);
    cursor: grabbing;
    // > * {
    //   opacity: 0;
    // }
  }

  ul {
    position: relative;
    z-index: 2;
    min-height: 80px;
    // display: flex;
    // flex-direction: column;
  }

  li {
    position: relative;
    margin: 20px;
    // display: flex;
    padding: 20px 0;
    border-radius: 5px;
    border: 1px solid var(--border-light);
    background: var(--bg-primary);
    box-shadow: 1px 3px 5px 2px var(--border-light);
    box-sizing: border-box;

    &:hover {
      .opr {
        opacity: 1;
      }
      .handle {
        opacity: 1;
      }
    }

    .handle {
      position: absolute;
      top: 7px;
      left: 0px;
      opacity: 0;
      transition: opacity 0.15s ease;
      cursor: grab;
      color: var(--text-secondary);

      &:hover {
        color: var(--c-text-primary);
        cursor: grab;
      }

      &:active {
        cursor: grabbing;
      }
    }

    .title {
      display: flex;
      flex-direction: row;
      position: relative;
      // justify-content: flex-start;
      // align-items: flex-start;
      // min-width: 100px;
    }

    .number {
      font-size: 16px;
      margin-top: 11px;
      width: 60px;
      flex-grow: 0;
      flex-shrink: 0;
      text-align: right;

      .required {
        color: red;
        margin-right: 4px;
        visibility: hidden;
      }

      .visible {
        visibility: visible;
      }
    }

    .text {
      flex-grow: 1;
      padding-top: 2px;
      font-size: 16px;
      white-space: normal;
      // width: 100%;
      // max-width: 400px;
      position: relative;

      :deep(.ProseMirror) {
        padding: 8px;
      }

      :deep(.editor) {
        border: 1px solid transparent;
        border-radius: 4px;
      }

      &:hover {
        :deep(.editor:not(:focus-within)) {
          border: 1px dashed var(--border-dark);
        }
      }

      &:focus-within {
        :deep(.editor) {
          // border: 1px dashed var(--border-dark);
          background: var(--bg-tertiary);
        }
      }
    }

    .opr {
      flex-shrink: 0;
      flex-grow: 0;
      display: flex;
      opacity: 0;
      flex-direction: row;
      cursor: pointer;
      margin: 0 12px;
      padding: 8px 0;
      transition: opacity 0.15s ease;

      .items {
        opacity: 0.5;
        margin-right: 8px;
        transition: opacity 0.15s ease;

        &:hover,
        &:active {
          opacity: 1;
        }
      }
    }
  }
}

.content {
  margin: 20px 20px 0px 50px;
}

:has(.dragging) {
  .q-item * {
    pointer-events: none;
  }
}

.settings {
  grid-area: settings;
  padding: 12px;
  background: var(--bg-primary);
  overflow-y: auto;
  border-left: 1px solid var(--border-light);
}

.drawer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-secondary);
  z-index: 1000;
  overflow: hidden;
  animation: drawer-open 0.2s ease-out;
  transform-origin: center;

  .close {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px;
    border-radius: 4px;
    z-index: 1001;
    cursor: pointer;
    color: var(--text-secondary);
    &:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }
  }
}

.cooperator-list {
  display: flex;
  flex-direction: row;
  gap: 8px;
  margin-top: 20px;
  .list {
    flex: 1;
    .item {
      display: flex;
      flex-direction: row;
      align-items: center;
      // justify-content:
      gap: 8px;
    }
  }
}

@keyframes drawer-open {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.logic-tag {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 40px;
  height: 24px;
  font-size: 12px;
  padding: 0;
  line-height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  border-radius: 5px 0 3px 0;
  cursor: pointer;

  &:hover:not(.enabled) {
    color: var(--text-primary);
  }

  &:hover.enabled {
    background: var(--c-brand-600);
  }

  &.enabled {
    color: var(--c-white);
    background: var(--c-brand);
  }
}

.preview-close {
  position: absolute;
  cursor: pointer;
  background: none;
  border: 1px solid var(--c-white);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  padding: 4px;
  top: -10px;
  right: -10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-white);

  &:hover {
    background: var(--bg-secondary);
    color: var(--c-brand);
  }
}

.loading {
  // opacity: 1;
  width: 14px;
  height: 14px;
  border: 2px solid var(--c-brand);
  border-top-color: var(--border-medium);
  border-right-color: var(--border-medium);
  border-bottom-color: var(--border-medium);
  border-radius: 100%;
  animation: circle 1s linear infinite;
}

@keyframes circle {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

<style>
.preview-modal {
  .ant-modal-content {
    background: transparent;
    box-shadow: none;
  }

  .ant-modal-close {
    background: none;

    &:hover {
      background: none;
    }
  }
}
</style>
