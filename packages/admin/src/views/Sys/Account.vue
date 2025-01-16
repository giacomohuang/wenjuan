<template>
  <div class="main-wrap">
    <div class="opr">
      <a-input-search v-model:value="keywords" placeholder="请输入账户名或真实姓名查询" autocomplete="new-password" allowClear style="width: 400px" @search="handleSearch" />
      <a-button @click="handleAddAccount">{{ t('sys.account.addaccount') }}</a-button>
    </div>
    <a-table
      :scroll="{ x: 1200 }"
      :columns="[
        { title: t('sys.account.accountname'), dataIndex: 'accountname', key: 'accountname', fixed: 'left' },
        { title: t('sys.account.realname'), dataIndex: 'realname', key: 'realname', fixed: 'left' },
        { title: t('sys.account.email'), dataIndex: 'email', key: 'email' },
        { title: t('sys.account.phone'), dataIndex: 'phone', key: 'phone' },
        {
          title: t('sys.account.2fa'),
          dataIndex: 'enable2FA',
          key: 'enable2FA',
          align: 'center',
          filters: [
            { text: t('common.enabled1'), value: true },
            { text: t('common.disabled1'), value: false }
          ],
          filterMultiple: false
        },

        {
          title: t('common.status'),
          dataIndex: 'status',
          key: 'status',
          align: 'center',
          defaultFilteredValue: filters['status'],
          filters: [
            { text: t('common.enabled'), value: 1 },
            { text: t('common.disabled'), value: 0 }
          ],
          filterMultiple: false,
          width: 80
        },
        { title: t('common.action'), key: 'action', align: 'center', fixed: 'right' }
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
          <a-button type="link" size="small" @click="handleEdit(record._id)">{{ t('common.edit') }}</a-button>
          <a-divider type="vertical" />
          <a-button type="link" size="small" danger>{{ t('common.disable') }}</a-button>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="record.status ? 'green' : 'red'">{{ record.status ? t('common.enabled') : t('common.disabled') }}</a-tag>
        </template>
      </template>
    </a-table>
    <a-drawer :title="accountForm.id ? t('sys.account.editaccount') : t('sys.account.addaccount')" size="large" :open="openEditor" @close="onCloseEditor">
      <a-form :model="accountForm" :rules="rules" ref="formRef" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-item :label="t('sys.account.accountname')" name="accountname">
          <a-input v-model:value="accountForm.accountname" :disabled="!!accountForm.id" autocomplete="new-password" />
        </a-form-item>
        <a-form-item :label="t('sys.account.realname')" name="realname">
          <a-input v-model:value="accountForm.realname" autocomplete="new-password" />
        </a-form-item>
        <a-form-item :label="t('sys.account.email')" name="email">
          <a-input v-model:value="accountForm.email" autocomplete="new-password" />
        </a-form-item>
        <a-form-item :label="t('sys.account.phone')" name="phone">
          <a-input v-model:value="accountForm.phone" autocomplete="new-password">
            <template #addonBefore>
              <a-select show-search v-model:value="accountForm.areacode" style="width: 100px" :placeholder="t('my.authentication.areacode')" allowClear :dropdown-match-select-width="false">
                <a-select-option v-for="(item, index) in areaCode" :key="index" :value="item.code">{{ item.code }}({{ item[locale] }})</a-select-option>
              </a-select>
            </template>
          </a-input>
        </a-form-item>
        <a-form-item :label="t('common.status')" name="status">
          <a-switch v-model:checked="accountForm.status" :checkedValue="1" :unCheckedValue="0" :checkedChildren="t('common.enabled')" :unCheckedChildren="t('common.disabled')" />
        </a-form-item>
        <template v-if="!accountForm.id">
          <a-form-item :label="t('sys.account.password')" name="password">
            <a-input-password v-model:value="accountForm.password" autocomplete="new-password" />
          </a-form-item>
          <a-form-item :label="t('sys.account.confirmpassword')" name="confirmPassword">
            <a-input-password v-model:value="accountForm.confirmPassword" autocomplete="new-password" />
          </a-form-item>
        </template>
      </a-form>
      <template #footer>
        <a-space>
          <a-button @click="onCloseEditor">{{ t('common.cancel') }}</a-button>
          <a-button type="primary" @click="handleSubmit" :loading="submitting">{{ t('common.submit') }}</a-button>
        </a-space>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeMount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import API from '@/api/API'
import SimpleBar from 'simplebar'
import '@/assets/simplebar.css'
import areaCode from '@/js/areacode'

const { t, locale } = useI18n()

const accounts = ref([])
const isLoading = ref(false)
const openEditor = ref(false)
const accountForm = reactive({})
const filters = ref({
  status: ['1'],
  enable2FA: [undefined]
})
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  hideOnSinglePage: true
})
const keywords = ref('')

const formRef = ref()
const submitting = ref(false)

const rules = {
  accountname: [{ required: true, message: '请输入账户名', trigger: 'blur' }],
  realname: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: async (rule, value) => {
        if (value && value !== accountForm.password) {
          throw new Error('两次输入的密码不一致')
        }
      },
      trigger: 'change'
    }
  ]
}

const handleEdit = async (id) => {
  openEditor.value = true
  if (id) {
    const result = await API.account.get(id)
    Object.assign(accountForm, result)
    accountForm.id = id
  }
}

const onCloseEditor = () => {
  openEditor.value = false
  formRef.value?.resetFields()
  Object.keys(accountForm).forEach((key) => {
    delete accountForm[key]
  })
}

const handleAddAccount = () => {
  openEditor.value = true
  accountForm.status = 1
}
watch(openEditor, (newVal) => {
  console.log('newVal', newVal)
})

const list = async () => {
  try {
    isLoading.value = true
    const result = await API.account.list(pagination.current, pagination.pageSize, keywords.value, filters.value.status?.[0], filters.value.enable2FA?.[0])
    accounts.value = result.accounts
    pagination.total = result.total
    pagination.current = pagination.current
    pagination.pageSize = pagination.pageSize
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

onBeforeMount(async () => {
  isLoading.value = true
  await list()
  const el = document.querySelector('.main-wrap')

  new SimpleBar(el, { direction: document.dir })
  const eltable = document.querySelector('.ant-table-content')
  new SimpleBar(eltable, { direction: document.dir })
})

const handleTableChange = async (page, f, sorter) => {
  console.log('f', f)
  pagination.current = page.current
  pagination.pageSize = page.pageSize
  filters.value.status = f.status
  filters.value.enable2FA = f.enable2FA
  await list()
}

const handleSearch = async () => {
  await list()
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true
    if (!accountForm.id) {
      accountForm.initPwd = false
    }
    console.log(accountForm)
    const result = await API.account.save(accountForm)
    if (result.result) {
      onCloseEditor()
      await list()
    }
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}
</script>
<style lang="scss" scoped>
.main-wrap {
  padding: 20px;
  max-height: calc(100vh - 65px);
  .opr {
    margin-bottom: 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
