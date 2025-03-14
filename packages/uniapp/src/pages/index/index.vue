<template>
  <view class="main-container">
    <view v-if="loading" class="loading"> loading... </view>
    <template v-else>
      <view v-if="timeLeft && !isOnCoverPage && !isSubmitted" class="time-left">{{ formatTimeLeft }}</view>

      <!-- 封面页面 -->
      <view class="cover-page" v-if="isOnCoverPage">
        <image v-if="Q.settings?.coverImage" :src="OSS_PREFIX + Q.settings.coverImage" mode="aspectFill" class="cover-image" />
        <view class="title">
          {{ Q.name }}
          <text class="description">{{ Q.settings?.description }}</text>
        </view>
        <view class="start-button">
          <button type="primary" size="default" @click="startAnswering">
            开始答题
            <uni-icons type="forward" size="16"></uni-icons>
          </button>
        </view>
      </view>

      <!-- 完成页面 -->
      <view v-if="isSubmitted" class="complete-page">
        <view class="complete-content">
          <view class="complete-icon">
            <uni-icons type="checkmarkempty" size="48" color="#52c41a" />
          </view>
          <view class="complete-message">
            {{ Q.settings?.submitSuccessMessage || '感谢您的参与！' }}
          </view>
        </view>
      </view>
      <!-- 题目页面 -->
      <view v-if="!isSubmitted && !isOnCoverPage" class="question-container">
        <!-- 每页一题模式 -->
        <template v-if="Q.settings?.showOnePerPage">
          <view v-for="(item, index) in visibleQuestions" :key="item.id" v-show="currentPage === index" class="page-item">
            <view class="main">
              <view class="q-item">
                <!-- 题目标题 -->
                <view class="title">
                  <text class="required" v-if="item.required">*</text>
                  <text class="number" v-if="Q.settings?.showQuestionNumber">{{ index + 1 }}. </text>
                  <rich-text :nodes="item.title"></rich-text>
                </view>
                <!-- 题目内容 -->
                <question-content :item="item" />
              </view>
            </view>
          </view>
        </template>

        <!-- 多题模式 -->
        <view v-else>
          <view class="main">
            <view v-for="item in Q.data" :key="item.id" v-show="!isHidden(item.id)" class="q-item">
              <!-- 题目标题 -->
              <view class="title">
                <text class="required" v-if="item.required">*</text>
                <text class="number" v-if="Q.settings?.showQuestionNumber">{{ getQuestionDisplayIndex(item.id) }}. </text>
                <rich-text :nodes="item.title"></rich-text>
              </view>
              <!-- 题目内容 -->
              <question-content :item="item" />
            </view>
          </view>
        </view>
      </view>

      <!-- 分页导航和提交按钮 -->
      <view class="footer" v-if="!isOnCoverPage && !isSubmitted">
        <mp-progress-bar v-if="Q.settings?.showProgress && answeredProgress > 0" :percent="answeredProgress" />

        <view v-if="Q.settings?.showOnePerPage" class="page-navigation">
          <button v-if="showPrevButton" @click="prevQuestion" class="nav-button prev" :disabled="currentPage === 0">
            <uni-icons type="back" size="16"></uni-icons>
            上一题
          </button>
          <button v-if="showNextButton" @click="nextQuestion" class="nav-button next" type="primary">
            下一题
            <uni-icons type="forward" size="16"></uni-icons>
          </button>
          <button v-if="!showNextButton" type="primary" @click="submit" :loading="submitting" :disabled="submitting">提交</button>
        </view>

        <!-- 普通模式下的提交按钮 -->
        <button v-else type="primary" @click="submit" :loading="submitting" :disabled="submitting">提交</button>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, provide, watch } from 'vue'
import { wenjuanApi } from '../../api/wenjuan'
import QuestionContent from '../../components/QuestionContent.vue'
import MpProgressBar from '../../components/MpProgressBar.vue'

