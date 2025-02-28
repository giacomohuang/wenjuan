<template>
  <view class="main-container">
    <view v-if="loading" class="loading"> loading... </view>
    <template v-else>
      <view v-if="timeLeft && !isOnCoverPage && !isSubmitted" class="time-left">{{ formatTimeLeft }}</view>
      <!-- 完成页面 -->
      <view v-if="isSubmitted" class="complete-page">
        <view class="complete-content">
          <view class="complete-icon">
            <uni-icons type="checkmarkempty" size="48" color="#52c41a" />
          </view>
          <view class="complete-message">
            {{ Q.settings?.submitSuccessMessage || "感谢您的参与！" }}
          </view>
        </view>
      </view>

      <view class="cover-page" v-if="currentPage === 1">
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

      <view v-else class="swiper" :current="currentPage + 1" @change="handleSwiperChange" :disable-touch="!Q.settings?.showOnePerPage">
        <!-- 题目页面 -->
        <template v-if="Q.settings?.showOnePerPage">
          <view v-for="(item, index) in visibleQuestions" :key="item.id">
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

        <!-- 普通模式 -->
        <view v-else>
          <view class="main">
            <view v-for="item in Q.data" :key="item.id" v-show="!isHidden(item.id)" class="q-item gap">
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
      <view class="footer" :class="{ 'one-per-page': Q.settings?.showOnePerPage }" v-if="!isOnCoverPage && !isSubmitted">
        <view class="progress-bar" v-if="Q.settings?.showProgress">
          <text class="progress-text">答题进度 {{ answeredProgress }}%</text>
          <!-- <uni-progress :percent="answeredProgress" size="small" /> -->
        </view>

        <view v-if="Q.settings?.showOnePerPage" class="page-navigation">
          <button v-if="showPrevButton" @click="prevQuestion" class="nav-button prev" :disabled="currentPage === 0">上一题</button>
          <text class="page-indicator">{{ currentPage + 1 }} / {{ visibleQuestions.length }}</text>
          <button v-if="showNextButton" @click="nextQuestion" class="nav-button next" type="primary">下一题</button>
          <button v-if="!showNextButton" type="primary" @click="submit" :loading="submitting" :disabled="submitting">提交</button>
        </view>

        <!-- 普通模式下的提交按钮 -->
        <button v-else type="primary" @click="submit" :loading="submitting" :disabled="submitting">提交</button>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, provide, watch } from "vue";
import { wenjuanApi } from "../../api/wenjuan";
import QuestionContent from "../../components/QuestionContent.vue";

const Q = ref({
  data: [],
  settings: {},
  name: "",
});
const loading = ref(true);
const answers = ref({});
provide("answers", answers);
const submitting = ref(false);
const currentTime = ref("");
const OSS_PREFIX = uni.getStorageSync("VITE_UPLOAD_URL_PREFIX");
const isSubmitted = ref(false);

// 分页相关
const currentPage = ref(-1);

// 获取可见的题目列表
const visibleQuestions = computed(() => {
  return Q.value.data.filter((q) => !isHidden(q.id));
});

// 获取题目的显示序号（1-based）
const getQuestionDisplayIndex = (questionId) => {
  return visibleQuestions.value.findIndex((q) => q.id === questionId) + 1;
};

// 当前显示的题目
const currentQuestion = computed(() => {
  if (!Q.value.settings?.showOnePerPage) return null;
  if (currentPage.value === -1) return null;
  return visibleQuestions.value[currentPage.value];
});

// 是否显示上一页按钮
const showPrevButton = computed(() => {
  return Q.value.settings?.showOnePerPage && currentPage.value > -1;
});

// 是否显示下一页按钮
const showNextButton = computed(() => {
  return Q.value.settings?.showOnePerPage && currentPage.value < visibleQuestions.value.length - 1;
});

// 是否在封面页
const isOnCoverPage = computed(() => {
  return currentPage.value === -1;
});

