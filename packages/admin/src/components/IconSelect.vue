<template>
  <div class="icon-select">
    <div class="search-bar">
      <a-input v-model:value="keyword" :placeholder="t('sys.permission.resource.searchIcon')" class="!w-[200px]">
        <template #prefix>
          <icon name="search" style="color: var(--text-tertiary)" />
        </template>
      </a-input>
    </div>
    <div class="title">{{ t('comp.iconSelect.systemIcons') }}</div>
    <div class="icon-grid">
      <div v-for="icon in filteredIcons" :key="icon" class="icon-item" @click="selectIcon(1, icon)">
        <Icon :name="icon" size="2em" />
        <span class="icon-name">{{ icon }}</span>
      </div>
    </div>
    <a-divider />
    <div class="title">
      <div>{{ t('comp.iconSelect.customIcons') }}</div>
      <a-upload accept=".svg" :show-upload-list="false" :before-upload="handleBeforeUpload" :custom-request="handleCustomUpload">
        <a-button type="primary">{{ t('common.upload') }}</a-button>
      </a-upload>
      <a-tag v-if="uploadStatus.show" :color="uploadStatus.type">{{ uploadStatus.message }}</a-tag>
    </div>
    <div v-if="filteredCustomIcons.length == 0">
      <div class="no-icon">{{ t('comp.iconSelect.noIcons') }}</div>
    </div>
    <div v-else class="icon-grid">
      <div v-for="icon in filteredCustomIcons" :key="icon._id" class="icon-item" @click="selectIcon(2, icon.path)">
        <div class="del" @click="deleteIcon($event, icon)"></div>
        <Icon :name="icon.path" size="2em" :key="icon.path" />
        <!-- <div class="custom-icon" :style="{ maskImage: `url(${customIconUrlPrefix + icon.path})` }" /> -->
        <span class="icon-name">{{ icon.name }}</span>
      </div>
    </div>

    <!-- 添加分页组件 -->
    <div class="mt-4 flex justify-center">
      <a-pagination v-model:current="pagination.current" hideOnSinglePage :total="pagination.total" :page-size="pagination.pageSize" :disabled="pagination.loading" @change="handlePageChange" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { message, Modal } from 'ant-design-vue'
import API from '@/api/API'
import debounceRef from '@/js/debounceRef'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['iconSelect'])
const keyword = debounceRef('', 300)
const icons = ref([])
const customIcons = ref([])
const uploadStatus = reactive({
  show: false,
  message: '',
  type: 'info',
  percent: 0
})
const pagination = reactive({
  current: 1,
  pageSize: 24,
  total: 0,
  loading: false
})

// 处理上传前的验证
const handleBeforeUpload = (file) => {
  const isSvg = file.type === 'image/svg+xml'
  if (!isSvg) {
    message.error(t('comp.iconSelect.svgOnly'))
  }
  const isLt2M = file.size / 1024 / 1024 < 1
  if (!isLt2M) {
    message.error(t('comp.iconSelect.sizeLimit'))
  }
  return isSvg && isLt2M
}

// 修改加载自定义图标的方法
const loadCustomIcons = async (page = 1) => {
  try {
    console.log('***page', page)
    pagination.loading = true
    const result = await API.oss.getSvgIconList('', page, pagination.pageSize)
    customIcons.value = result.data || []

    pagination.total = result.total
    pagination.current = page
    console.log('***pagination', pagination)
  } catch (error) {
    message.error('load custom icon error：' + error.message)
  } finally {
    pagination.loading = false
  }
}

// 修改上传处理函数
const handleCustomUpload = async ({ file, onSuccess, onError }) => {
  try {
    uploadStatus.show = true
    uploadStatus.message = t('comp.iconSelect.preparing')
    uploadStatus.type = 'info'
    uploadStatus.percent = 0

    // 获取文件名（不含扩展名）作为图标名
    const iconName = file.name.replace('.svg', '')

    // 上传文件
    const formData = new FormData()
    formData.append('file', file)

    // 上传并显示进度
    const res = await API.oss.svgIconUpload(formData, (progress) => {
      uploadStatus.percent = Math.round((progress / file.size) * 100)
      uploadStatus.message = t('comp.iconSelect.uploading', { percent: uploadStatus.percent })
    })

    // 更新图标列表
    // customIcons.value.push({ name: iconName, url: 'http://localhost:9000/svgicon/' + res.filename })

    uploadStatus.show = true
    uploadStatus.message = t('comp.iconSelect.success')
    uploadStatus.type = 'success'
    uploadStatus.percent = 100

    API.oss.addSvgIcon(iconName, res.filename)

    setTimeout(() => {
      uploadStatus.show = false
    }, 1000)

    onSuccess()

    // 上传成功后重新加载当前页的图标
    keyword.value = ''
    await loadCustomIcons(1)
  } catch (error) {
    uploadStatus.show = true
    uploadStatus.message = t('comp.iconSelect.failed', { error: error.message })
    uploadStatus.type = 'error'
    uploadStatus.percent = 0

    onError()
  }
}

