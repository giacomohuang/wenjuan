<template>
  <div class="stat-container">
    <a-card class="stat-header">
      <a-descriptions title="问卷基本信息" bordered>
        <a-descriptions-item label="问卷名称">{{ Q.name }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ dayjs(Q.createdAt).format('YYYY-MM-DD HH:mm:ss') }}</a-descriptions-item>
        <a-descriptions-item label="答卷数量">{{ totalAnswers }}</a-descriptions-item>
        <a-descriptions-item label="发布状态">{{ Q.isPublish ? '已发布' : '未发布' }}</a-descriptions-item>
      </a-descriptions>
    </a-card>

    <div class="stat-content">
      <!-- 图表区域 -->
      <div class="charts-container">
        <a-row :gutter="[16, 16]">
          <template v-for="(item, index) in Q.data" :key="item.id">
            <a-col :span="12" v-if="['SingleChoice', 'MultiChoice', 'Rate', 'NPS'].includes(item.type)">
              <a-card :title="item.title" :loading="loading">
                <!-- 单选题和多选题显示饼图 -->
                <div v-if="['SingleChoice', 'MultiChoice'].includes(item.type)" class="chart-wrapper">
                  <v-chart :option="getPieChartOption(item)" autoresize />
                </div>
                <!-- 评分题和NPS题显示条形图 -->
                <div v-else-if="['Rate', 'NPS'].includes(item.type)" class="chart-wrapper">
                  <v-chart :option="getBarChartOption(item)" autoresize />
                </div>
              </a-card>
            </a-col>
          </template>
        </a-row>
      </div>

      <!-- 明细表格 -->
      <a-card title="答卷明细" class="detail-table">
        <template #extra>
          <a-button type="primary" @click="exportExcel">导出Excel</a-button>
        </template>
        <a-table :columns="columns" :data-source="answerList" :loading="loading" :pagination="pagination" @change="handleTableChange">
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'submitTime'">
              {{ dayjs(record.submitTime).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import * as XLSX from 'xlsx'
import API from '@/api'
import { message } from 'ant-design-vue'

// 注册ECharts组件
use([CanvasRenderer, PieChart, BarChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

const route = useRoute()
const loading = ref(false)
const Q = ref({
  name: '',
  data: [],
  createdAt: null,
  isPublish: false
})

// 统计数据
const totalAnswers = ref(0)
const answerList = ref([])

// 表格配置
const columns = ref([
  {
    title: '提交时间',
    dataIndex: 'submitTime',
    width: 180
  },
  {
    title: '提交IP',
    dataIndex: 'submitIp',
    width: 150
  },
  {
    title: '设备信息',
    dataIndex: 'submitDevice',
    ellipsis: true
  },
  {
    title: '地理位置',
    dataIndex: 'submitLocation',
    width: 200,
    customRender: ({ record }) => {
      const location = record.submitLocation
      if (!location) return '-'
      return `${location.province} ${location.city} ${location.district}`
    }
  }
])

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

// 获取问卷数据和统计信息
const fetchData = async () => {
  try {
    loading.value = true
    const { data } = await API.wenjuan.getStat(route.params.id, pagination.value.current, pagination.value.pageSize)
    Q.value = data.wenjuan
    totalAnswers.value = data.totalAnswers
    answerList.value = data.answerList
    pagination.value.total = data.pagination.total

    // 更新统计数据
    statistics.value = data.statistics
  } catch (error) {
    console.error('获取统计数据失败：', error)
    message.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

// 生成饼图配置
const getPieChartOption = (question) => {
  const data = question.options.map((option) => ({
    name: option.text,
    value: statistics.value?.[question.id]?.[option.id] || 0
  }))

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      type: 'scroll'
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
}

// 生成条形图配置
const getBarChartOption = (question) => {
  const isNPS = question.type === 'NPS'
  const min = isNPS ? 0 : question.minScore
  const max = isNPS ? 10 : question.maxScore
  const data = statistics.value?.[question.id] || Array(max - min + 1).fill(0)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: max - min + 1 }, (_, i) => i + min),
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data,
        type: 'bar',
        barWidth: '60%',
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  }
}

// 处理表格分页变化
const handleTableChange = (pag) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  fetchData()
}

// 导出Excel
const exportExcel = () => {
  // TODO: 实现导出功能
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(answerList.value)
  XLSX.utils.book_append_sheet(wb, ws, '答卷明细')
  XLSX.writeFile(wb, `问卷统计_${Q.value.name}_${dayjs().format('YYYYMMDD')}.xlsx`)
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.stat-container {
  padding: 24px;

  .stat-header {
    margin-bottom: 24px;
  }

  .stat-content {
    .charts-container {
      margin-bottom: 24px;
    }

    .chart-wrapper {
      height: 300px;
    }

    .detail-table {
      margin-bottom: 24px;
    }
  }
}
</style>