// 检查问卷是否在收集时间范围内
const isInCollectTime = computed(() => {
  if (!Q.value.settings?.collectTime?.[0] || !Q.value.settings?.collectTime?.[1]) return true;
  const now = new Date().getTime();
  const start = new Date(Q.value.settings.collectTime[0]).getTime();
  const end = new Date(Q.value.settings.collectTime[1]).getTime();
  return now >= start && now <= end;
});

// 计算答题进度
const answeredProgress = computed(() => {
  const totalQuestions = Q.value.data.filter((q) => !isHidden(q.id)).length;
  if (totalQuestions === 0) return 0;

  const answeredQuestions = Q.value.data.filter((q) => !isHidden(q.id) && isQuestionAnswered(q.id)).length;
  return Math.round((answeredQuestions / totalQuestions) * 100);
});

// 格式化剩余时间
const formatTimeLeft = computed(() => {
  if (!timeLeft.value) return "";
  const minutes = Math.floor(timeLeft.value / 60);
  const seconds = timeLeft.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
});

// 时间限制相关
const timeLeft = ref(null);
const timer = ref(null);
const logicStates = ref({});

// 开始答题
const startAnswering = () => {
  currentPage.value = 0;
  initTimer();
};

// 上一题
const prevQuestion = () => {
  if (currentPage.value > 0) {
    currentPage.value--;
  }
};

// 下一题
const nextQuestion = () => {
  if (currentPage.value < visibleQuestions.value.length - 1) {
    currentPage.value++;
  }
};

// 检查提交次数限制
const checkSubmitLimit = () => {
  if (!Q.value.settings?.submitLimitType || Q.value.settings?.submitLimitType === "none") return true;

  // TODO: 这里需要从后端获取用户的提交次数
  const userSubmitCount = 0;

  switch (Q.value.settings?.submitLimitType) {
    case "once":
      return userSubmitCount === 0;
    case "daily":
    case "weekly":
    case "monthly":
      return userSubmitCount < Q.value.settings?.submitLimitCount;
    default:
      return true;
  }
};

// 初始化答题计时器
const initTimer = () => {
  if (isOnCoverPage.value || !Q.value.settings?.timeLimit) return;

  timeLeft.value = Q.value.settings.timeLimit * 60;
  timer.value = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      clearInterval(timer.value);
      uni.showToast({
        title: "答题时间已到，系统将自动提交",
        icon: "none",
      });
      submit();
    }
  }, 1000);
};

// 更新当前时间
const updateCurrentTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
};

// 应用主题色
const applyThemeColor = () => {
  if (!Q.value.settings?.themeColor) return;
  // document.documentElement.style.setProperty('--c-brand', Q.settings.themeColor)
};

// 是否隐藏题目
const isHidden = (id) => {
  return logicStates.value[id]?.hidden || false;
};

// 检查选项是否被选中
const isOptionSelected = (questionId, optionId) => {
  if (!answers.value[questionId]) return false;

  const question = Q.value.data.find((q) => q.id === questionId);
  if (!question) return false;

  if (question.type === "MultiChoice") {
    return answers.value[questionId]?.includes(optionId);
  } else {
    return answers.value[questionId] === optionId;
  }
};

// 检查题目是否已答
const isQuestionAnswered = (questionId) => {
  const answer = answers.value[questionId];
  if (!answer) return false;

  const question = Q.value.data.find((q) => q.id === questionId);
  if (!question) return false;

  switch (question.type) {
    case "MultiChoice":
      return Array.isArray(answer) && answer.length > 0;
    case "SingleChoice":
    case "ImageChoice":
      return answer !== undefined && answer !== null;
    case "FillBlank":
      if (question.multiMode) {
        return Object.keys(answers.value).some((key) => key.startsWith(questionId + "_") && answers.value[key]);
      }
      return !!answer;
    case "Rate":
    case "NPS":
      return answer !== undefined && answer !== null;
    default:
      return false;
  }
};