// 处理分页变化
const handlePageChange = (page) => {
  loadCustomIcons(page)
}

// 使用 Vite 的 glob 导入获取所有 svg 图标
const modules = import.meta.glob('@/assets/icons/*.svg')

const filteredIcons = computed(() => {
  if (!keyword.value) return icons.value
  return icons.value.filter((icon) => icon.toLowerCase().includes(keyword.value.toLowerCase()))
})

const filteredCustomIcons = computed(() => {
  console.log('***customIcons', customIcons.value)
  if (!keyword.value) return customIcons.value
  return customIcons.value.filter((icon) => icon.name.toLowerCase().includes(keyword.value.toLowerCase()))
})

onMounted(async () => {
  // 处理系统图标名称
  icons.value = Object.keys(modules).map((key) => {
    return key.split('/').pop().replace('.svg', '')
  })

  // 加载自定义图标
  await loadCustomIcons(1)
})

const selectIcon = (iconType, icon) => {
  emit('iconSelect', { iconType, icon })
}
// 修改删除图标的方法
const deleteIcon = async (event, icon) => {
  event.stopPropagation()

  Modal.confirm({
    title: t('common.delete'),
    content: t('comp.iconSelect.confirmContent', { name: icon.name }),
    okText: t('common.ok'),
    cancelText: t('common.cancel'),
    onOk: async () => {
      // 调用删除 API
      await API.oss.removeSvgIcon(icon.path)

      // 从 DOM 中移除 symbol
      const symbolId = `cus-${icon.path}`
      const symbol = document.getElementById(symbolId)
      if (symbol) {
        symbol.remove()
      }

      // 计算删除后的总数
      pagination.total -= 1

      // 计算当前页应该显示的数量
      const currentPageItemCount = customIcons.value.length - 1

      // 如果当前页已经没有数据了,且不是第一页,则跳转到前一页
      if (currentPageItemCount === 0 && pagination.current > 1) {
        await loadCustomIcons(pagination.current - 1)
      } else {
        // 否则重新加载当前页
        await loadCustomIcons(pagination.current)
      }
      message.success(t('common.deleteSuccess'))
    }
  })
}
</script>

<style lang="scss" scoped>
.title {
  margin: 30px 0 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}
.icon-select {
  padding: 12px;

  .icon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, 110px);
    gap: 12px;

    // .custom-icon {
    //   width: 2em;
    //   height: 2em;
    //   background-color: var(--text-primary);
    //   mask-size: 2em 2em;
    //   mask-repeat: no-repeat;
    //   mask-position: center;
    // }

    .icon-item {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px;
      border: 1px solid #eee;
      // width: 100px;
      color: var(--text-primary);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: var(--c-brand-600);
        // background: var(--c-bra);

        .del {
          display: flex;
        }
      }

      .icon-name {
        font-size: 10px;
        color: var(--text-secondary);
        text-align: center;
        word-break: break-all;
      }
    }
    .del {
      position: absolute;
      top: -5px;
      right: -5px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 1px solid var(--c-brand);
      align-items: center;
      justify-content: center;
      background: var(--bg-primary);
      display: none;

      &:after,
      &:before {
        content: '';
        position: absolute;
        width: 10px;
        height: 10px;
        border-top-width: 1px;
        border-color: var(--c-brand);
      }
      &:before {
        transform: translate(-3px, 3px) rotate(45deg);
      }
      &:after {
        transform: translate(3px, 3px) rotate(-45deg);
      }
      &:hover {
        background: var(--c-brand);
        &:after,
        &:before {
          border-color: var(--c-white);
        }
      }
    }

    // 添加加载状态样式
    &.loading {
      opacity: 0.6;
      pointer-events: none;
    }
  }
}
.no-icon {
  text-align: center;
  color: var(--text-secondary);
}
</style>
