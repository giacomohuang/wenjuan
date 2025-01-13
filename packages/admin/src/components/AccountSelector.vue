<template>
  <a-select v-model:value="value" show-search :filter-option="false" @search="getAccountList" :loading="loading" :placeholder="placeholder" :options="accountList">
    <template #option="{ label, avatar }">
      <div class="wrapper">
        <img :src="avatar || defaultAvatar" class="avatar" @error="handleAvatarError" />
        <span>{{ label }}</span>
      </div>
    </template>
    <template #dropdownRender="{ menuNode: menu }">
      <v-nodes :vnodes="menu" />
      <div v-if="pagination.pages > 1">
        <a-divider style="margin: 4px 0" />
        <div style="padding: 8px">
          <a-pagination v-model:current="pagination.page" simple :total="pagination.total" :pageSize="pagination.pageSize" size="small" @change="pageChanged" :hideOnSinglePage="true" />
        </div>
      </div>
    </template>
    <template #notFoundContent>
      <template v-if="loading">
        <a-spin size="small" />
      </template>
      <template v-else>
        <div style="text-align: center; padding: 8px">暂无数据</div>
      </template>
    </template>
  </a-select>
</template>

<script setup>
import { ref, reactive, defineComponent, watch, onUnmounted, onMounted } from 'vue'
import defaultAvatar from '@/assets/avatar.jpg'
import { message } from 'ant-design-vue'
import API from '@/api/API'
import { debounce } from 'lodash-es'

const props = defineProps({
  modelValue: {
    type: String,
    default: null
  },
  placeholder: {
    type: String,
    default: '请选择成员'
  }
})

const emit = defineEmits(['update:modelValue'])

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

// 状态定义
const loading = ref(false)
const accountList = ref([])
const accountKeyword = ref('')
const value = ref(props.modelValue)

// 分页相关状态
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  pages: 1
})

// 监听value变化
watch(value, (newVal) => {
  emit('update:modelValue', newVal)
})

// 监听props.modelValue变化
watch(
  () => props.modelValue,
  (newVal) => {
    value.value = newVal
  }
)

// 获取用户选项
const getAccountList = debounce(async (searchValue) => {
  if (!searchValue) return
  loading.value = true
  if (accountKeyword.value !== searchValue) {
    pagination.page = 1
  }
  accountKeyword.value = searchValue
  try {
    const data = await API.account.list(pagination.page, pagination.pageSize, searchValue, 1)
    accountList.value = data.accounts.map((item) => {
      item.label = `${item.realname}(${item.accountname})`
      item.value = item._id
      item.avatar = item.avatar
      return item
    })
    pagination.total = data.total
    pagination.pages = data.pages
  } catch (error) {
    message.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}, 300)

// 分页变化
const pageChanged = async (page) => {
  pagination.page = page
  await getAccountList(accountKeyword.value)
}

// 头像加载失败处理
const handleAvatarError = (e) => {
  e.target.src = defaultAvatar
}

onMounted(() => {
  console.log('onMounted')
  emit('update:modelValue', null)
})
onUnmounted(() => {})
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  align-items: center;
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