// 检查评分范围
const checkScoreRange = (question, rangeId) => {
  const answer = answers.value[question.id];
  if (answer === undefined || answer === null) return false;

  const range = question.scoreRanges?.find((r) => r.id === rangeId);
  if (!range) return false;

  return answer >= range.min && answer <= range.max;
};

// 计算输出端口的状态
const calculateOutputState = (question, portId) => {
  switch (portId) {
    case "show":
      return !logicStates.value[question.id]?.hidden;
    case "hide":
      return logicStates.value[question.id]?.hidden;
    case "answered":
      return isQuestionAnswered(question.id);
    case "unanswered":
      return !isQuestionAnswered(question.id);
    default:
      // 处理选项和评分范围
      if (["SingleChoice", "MultiChoice", "ImageChoice"].includes(question.type)) {
        const option = question.options.find((opt) => opt.id === portId);
        if (option) {
          const isSelected = isOptionSelected(question.id, portId);
          return option.select === false ? !isSelected : isSelected;
        }
      } else if (["Rate", "NPS"].includes(question.type)) {
        return checkScoreRange(question, portId);
      }
      return false;
  }
};

// 处理输入端口的逻辑
const processInputPort = (fromQuestion, toQuestion, portId, condition) => {
  if (!logicStates.value[toQuestion.id]) {
    logicStates.value[toQuestion.id] = { hidden: false };
  }

  switch (portId) {
    case "jump":
      if (condition) {
        // 获取from和to题目的索引
        const fromIndex = Q.value.data.findIndex((q) => q.id === fromQuestion.id);
        const toIndex = Q.value.data.findIndex((q) => q.id === toQuestion.id);
        // 隐藏中间的所有题目
        for (let i = fromIndex + 1; i < toIndex; i++) {
          const id = Q.value.data[i].id;
          if (!logicStates.value[id]) {
            logicStates.value[id] = { hidden: false };
          }
          logicStates.value[id].hidden = true;
        }
      }
      break;
    case "show":
      logicStates.value[toQuestion.id].hidden = !condition;
      break;
    case "hide":
      logicStates.value[toQuestion.id].hidden = condition;
      break;
  }
};

// 计算所有逻辑
const calculateLogic = () => {
  // 重置所有逻辑状态
  logicStates.value = {};

  // 按顺序处理每个题目的逻辑
  Q.value.data.forEach((question) => {
    if (!question.logic?.conditions) return;

    question.logic.conditions.forEach((condition) => {
      const toQuestion = Q.value.data.find((q) => q.id === condition.toLogicId);
      if (!toQuestion) return;

      // 计算输出端口状态
      const outputState = calculateOutputState(question, condition.fromPortId);

      // 处理输入端口逻辑
      processInputPort(question, toQuestion, condition.toPortId, outputState);
    });
  });

  // 处理连锁反应
  let changed = true;
  const maxIterations = Q.value.data.length * 2; // 防止无限循环
  let iterations = 0;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    Q.value.data.forEach((question) => {
      if (!question.logic?.conditions) return;

      const oldState = JSON.stringify(logicStates.value[question.id]);

      question.logic.conditions.forEach((condition) => {
        const toQuestion = Q.value.data.find((q) => q.id === condition.toLogicId);
        if (!toQuestion) return;

        const outputState = calculateOutputState(question, condition.fromPortId);
        processInputPort(question, toQuestion, condition.toPortId, outputState);
      });

      const newState = JSON.stringify(logicStates.value[question.id]);
      if (oldState !== newState) {
        changed = true;
      }
    });
  }
};