const Q = ref({
  data: [],
  settings: {},
  name: ''
})
const WENJUAN_ID = '67c7f4c4ec60ef5a0431d1d4'
const loading = ref(true)
const answers = ref({})
provide('answers', answers)
console.log('mai', answers.value)
const submitting = ref(false)
const currentTime = ref('')
const OSS_PREFIX = uni.getStorageSync('VITE_UPLOAD_URL_PREFIX')
const isSubmitted = ref(false)
const timeUpdateInterval = ref(null)

// 分页相关
const currentPage = ref(-1)

// 获取可见的题目列表
const visibleQuestions = computed(() => {
  return Q.value.data.filter((q) => !isHidden(q.id))
})

// 获取题目的显示序号（1-based）
const getQuestionDisplayIndex = (questionId) => {
  return visibleQuestions.value.findIndex((q) => q.id === questionId) + 1
}

// 当前显示的题目
const currentQuestion = computed(() => {
  if (!Q.value.settings?.showOnePerPage) return null
  if (currentPage.value === -1) return null
  return visibleQuestions.value[currentPage.value]
})

// 是否显示上一页按钮
const showPrevButton = computed(() => {
  return Q.value.settings?.showOnePerPage && currentPage.value > 0
})

// 是否显示下一页按钮
const showNextButton = computed(() => {
  return Q.value.settings?.showOnePerPage && currentPage.value < visibleQuestions.value.length - 1
})

// 是否在封面页
const isOnCoverPage = computed(() => {
  return currentPage.value === -1
})

// 检查问卷是否在收集时间范围内
const isInCollectTime = computed(() => {
  if (!Q.value.settings?.collectTime?.[0] || !Q.value.settings?.collectTime?.[1]) return true
  const now = new Date().getTime()
  const start = new Date(Q.value.settings.collectTime[0]).getTime()
  const end = new Date(Q.value.settings.collectTime[1]).getTime()
  return now >= start && now <= end
})

// 计算答题进度
const answeredProgress = computed(() => {
  const totalQuestions = Q.value.data.filter((q) => !isHidden(q.id)).length
  if (totalQuestions === 0) return 0

  const answeredQuestions = Q.value.data.filter((q) => !isHidden(q.id) && isQuestionAnswered(q.id)).length
  return Math.round((answeredQuestions / totalQuestions) * 100)
})

// 格式化剩余时间
const formatTimeLeft = computed(() => {
  if (!timeLeft.value) return ''
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// 时间限制相关
const timeLeft = ref(null)
const timer = ref(null)
const logicStates = ref({})

// 初始化答题计时器
const initTimer = () => {
  // 已在封面页或没有设置时间限制时不启动计时器
  if (isOnCoverPage.value || !Q.value.settings?.timeLimit) return

  // 已有计时器在运行时不重复启动
  if (timer.value) return

  timeLeft.value = Q.value.settings.timeLimit * 60
  timer.value = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      clearInterval(timer.value)
      timer.value = null
      uni.showToast({
        title: '答题时间已到，系统将自动提交',
        icon: 'none'
      })
      submit()
    }
  }, 1000)
}

// 清除计时器
const clearQuestionTimer = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

// 开始答题
const startAnswering = () => {
  currentPage.value = 0
  initTimer()
}

// 上一题
const prevQuestion = () => {
  if (currentPage.value > 0) {
    currentPage.value--
  }
}

