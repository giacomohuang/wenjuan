<template>
  <div class="project">
    {{}}
    <div class="header">
      <div class="left">
        <div class="title">{{ teamId ? teamList.find((item) => item._id === teamId)?.name : '个人' }}项目</div>
        <a-dropdown>
          <a class="ant-dropdown-link" @click.prevent> 切换团队<icon name="arrow-down" /> </a>
          <template #overlay>
            <a-menu>
              <a-menu-item>
                <div @click="changeTeam(null)">个人</div>
              </a-menu-item>
              <a-menu-item v-for="item in teamList" :key="item._id">
                <div @click="changeTeam(item._id)">{{ item.name }}</div>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>
    <ul class="list">
      <li class="item" v-for="item in wenjuan" :key="item._id" @click="handleEdit(item._id)">
        <icon name="remove" class="ico-remove" @click.stop="handleRemove(item._id)" />
        <div class="title">{{ item.draft ? item.draft.name : item.name }}</div>
        <div class="time">{{ dayjs(item.updatedAt).fromNow() }}更新</div>
        <div class="footer">
          <div class="status">
            <mp-tag size="small" :color="item.isPublish ? (dayjs(item.endTime).isAfter(dayjs()) ? 'gray' : 'green') : 'gray'">{{ item.isPublish ? (dayjs(item.endTime).isAfter(dayjs()) ? '已结束' : '收集中') : '未发布' }}</mp-tag>
            <mp-tag size="small" color="blue" v-if="item.draft">草稿模式</mp-tag>
          </div>
        </div>
      </li>
      <li class="item add" @click="handleAdd">
        <icon name="plus" size="2em" />
      </li>
    </ul>
    <div class="pagination">
      <a-pagination v-model:current="current" :total="total" :pageSize="pageSize" @change="handlePageChange" hideOnSinglePage />
    </div>
  </div>
</template>

<router lang="json">
{
  "param": "/:teamId?"
}
</router>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import API from '@/api/API'
import { useRouter } from 'vue-router'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useStorage } from '@vueuse/core'

dayjs.extend(relativeTime)

const router = useRouter()
const wenjuan = ref([])
const current = ref(1)
const pageSize = ref(10)
const total = ref(0)
const teamList = ref([])
const teamId = ref(router.currentRoute.value.params.teamId || localStorage.getItem('teamId'))

console.log('teamId', teamId.value)

const handleEdit = (id) => {
  router.push(`/wenjuan/editor/${id}`)
}

const handleAdd = () => {
  router.push(`/wenjuan/editor`)
}

const handleRemove = async (id) => {
  const res = await API.wenjuan.remove([id])
  if (res.acknowledged) {
    if (wenjuan.value.length === 1 && current.value > 1) {
      current.value--
    }
    await loadData()
    if (wenjuan.value.length === 0 && current.value > 1) {
      current.value--
      await loadData()
    }
  }
}

const handlePageChange = (page) => {
  current.value = page
  loadData()
}

const loadData = async () => {
  const teamRes = await API.team.listByAccountId()
  teamList.value = teamRes
  if (teamId.value) {
    // 验证合法性
    if (!teamList.value.find((item) => item._id === teamId.value)) {
      teamId.value = null
    }
  }
  const res = await API.wenjuan.list(current.value, pageSize.value, '', teamId.value, { updatedAt: -1 })
  wenjuan.value = res.wenjuan
  total.value = res.total
}
const changeTeam = (id) => {
  if (id) {
    localStorage.setItem('teamId', id)
    router.push(`/wenjuan/project/${id}`)
  } else {
    localStorage.removeItem('teamId')
    router.push(`/wenjuan/project?refresh=${Date.now()}`)
  }
}

onMounted(() => {
  console.log('onMounted')
  loadData()
})
</script>

<style scoped lang="scss">
.project {
  padding: 30px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  .title {
    margin-left: 16px;
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    position: relative;
  }

  .left {
    display: flex;
    align-items: center;
    gap: 20px;
  }
}

.list {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 40px 30px;
  .item {
    position: relative;
    cursor: pointer;
    border: 1px solid var(--border-medium);
    background: var(--bg-primary);
    width: 260px;
    height: 180px;
    border-radius: 12px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

    .title {
      font-size: 16px;
      margin: 16px 0 8px 16px;
      font-weight: 500;
      color: var(--text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .time {
      padding-left: 16px;
      font-size: 13px;
      color: var(--c-gray-500);
    }

    &:hover {
      transform: translateY(-2px);

      border-color: var(--c-brand);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

      .ico-remove {
        opacity: 1;
        transform: scale(1);
      }

      &.add {
        color: var(--c-brand);
        border-color: var(--c-brand);
        // background: color-mix(in srgb, var(--c-brand) 2%, transparent);
      }
    }

    &.add {
      // border: 2px dashed var(--c-gray);
      display: flex;
      justify-content: center;
      align-items: center;
      background: var(--bg-primary);
      color: var(--text-secondary);
      transition: all 0.3s ease;
    }
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    bottom: 0px;
    position: absolute;
    width: 100%;
    padding: 16px;
    // background: linear-gradient(to bottom, transparent, var(--bg-primary) 20%);
  }

  .status {
    display: flex;
    gap: 6px;
  }
}

.ico-remove {
  opacity: 0;
  position: absolute;
  top: -12px;
  right: -12px;
  background: var(--bg-primary);
  border: 1px solid var(--c-brand);
  border-radius: 50%;
  padding: 4px;
  cursor: pointer;
  color: var(--c-brand);
  transform: scale(0.8);
  transition: all 0.3s ease;
  z-index: 2;

  &:hover {
    border-color: var(--c-red);
    color: var(--c-red);
    transform: scale(1.1) !important;
  }
}

.pagination {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}
</style>