// 提交答案
const submit = async () => {
  if (!isInCollectTime.value) {
    uni.showToast({
      title: "当前不在问卷收集时间范围内",
      icon: "none",
    });
    return;
  }

  // 检查提交次数限制
  if (!checkSubmitLimit()) {
    uni.showToast({
      title: "已超出允许的提交次数限制",
      icon: "none",
    });
    return;
  }

  // 验证必答题是否已答
  const visibleQuestions = Q.value.data.filter((q) => !isHidden(q.id));
  for (let i = 0; i < visibleQuestions.length; i++) {
    const item = visibleQuestions[i];
    if (item.type === "FillBlank" && item.multiMode) {
      const blankItems = item.options.filter((opt) => opt.required);
      for (const blankItem of blankItems) {
        if (!answers.value[`${item.id}_${blankItem.id}`]) {
          uni.showToast({
            title: `第${i + 1}题为必答题`,
            icon: "none",
          });
          return;
        }
      }
    } else if (item.required && !isQuestionAnswered(item.id)) {
      uni.showToast({
        title: `第${i + 1}题为必答题`,
        icon: "none",
      });
      return;
    }
  }

  try {
    submitting.value = true;
    // TODO: 提交答案到服务器
    isSubmitted.value = true;
  } catch (error) {
    uni.showToast({
      title: "提交失败，请重试",
      icon: "none",
    });
  } finally {
    submitting.value = false;
  }
};

// 监听答案变化
watch(
  answers,
  () => {
    calculateLogic();
  },
  { deep: true }
);

// 生命周期钩子
onMounted(async () => {
  try {
    loading.value = true;
    const id = "67a9ce9d048539194100506a";
    const data = await wenjuanApi.getDetail(id);
    Q.value = data;
  } catch (error) {
    uni.showToast({
      title: "获取问卷失败",
      icon: "none",
    });
  } finally {
    loading.value = false;
  }

  updateCurrentTime();
  const timeUpdateInterval = setInterval(updateCurrentTime, 60000);

  if (!isOnCoverPage.value && !Q.value.settings?.showOnePerPage) {
    initTimer();
  }

  if (!isInCollectTime.value) {
    uni.showToast({
      title: "当前不在问卷收集时间范围内",
      icon: "none",
    });
  }

  applyThemeColor();
  calculateLogic();

  onUnmounted(() => {
    if (timeUpdateInterval) clearInterval(timeUpdateInterval);
    if (timer.value) clearInterval(timer.value);
  });
});

// 添加swiper变化处理函数
const handleSwiperChange = (e) => {
  if (!Q.value.settings?.showOnePerPage) return;
  const current = e.detail.current;
  currentPage.value = current - 1; // 因为第一页是封面，所以要减1
};
</script>

<style lang="scss">
.main-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  background: v-bind("Q.settings.bgColor");
}

.time-left {
  position: fixed;
  top: 40rpx;
  right: 40rpx;
  font-size: 24rpx;
  color: #ffffff;
  background: var(--c-brand);
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  z-index: 101;
}

.main {
  flex-grow: 1;
  // padding: 40rpx;
  height: calc(100vh - 200rpx);
  box-sizing: border-box;
  overflow-y: auto;
}

.q-item {
  padding: 0 40rpx;
  border-radius: 20rpx;
  background-color: rgba(255, 255, 255, 0.8);

  &.gap {
    margin-bottom: 80rpx;
  }

  .title {
    font-size: 32rpx;
    margin-bottom: 16rpx;
    padding: 20rpx 0;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
}

.required {
  color: #ff4d4f;
  margin-right: 8rpx;
}

.number {
  // color: #999999;
  margin-right: 8rpx;
}

.footer {
  flex-shrink: 0;
  width: 100%;
  background: #ffffff;
  padding: 40rpx 80rpx;
  box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
}

.progress-bar {
  background: #ffffff;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 32rpx;
  margin-bottom: 24rpx;

  .progress-text {
    font-size: 24rpx;
    color: #999999;
    white-space: nowrap;
  }
}

.page-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .nav-button {
    min-width: 200rpx;
  }

  .page-indicator {
    font-size: 28rpx;
    color: #999999;
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
  background: v-bind("Q.settings.coverBgColor");
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
    color: v-bind("Q.settings.coverTextColor");
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
</style>