// 下一题
const nextQuestion = () => {
  // 检查当前题目是否必答但未回答
  const currentQ = currentQuestion.value
  if (currentQ && currentQ.required && !isQuestionAnswered(currentQ.id)) {
    // 构建详细的错误提示
    let errorTitle = `此题为必答题`

    // 检查是否是多项题目，需要找出具体哪个子项未填写
    if (currentQ.type === 'FillBlank' && currentQ.multiMode) {
      // 对于多空格填空题，找出未填写的具体子项
      for (let i = 0; i < currentQ.options.length; i++) {
        const opt = currentQ.options[i]
        if (opt.required) {
          const optValue = answers.value[currentQ.id + '_' + opt.id]
          if (!optValue || optValue.trim() === '') {
            // 找到第一个未填写的必填子项
            const subItemText = opt.text?.replace(/<[^>]+>/g, '') || `第${i + 1}项`
            errorTitle += `，请填写：${subItemText}`
            break
          }
        }
      }
    } else if (currentQ.type === 'SingleChoice') {
      // 如果尚未选择选项
      if (!answers.value[currentQ.id]) {
        errorTitle += `，请选择一个选项`
      } else {
        // 对于单选题，检查是否有未填写的补充内容
        const selectedOption = currentQ.options.find((opt) => opt.id === answers.value[currentQ.id])
        if (selectedOption?.fill?.show && selectedOption?.fill?.required) {
          const fillValue = answers.value[currentQ.id + '_fill']
          if (!fillValue || fillValue.trim() === '') {
            const optText = selectedOption.text?.replace(/<[^>]+>/g, '') || '所选选项'
            errorTitle += `，请填写"${optText}"的补充内容`
          }
        }
      }
    } else if (currentQ.type === 'MultiChoice') {
      // 如果尚未选择任何选项
      if (!answers.value[currentQ.id] || !Array.isArray(answers.value[currentQ.id]) || answers.value[currentQ.id].length === 0) {
        errorTitle += `，请至少选择一个选项`
      } else {
        // 检查是否满足最小选择数量要求
        const selectedCount = answers.value[currentQ.id].length
        if (currentQ.minRange && selectedCount < currentQ.minRange) {
          errorTitle += `，请至少选择${currentQ.minRange}项`
        }
        // 检查是否超出最大选择数量限制
        else if (currentQ.maxRange && selectedCount > currentQ.maxRange) {
          errorTitle += `，最多只能选择${currentQ.maxRange}项`
        }
        // 检查选中项的必填补充内容
        else {
          // 对于多选题，检查是否有未填写的补充内容
          for (const optId of answers.value[currentQ.id]) {
            const option = currentQ.options.find((opt) => opt.id === optId)
            if (option?.fill?.show && option?.fill?.required) {
              const fillValue = answers.value[currentQ.id + '_' + optId]
              if (!fillValue || fillValue.trim() === '') {
                const optText = option.text?.replace(/<[^>]+>/g, '') || '所选选项'
                errorTitle += `，请填写"${optText}"的补充内容`
                break
              }
            }
          }
        }
      }
    }

    uni.showToast({
      title: errorTitle,
      icon: 'none',
      duration: 2500
    })
    return
  }

  // 检查非必填的多选题是否符合minRange和maxRange要求（如果已选择至少一项）
  if (currentQ && !currentQ.required && currentQ.type === 'MultiChoice') {
    if (answers.value[currentQ.id] && Array.isArray(answers.value[currentQ.id]) && answers.value[currentQ.id].length > 0) {
      const selectedCount = answers.value[currentQ.id].length
      let errorMessage = null

      // 检查最小选择数量
      if (currentQ.minRange && selectedCount < currentQ.minRange) {
        errorMessage = `您已选择${selectedCount}项，请至少选择${currentQ.minRange}项`
      }
      // 检查最大选择数量
      else if (currentQ.maxRange && selectedCount > currentQ.maxRange) {
        errorMessage = `您已选择${selectedCount}项，最多只能选择${currentQ.maxRange}项`
      }
      // 检查选中项的必填补充内容
      else {
        for (const optId of answers.value[currentQ.id]) {
          const option = currentQ.options.find((opt) => opt.id === optId)
          if (option?.fill?.show && option?.fill?.required) {
            const fillValue = answers.value[currentQ.id + '_' + optId]
            if (!fillValue || fillValue.trim() === '') {
              const optText = option.text?.replace(/<[^>]+>/g, '') || '所选选项'
              errorMessage = `请填写"${optText}"的补充内容`
              break
            }
          }
        }
      }

      if (errorMessage) {
        uni.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 2500
        })
        return
      }
    }
  }

  // 处理逻辑跳转
  if (currentQ && currentQ.logic?.conditions) {
    // 更新逻辑状态
    calculateLogic()

    // 查找是否有跳转逻辑
    const jumpCondition = currentQ.logic.conditions.find((condition) => condition.toPortId === 'jump' && calculateOutputState(currentQ, condition.fromPortId))

    if (jumpCondition) {
      // 获取跳转目标题目的索引
      const targetIndex = visibleQuestions.value.findIndex((q) => q.id === jumpCondition.toLogicId)
      if (targetIndex > -1) {
        currentPage.value = targetIndex
        return
      }
    }
  }

  if (currentPage.value < visibleQuestions.value.length - 1) {
    currentPage.value++
  }
}

