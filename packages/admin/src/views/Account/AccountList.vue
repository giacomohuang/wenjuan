<template>
  <div class="main-wrap">
    <a-table
      :scroll="{ x: 1200 }"
      :columns="[
        { title: t('account.accountlist.accountname'), dataIndex: 'accountname', key: 'accountname', fixed: 'left' },
        { title: t('account.accountlist.realname'), dataIndex: 'realname', key: 'realname', fixed: 'left' },
        { title: t('account.accountlist.email'), dataIndex: 'email', key: 'email' },
        { title: t('account.accountlist.phone'), dataIndex: 'phone', key: 'phone' },
        {
          title: t('account.accountlist.2fa'),
          dataIndex: 'enable2FA',
          key: 'enable2FA',
          align: 'center',
          filters: [
            { text: t('common.enabled'), value: true },
            { text: t('common.disabled'), value: false }
          ],
          filterMultiple: false
        },

        {
          title: t('common.status'),
          dataIndex: 'status',
          key: 'status',
          align: 'center',
          defaultFilteredValue: defaultFilters['status'],
          filters: [
            { text: t('common.enabled'), value: 1 },
            { text: t('common.disabled'), value: 0 }
          ],
          filterMultiple: false,
          width: 80
        },
        { title: t('common.action'), key: 'action', width: 128, align: 'center', fixed: 'right' }
      ]"
      :dataSource="accounts"
      :pagination="pagination"
      @change="handleTableChange"
      rowKey="_id"
      :loading="isLoading"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'accountname'">
          <a :href="`/account/${record._id}`">{{ record.accountname }}</a>
        </template>
        <template v-else-if="column.key === 'enable2FA'">
          <a-tag :color="record.enable2FA ? 'green' : 'red'">{{ record.enable2FA ? '已开启' : '未开启' }}</a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a @click="handleEdit(record._id)" href="####">{{ t('common.edit') }}</a>
          <a-divider type="vertical" />
          <a href="####">{{ t('common.disable') }}</a>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="record.status ? 'green' : 'red'">{{ record.status ? t('common.enabled') : t('common.disabled') }}</a-tag>
        </template>
      </template>
    </a-table>
    <a-drawer title="Basic Drawer" size="large" :open="openEditor" @close="onCloseEditor">
      <template #extra>
        <a-button style="margin-right: 8px" @click="onCloseEditor">Cancel</a-button>
        <a-button type="primary" @click="onCloseEditor">Submit</a-button>
      </template>
      <p>{{ editForm.id }}</p>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import API from '../../api/API'
import SimpleBar from 'simplebar'
import '@/assets/simplebar.css'

const { t, locale } = useI18n()

const accounts = ref([])
const isLoading = ref(false)
const openEditor = ref(false)
const editForm = reactive({})
const defaultFilters = ref({
  status: ['1']
})
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const handleEdit = (id) => {
  openEditor.value = true
  editForm.id = id
}

const onCloseEditor = () => {
  openEditor.value = false
}

onMounted(async () => {
  isLoading.value = true
  const result = await API.account.list(pagination.current, pagination.pageSize, { status: 1 })
  accounts.value = result.accounts
  pagination.total = result.total
  isLoading.value = false
  const el = document.querySelector('.main-wrap')

  new SimpleBar(el, { direction: document.dir })
  const eltable = document.querySelector('.ant-table-content')
  new SimpleBar(eltable, { direction: document.dir })
})

const handleTableChange = async (p, filters, sorter) => {
  const query = {}
  if (filters.enable2FA) {
    query.enable2FA = filters.enable2FA[0]
  }
  if (filters.status) {
    query.status = filters.status[0]
  }
  console.log('query', filters, query)
  // for (const filter in filters) {
  //   if (filter) {
  //     query[filter] = filters[filter][0]
  //   }
  // }
  isLoading.value = true
  const result = await API.account.list(p.current, p.pageSize, query)
  accounts.value = result.accounts
  pagination.total = result.total
  pagination.current = p.current
  pagination.pageSize = p.pageSize
  isLoading.value = false
}
</script>
<style lang="scss" scoped>
.main-wrap {
  padding: 20px;
  max-height: calc(100vh - 65px);
}
</style>
