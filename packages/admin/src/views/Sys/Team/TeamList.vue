<template>
  <div class="team-list-container">
    <!-- 顶部操作栏 -->
    <div class="operation-bar">
      <a-space>
        {{ currentTeamId }}
        <a-button type="primary" @click="showCreateModal">
          <template #icon><plus-outlined /></template>
          创建团队
        </a-button>
        <a-input-search v-model:value="searchKeyword" placeholder="请输入团队名称搜索" style="width: 200px" @search="handleSearch" />
      </a-space>
    </div>

    <!-- 团队列表 -->
    <a-table :columns="columns" :scroll="{ x: 1200 }" :data-source="teamList" :loading="loading" :pagination="pagination" @change="handleTableChange" row-key="id">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'createdAt'">
          {{ dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.key === 'operator'">
          <div class="wrapper">
            <img :src="record.operator?.avatar || defaultAvatar" class="avatar" @error="this.src = defaultAvatar" />
            <span>{{ record.operator?.accountname }}</span>
          </div>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space size="small">
            <a-button type="link" @click="handleEdit(record)">编辑</a-button>
            <a-button type="link" @click="handleMembers(record)">成员管理</a-button>
            <a-popconfirm title="确定要删除这个团队吗？" @confirm="handleDelete(record)">
              <a-button type="link" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 创建/编辑团队弹窗 -->
    <a-modal v-model:open="modal" :title="modalType === 'create' ? '创建团队' : '编辑团队'" @ok="handleModalOk" destroy-on-close>
      <a-form ref="formRef" :model="formState" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="团队名称" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入团队名称" />
        </a-form-item>
        <a-form-item label="团队描述" name="description">
          <a-textarea v-model:value="formState.description" placeholder="请输入团队描述" :rows="4" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 成员管理弹窗 -->
    <a-modal v-model:open="memberModal" title="成员管理" width="800px" @ok="handleMemberModalOk" destroy-on-close>
      <a-table :columns="memberColumns" :data-source="teamMembers" :loading="memberLoading" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'memberInfo'">
            <div class="wrapper">
              <img :src="record.memberInfo.avatar || defaultAvatar" class="avatar" @error="handleAvatarError" />
              <span>{{ record.memberInfo.realname }} ({{ record.memberInfo.accountname }})</span>
            </div>
          </template>
          <template v-if="column.key === 'joinedAt'">
            {{ dayjs(record.joinedAt).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
          <template v-if="column.key === 'action'">
            <a-popconfirm title="确定要移除该成员吗？" @confirm="handleRemoveMember(record)">
              <a-button type="link" danger>移除</a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
      <div style="margin-top: 16px">
        <a-button type="primary" @click="showAddMemberModal"> 添加成员 </a-button>
      </div>
    </a-modal>

    <!-- 添加成员弹窗 -->
    <a-modal v-model:open="addMemberModal" title="添加成员" @ok="handleAddMember" destroy-on-close>
      <a-form ref="addMemberFormRef" :model="addMemberForm" :rules="addMemberRules" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="成员" name="accountIds">
          <a-select v-model:value="addMemberForm.memberId" show-search :filter-option="false" @search="getAccountList" :loading="accountLoading" placeholder="请选择成员" :options="accountList">
            <template #option="{ label, avatar }">
              <div class="wrapper">
                <img :src="avatar || defaultAvatar" class="avatar" @error="handleAvatarError" />
                <span>{{ label }}</span>
              </div>
            </template>
            <template #dropdownRender="{ menuNode: menu }">
              <v-nodes :vnodes="menu" />
              <a-divider style="margin: 4px 0" />
              <div style="padding: 8px">
                <a-pagination v-model:current="accountPagination.page" :total="accountPagination.total" :pageSize="accountPagination.pageSize" size="small" @change="accountPageChanged" :hideOnSinglePage="true" />
              </div>
            </template>
            <template #notFoundContent>
              <template v-if="accountLoading">
                <a-spin size="small" />
              </template>
              <template v-else>
                <div style="text-align: center; padding: 8px">暂无数据</div>
              </template>
            </template>
          </a-select>
        </a-form-item>
        <a-form-item label="角色" name="role">
          <a-select v-model:value="addMemberForm.role" placeholder="请选择角色">
            <a-select-option value="admin">管理员</a-select-option>
            <a-select-option value="member">普通成员</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineComponent } from 'vue'
import defaultAvatar from '@/assets/avatar.jpg'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import API from '@/api/API'
import dayjs from 'dayjs'
import { debounce } from 'lodash-es'
import SimpleBar from 'simplebar'
import '@/assets/simplebar.css'

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

// 表格列定义
const columns = [
  {
    title: '团队名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt'
  },
  {
    title: '成员数量',
    dataIndex: 'memberCount',
    key: 'memberCount'
  },
  {
    title: '操作人',
    dataIndex: 'operator',
    key: 'operator'
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right'
  }
]

// 状态定义
const loading = ref(false)
const teamList = ref([])
const searchKeyword = ref('')
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 用户选择分页相关状态
const accountPagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  pages: 1
})

// 模态框状态
const modal = ref(false)
const modalType = ref('create')
const formRef = ref(null)
const formState = reactive({
  name: '',
  description: ''
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入团队名称', trigger: 'blur' },
    { min: 2, max: 50, message: '团队名称长度应在2-50个字符之间', trigger: 'blur' }
  ],
  description: [{ max: 200, message: '描述最多200个字符', trigger: 'blur' }]
}

// 获取团队列表
const fetchTeamList = async () => {
  loading.value = true
  try {
    const data = await API.team.list({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value
    })
    teamList.value = data.list
    pagination.total = data.total
  } catch (error) {
    message.error('获取团队列表失败')
  } finally {
    loading.value = false
  }
}

// 创建/编辑团队
const handleModalOk = async () => {
  try {
    await formRef.value.validate()
    if (modalType.value === 'create') {
      await API.team.create(formState)
      message.success('创建成功')
    } else {
      await API.team.update(formState)
      message.success('更新成功')
    }
    modal.value = false
    fetchTeamList()
  } catch (error) {
    console.error('表单提交失败:', error)
  }
}

// 删除团队
const handleDelete = async (record) => {
  try {
    await API.team.delete(record._id)
    message.success('删除成功')
    fetchTeamList()
  } catch (error) {
    message.error('删除失败')
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  fetchTeamList()
}

// 表格变化处理
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchTeamList()
}

// 显示创建模态框
const showCreateModal = () => {
  modalType.value = 'create'
  formState.name = ''
  formState.description = ''
  modal.value = true
}

// 显示编辑模态框
const handleEdit = (record) => {
  modalType.value = 'edit'
  formState.id = record.id
  formState.name = record.name
  formState.description = record.description
  modal.value = true
}

// 成员管理相关状态
const memberModal = ref(false)
const memberLoading = ref(false)
const teamMembers = ref([])
const currentTeamId = ref(null)

// 成员表格列定义
const memberColumns = [
  {
    title: '用户名',
    dataIndex: ['memberInfo'],
    key: 'memberInfo'
  },
  {
    title: '角色',
    dataIndex: 'role',
    key: 'role'
  },
  {
    title: '加入时间',
    dataIndex: 'joinedAt',
    key: 'joinedAt'
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    fixed: 'right'
  }
]

// 显示成员管理弹窗
const handleMembers = async (record) => {
  console.log('handleMembers', record)
  currentTeamId.value = record._id
  memberModal.value = true
  await fetchTeamMembers()
}

// 获取团队成员列表
const fetchTeamMembers = async () => {
  if (!currentTeamId.value) return

  memberLoading.value = true
  try {
    const data = await API.team.memberList({ teamId: currentTeamId.value })
    console.log('fetchTeamMembers', data)
    teamMembers.value = data.members
  } catch (error) {
    message.error('获取团队成员失败')
  } finally {
    memberLoading.value = false
  }
}

// 移除团队成员
const handleRemoveMember = async (record) => {
  try {
    await API.team.removeMember(currentTeamId.value, record.memberId)
    message.success('移除成员成功')
    await fetchTeamMembers()
  } catch (error) {
    message.error('移除成员失败')
  }
}

// 添加成员相关状态
const addMemberModal = ref(false)
const addMemberForm = reactive({
  memberId: null,
  role: 'member'
})
const addMemberFormRef = ref(null)

// 显示添加成员弹窗
const showAddMemberModal = () => {
  addMemberModal.value = true
}

// 处理添加成员
const handleAddMember = async () => {
  try {
    await addMemberFormRef.value.validate()
    console.log('addMemberForm', currentTeamId.value, addMemberForm.memberId, addMemberForm.role)
    await API.team.addMember({
      teamId: currentTeamId.value,
      accountId: addMemberForm.memberId,
      role: addMemberForm.role
    })
    message.success('添加成员成功')
    addMemberModal.value = false
    addMemberForm.memberId = null
    addMemberForm.role = 'member'
    await fetchTeamMembers()
  } catch (error) {
    console.error('添加成员失败:', error)
    message.error('添加成员失败')
  }
}

// 处理成员管理弹窗确认
const handleMemberModalOk = () => {
  memberModal.value = false
  currentTeamId.value = null
  teamMembers.value = []
}

// 添加成员表单验证规则
const addMemberRules = {
  memberId: [{ required: true, message: '请选择成员' }],
  role: [{ required: true, message: '请选择角色' }]
}

// 用户选择相关状态
const accountList = ref([])
const accountLoading = ref(false)
const accountKeyword = ref('')

// 获取用户选项
const getAccountList = debounce(async (value) => {
  if (!value) return
  accountLoading.value = true
  if (accountKeyword.value !== value) {
    accountPagination.page = 1
  }
  accountKeyword.value = value
  try {
    const data = await API.account.list(accountPagination.page, accountPagination.pageSize, value, 1)
    accountList.value = data.accounts.map((item) => {
      item.label = `${item.realname}(${item.accountname})`
      item.value = item._id
      item.avatar = item.avatar
      return item
    })
    accountPagination.total = data.total
    accountPagination.pages = data.pages
  } catch (error) {
    message.error('获取用户列表失败')
  } finally {
    accountLoading.value = false
  }
}, 300)

// 用户选择分页变化
const accountPageChanged = async (page) => {
  accountPagination.page = page
  await getAccountList(accountKeyword.value)
}

// 头像加载失败处理
const handleAvatarError = (e) => {
  e.target.src = defaultAvatar
}

// 初始化
onMounted(() => {
  const eltable = document.querySelector('.ant-table-content')
  new SimpleBar(eltable, { direction: document.dir })
  fetchTeamList()
})
</script>

<style lang="scss" scoped>
.team-list-container {
  padding: 24px;

  .operation-bar {
    margin-bottom: 16px;
  }
}

.wrapper {
  display: flex;
  align-items: center;
  // justify-content: center;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--border-light);
  background-color: var(--bg-secondary);
  margin-right: 8px;
  display: flex;
}
</style>