// 检查提交次数限制
const checkSubmitLimit = () => {
  if (!Q.value.settings?.submitLimitType || Q.value.settings?.submitLimitType === 'none') return true

  // TODO: 这里需要从后端获取用户的提交次数
  const userSubmitCount = 0

  switch (Q.value.settings?.submitLimitType) {
    case 'once':
      return userSubmitCount === 0
    case 'daily':
    case 'weekly':
    case 'monthly':
      return userSubmitCount < Q.value.settings?.submitLimitCount
    default:
      return true
  }
}

// 更新当前时间
const updateCurrentTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 应用主题色
const applyThemeColor = () => {
  if (!Q.value.settings?.themeColor) return
  // document.documentElement.style.setProperty('--c-brand', Q.settings.themeColor)
}

// 是否隐藏题目
const isHidden = (id) => {
  return logicStates.value[id]?.hidden || false
}

// 检查选项是否被选中
const isOptionSelected = (questionId, optionId) => {
  if (!answers.value[questionId]) return false

  const question = Q.value.data.find((q) => q.id === questionId)
  if (!question) return false

  if (question.type === 'MultiChoice') {
    return answers.value[questionId]?.includes(optionId)
  } else {
    return answers.value[questionId] === optionId
  }
}

// 检查题目是否已答
const isQuestionAnswered = (questionId) => {
  const question = Q.value.data.find((q) => q.id === questionId)
  if (!question) return false

  switch (question.type) {
    case 'FillBlank':
      if (question.multiMode) {
        // 多空格模式，检查每个必填子项
        return question.options.every((opt) => {
          // 如果是必填项，检查是否有值
          if (opt.required) {
            return answers.value[question.id + '_' + opt.id] !== undefined && answers.value[question.id + '_' + opt.id] !== null && answers.value[question.id + '_' + opt.id].trim() !== ''
          }
          return true // 非必填项直接返回true
        })
      } else {
        // 单空格模式
        return answers.value[question.id] !== undefined && answers.value[question.id] !== null && answers.value[question.id].trim() !== ''
      }

    case 'SingleChoice':
      // 必须选择一个选项
      if (!answers.value[question.id]) return false

      // 检查所选选项是否有需要填写的内容
      const selectedOption = question.options.find((opt) => opt.id === answers.value[question.id])
      if (selectedOption?.fill?.show && selectedOption?.fill?.required) {
        return answers.value[question.id + '_fill'] !== undefined && answers.value[question.id + '_fill'] !== null && answers.value[question.id + '_fill'].trim() !== ''
      }
      return true

    case 'MultiChoice':
      // 如果是非必填题且没有选择任何选项，直接返回true
      if (!question.required && (!answers.value[question.id] || !Array.isArray(answers.value[question.id]) || answers.value[question.id].length === 0)) {
        return true
      }

      // 必须至少选择一个选项（必填题）或者已选择了至少一个选项（非必填题）
      if (!answers.value[question.id] || !Array.isArray(answers.value[question.id]) || answers.value[question.id].length === 0) {
        return false
      }

      // 检查选择数量是否在范围内
      const selectedCount = answers.value[question.id].length

      // 检查最小选择数量
      if (question.minRange && selectedCount < question.minRange) {
        return false
      }

      // 检查最大选择数量
      if (question.maxRange && selectedCount > question.maxRange) {
        return false
      }

      // 检查所有选中的选项是否都完成了必填的填空内容
      const selectedOptions = question.options.filter((opt) => answers.value[question.id].includes(opt.id) && opt.fill?.show && opt.fill?.required)

      return selectedOptions.every((opt) => answers.value[question.id + '_' + opt.id] !== undefined && answers.value[question.id + '_' + opt.id] !== null && answers.value[question.id + '_' + opt.id].trim() !== '')

    case 'ImageChoice':
      return answers.value[question.id] !== undefined && answers.value[question.id] !== null

    case 'Rate':
    case 'NPS':
      return answers.value[question.id] !== undefined && answers.value[question.id] !== null

    default:
      return false
  }
}

// 检查评分范围
const checkScoreRange = (question, rangeId) => {
  const answer = answers.value[question.id]
  if (answer === undefined || answer === null) return false

  const range = question.scoreRanges?.find((r) => r.id === rangeId)
  if (!range) return false

  return answer >= range.min && answer <= range.max
}

// 计算输出端口的状态
const calculateOutputState = (question, portId) => {
  switch (portId) {
    case 'show':
      return !logicStates.value[question.id]?.hidden
    case 'hide':
      return logicStates.value[question.id]?.hidden
    case 'answered':
      return isQuestionAnswered(question.id)
    case 'unanswered':
      return !isQuestionAnswered(question.id)
    default:
      // 处理选项和评分范围
      if (['SingleChoice', 'MultiChoice', 'ImageChoice'].includes(question.type)) {
        const option = question.options.find((opt) => opt.id === portId)
        if (option) {
          const isSelected = isOptionSelected(question.id, portId)
          return option.select === false ? !isSelected : isSelected
        }
      } else if (['Rate', 'NPS'].includes(question.type)) {
        return checkScoreRange(question, portId)
      }
      return false
  }
}

// 处理输入端口的逻辑
const processInputPort = (fromQuestion, toQuestion, portId, condition) => {
  if (!logicStates.value[toQuestion.id]) {
    logicStates.value[toQuestion.id] = { hidden: false }
  }

  switch (portId) {
    case 'jump':
      if (condition) {
        // 获取from和to题目的索引
        const fromIndex = Q.value.data.findIndex((q) => q.id === fromQuestion.id)
        const toIndex = Q.value.data.findIndex((q) => q.id === toQuestion.id)
        // 隐藏中间的所有题目
        for (let i = fromIndex + 1; i < toIndex; i++) {
          const id = Q.value.data[i].id
          if (!logicStates.value[id]) {
            logicStates.value[id] = { hidden: false }
          }
          logicStates.value[id].hidden = true
        }
      }
      break
    case 'show':
      logicStates.value[toQuestion.id].hidden = !condition
      break
    case 'hide':
      logicStates.value[toQuestion.id].hidden = condition
      break
  }
}

// 计算所有逻辑
const calculateLogic = () => {
  // 重置所有逻辑状态
  logicStates.value = {}

  // 按顺序处理每个题目的逻辑
  Q.value.data.forEach((question) => {
    if (!question.logic?.conditions) return

    question.logic.conditions.forEach((condition) => {
      const toQuestion = Q.value.data.find((q) => q.id === condition.toLogicId)
      if (!toQuestion) return

      // 计算输出端口状态
      const outputState = calculateOutputState(question, condition.fromPortId)

      // 处理输入端口逻辑
      processInputPort(question, toQuestion, condition.toPortId, outputState)
    })
  })

  // 处理连锁反应
  let changed = true
  const maxIterations = Q.value.data.length * 2 // 防止无限循环
  let iterations = 0

  while (changed && iterations < maxIterations) {
    changed = false
    iterations++

    Q.value.data.forEach((question) => {
      if (!question.logic?.conditions) return

      const oldState = JSON.stringify(logicStates.value[question.id])

      question.logic.conditions.forEach((condition) => {
        const toQuestion = Q.value.data.find((q) => q.id === condition.toLogicId)
        if (!toQuestion) return

        const outputState = calculateOutputState(question, condition.fromPortId)
        processInputPort(question, toQuestion, condition.toPortId, outputState)
      })

      const newState = JSON.stringify(logicStates.value[question.id])
      if (oldState !== newState) {
        changed = true
      }
    })
  }
}

// 提交答案
const submit = async () => {
  // 防止重复提交
  if (submitting.value) return

  // 检查回答次数限制
  if (!checkSubmitLimit()) {
    uni.showToast({
      title: '您已超过最大提交次数限制',
      icon: 'none'
    })
    return
  }

  // 验证所有必填题
  const unansweredQuestions = []

  // 按照显示顺序收集未答问题
  Q.value.data.forEach((question) => {
    // 跳过被隐藏的题目
    if (isHidden(question.id)) return

    // 如果是必填题且未回答完整
    if (question.required && !isQuestionAnswered(question.id)) {
      unansweredQuestions.push(question)
    }

    // 检查非必填的多选题是否符合minRange和maxRange要求（如果已选择至少一项）
    if (!question.required && question.type === 'MultiChoice' && answers.value[question.id] && Array.isArray(answers.value[question.id]) && answers.value[question.id].length > 0) {
      const selectedCount = answers.value[question.id].length

      // 检查最小选择数量
      if (question.minRange && selectedCount < question.minRange) {
        unansweredQuestions.push({ ...question, invalidReason: 'minRange' })
      }
      // 检查最大选择数量
      else if (question.maxRange && selectedCount > question.maxRange) {
        unansweredQuestions.push({ ...question, invalidReason: 'maxRange' })
      }
      // 检查必填的补充内容
      else {
        const missingFillOption = question.options.find((opt) => answers.value[question.id].includes(opt.id) && opt.fill?.show && opt.fill?.required && (!answers.value[question.id + '_' + opt.id] || answers.value[question.id + '_' + opt.id].trim() === ''))

        if (missingFillOption) {
          unansweredQuestions.push({ ...question, invalidReason: 'fillRequired', missingOption: missingFillOption })
        }
      }
    }
  })

  // 如果有未回答的必填题或不满足条件的题目
  if (unansweredQuestions.length > 0) {
    const firstQuestion = unansweredQuestions[0]
    // 获取题目序号
    const questionIndex = getQuestionDisplayIndex(firstQuestion.id)

    // 构建错误提示
    let errorTitle = `请完成第${questionIndex}题`

    if (firstQuestion.invalidReason === 'minRange') {
      const selectedCount = answers.value[firstQuestion.id].length
      errorTitle = `第${questionIndex}题：您已选择${selectedCount}项，请至少选择${firstQuestion.minRange}项`
    } else if (firstQuestion.invalidReason === 'maxRange') {
      const selectedCount = answers.value[firstQuestion.id].length
      errorTitle = `第${questionIndex}题：您已选择${selectedCount}项，最多只能选择${firstQuestion.maxRange}项`
    } else if (firstQuestion.invalidReason === 'fillRequired' && firstQuestion.missingOption) {
      const optText = firstQuestion.missingOption.text?.replace(/<[^>]+>/g, '') || '所选选项'
      errorTitle = `第${questionIndex}题：请填写"${optText}"的补充内容`
    }
    // 检查是否是多项题目，需要找出具体哪个子项未填写
    else if (firstQuestion.type === 'FillBlank' && firstQuestion.multiMode) {
      // 对于多空格填空题，找出未填写的具体子项
      for (let i = 0; i < firstQuestion.options.length; i++) {
        const opt = firstQuestion.options[i]
        if (opt.required) {
          const optValue = answers.value[firstQuestion.id + '_' + opt.id]
          if (!optValue || optValue.trim() === '') {
            // 找到第一个未填写的必填子项
            const subItemText = opt.text?.replace(/<[^>]+>/g, '') || `第${i + 1}项`
            errorTitle += `：${subItemText}`
            break
          }
        }
      }
    } else if (firstQuestion.type === 'SingleChoice') {
      // 对于单选题，检查是否有未填写的补充内容
      if (answers.value[firstQuestion.id]) {
        const selectedOption = firstQuestion.options.find((opt) => opt.id === answers.value[firstQuestion.id])
        if (selectedOption?.fill?.show && selectedOption?.fill?.required) {
          const fillValue = answers.value[firstQuestion.id + '_fill']
          if (!fillValue || fillValue.trim() === '') {
            const optText = selectedOption.text?.replace(/<[^>]+>/g, '') || '所选选项'
            errorTitle += `：${optText}的补充内容`
          }
        }
      } else {
        errorTitle += `：请选择一个选项`
      }
    } else if (firstQuestion.type === 'MultiChoice') {
      // 对于多选题，先检查是否选择了任何选项
      if (!answers.value[firstQuestion.id] || !Array.isArray(answers.value[firstQuestion.id]) || answers.value[firstQuestion.id].length === 0) {
        errorTitle += `：请至少选择一个选项`
      }
      // 检查minRange
      else if (firstQuestion.minRange && answers.value[firstQuestion.id].length < firstQuestion.minRange) {
        errorTitle += `：请至少选择${firstQuestion.minRange}项`
      }
      // 检查maxRange
      else if (firstQuestion.maxRange && answers.value[firstQuestion.id].length > firstQuestion.maxRange) {
        errorTitle += `：最多只能选择${firstQuestion.maxRange}项`
      }
      // 检查选中选项的补充内容
      else {
        for (const optId of answers.value[firstQuestion.id]) {
          const option = firstQuestion.options.find((opt) => opt.id === optId)
          if (option?.fill?.show && option?.fill?.required) {
            const fillValue = answers.value[firstQuestion.id + '_' + optId]
            if (!fillValue || fillValue.trim() === '') {
              const optText = option.text?.replace(/<[^>]+>/g, '') || '所选选项'
              errorTitle += `：${optText}的补充内容`
              break
            }
          }
        }
      }
    }

    // 显示错误提示
    uni.showToast({
      title: errorTitle,
      icon: 'none',
      duration: 2500
    })

    // 如果是每页一题模式，跳转到第一个未答题页面
    if (Q.value.settings?.showOnePerPage) {
      const index = visibleQuestions.value.findIndex((q) => q.id === firstQuestion.id)
      if (index > -1) {
        currentPage.value = index
      }
    }

    return
  }

  // 开始提交
  submitting.value = true

  try {
    // 处理答案数据，剔除隐藏题和无效数据
    const answersData = {}
    Object.keys(answers.value).forEach((key) => {
      // 如果是主键（不包含下划线），则检查是否是隐藏题
      if (!key.includes('_')) {
        const question = Q.value.data.find((q) => q.id === key)
        // 如果题目不存在或被隐藏，跳过
        if (!question || isHidden(question.id)) return
      }

      // 添加到要提交的数据中
      answersData[key] = answers.value[key]
    })

    // 添加元数据
    const submitData = {
      wenjuanId: WENJUAN_ID,
      answers: answersData,
      timeSpent: Q.value.settings?.timeLimit ? Q.value.settings.timeLimit * 60 - timeLeft.value : null,
      submitTime: new Date().toISOString()
    }

    // 调用API提交数据
    await wenjuanApi.submit(submitData)

    // 清除计时器
    clearQuestionTimer()

    // 显示成功提交页面
    isSubmitted.value = true
  } catch (error) {
    console.error('提交失败', error)
    uni.showToast({
      title: '提交失败，请重试',
      icon: 'none'
    })
  } finally {
    submitting.value = false
  }
}

// 监听答案变化
watch(
  answers,
  () => {
    calculateLogic()
  },
  { deep: true }
)

// 监听页面变化
watch(
  currentPage,
  (newPage) => {
    // 如果从封面页切换到题目页，并且是每页一题模式，开始计时
    if (newPage === 0 && Q.value.settings?.showOnePerPage && !timer.value) {
      initTimer()
    }
  },
  { immediate: true }
)

// 触摸滑动相关变量
const touchStartX = ref(0)
const touchEndX = ref(0)
const MIN_SWIPE_DISTANCE = 100

// 生命周期钩子
onMounted(async () => {
  try {
    loading.value = true
    const data = await wenjuanApi.getDetail(WENJUAN_ID)
    Q.value = data
  } catch (error) {
    uni.showToast({
      title: '获取问卷失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }

  updateCurrentTime()
  timeUpdateInterval.value = setInterval(updateCurrentTime, 60000)

  if (!isOnCoverPage.value) {
    initTimer()
  }

  if (!isInCollectTime.value) {
    uni.showToast({
      title: '当前不在问卷收集时间范围内',
      icon: 'none'
    })
  }

  applyThemeColor()
  calculateLogic()
})

onUnmounted(() => {
  if (timeUpdateInterval.value) clearInterval(timeUpdateInterval.value)
  clearQuestionTimer()
})
</script>

<style lang="scss">
.main-container {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  background: v-bind('Q.settings.bgColor');
}

.time-left {
  position: fixed;
  top: 40rpx;
  right: 40rpx;
  font-size: 24rpx;
  color: #ffffff;
  background: $uni-color-primary;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  z-index: 9999;
}

.main {
  flex-grow: 1;
  height: calc(100vh - 250rpx);
  box-sizing: border-box;
  overflow-y: auto;
}

.q-item {
  padding: 0 40rpx;
  border-radius: 20rpx;
  background-color: rgba(255, 255, 255, 0.8);
  margin: 80rpx 0;

  .title {
    font-size: 32rpx;
    margin-bottom: 16rpx;
    padding: 20rpx 0;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
  }
}

.required {
  color: #ff4d4f;
  margin-right: 8rpx;
}

.number {
  // color: #999999;
  margin-right: 20rpx;
}

.footer {
  flex-shrink: 0;
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 250rpx;
  background: #ffffff;
  padding: 40rpx 80rpx 0 80rpx;
  box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
}

.page-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .nav-button {
    min-width: 200rpx;
  }
}

.cover-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
  background: v-bind('Q.settings.coverBgColor');
  overflow: hidden;

  .cover-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .title {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    top: 20%;
    font-size: 48rpx;
    font-weight: 600;
    padding: 0 80rpx;
    box-sizing: border-box;
  }

  .description {
    font-size: 28rpx;
    font-weight: 400;
    color: v-bind('Q.settings.coverTextColor');
    line-height: 1.4;
    margin-top: 40rpx;
  }

  .start-button {
    position: absolute;
    padding: 48rpx;
    text-align: center;
    width: 100%;
    bottom: 20%;
    box-sizing: border-box;
  }
}

.complete-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 40rpx;
}

.complete-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .complete-icon {
    margin-bottom: 48rpx;
  }

  .complete-message {
    font-size: 36rpx;
    color: #333333;
    line-height: 1.6;
    text-align: center;
  }
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 28rpx;
  color: #999999;
}

.question-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200rpx);
  overflow-y: auto;
}

.page-item {
  position: absolute;
  width: 100%;
  height: 100%;
}

.required-tip {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #ff4d4f;
  font-size: 24rpx;
  margin-top: 16rpx;
  padding: 8rpx 0;
}

/* 添加导航样式 */
.demo-nav {
  padding: 20rpx;
  background-color: #f8f8f8;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 999;
}
</style>
