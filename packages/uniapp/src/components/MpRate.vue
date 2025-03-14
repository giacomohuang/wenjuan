<template>
  <view class="rate-wrap" @touchmove="touchMove" @click="touchMove">
    <view class="rate-item rate-icon" :class="{ selected: i <= currentScore }" v-for="i in maxScore" :key="i">
      <span>{{ props.icon }}</span>
      <span v-if="i === currentScore + 0.5" :class="{ halfSelected: i === currentScore + 0.5 }">{{ props.icon }}</span>
    </view>
  </view>
</template>
<script setup>
import { getCurrentInstance, watch, onMounted, ref } from 'vue'

const instance = getCurrentInstance()

const props = defineProps({
  minScore: {
    default: 0
  },
  maxScore: {
    default: 5
  },
  step: {
    default: 0.5
  },
  size: {
    default: 48
  },
  gap: {
    default: 12
  },
  icon: {
    default: 'heart'
  },
  activeColor: {
    default: '#ff4444'
  },
  inactiveColor: {
    default: '#cccccc'
  },
  modelValue: {
    type: [Number, null],
    default: null
  },
  tips: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['change', 'update:modelValue'])
const currentScore = ref(props.modelValue)

// 监听modelValue变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== currentScore.value) {
      currentScore.value = newValue
    }
  }
)

onMounted(() => {
  // 初始化评分
  if (props.modelValue !== null) {
    currentScore.value = props.modelValue
  }
})

const roundToHalf = (num) => {
  const decimal = num % 1
  if (decimal <= 0) {
    return 0
  } else if (decimal <= 0.5) {
    return Math.floor(num) + 0.5
  } else {
    return Math.ceil(num)
  }
}

const touchMove = async (e) => {
  const x = e.changedTouches[0].pageX
  const rect = await getRect('.rate-wrap')
  const itemRect = await getRect('.rate-item')
  const iconWidth = itemRect.width + uni.rpx2px(parseInt(props.gap))
  let pos = (x - rect.left) / iconWidth
  if (pos < 0.2) {
    pos = 0
  }
  let score = props.step === 0.5 ? roundToHalf(pos) : Math.ceil(pos)

  // 确保分数在有效范围内
  score = Math.max(props.minScore, Math.min(score, props.maxScore))

  // 更新当前分数
  currentScore.value = score

  // 触发评分变化事件
  emit('change', score)
  emit('update:modelValue', score)
}

const getRect = async (selector) => {
  return new Promise((resolve, reject) => {
    const query = uni.createSelectorQuery().in(instance.proxy)
    query
      .select(selector)
      .boundingClientRect((data) => {
        if (data) {
          resolve(data)
        } else {
          reject(new Error('未找到元素'))
        }
      })
      .exec()
  })
}
</script>
<style scoped lang="scss">
@font-face {
  font-family: 'rate';
  src:
    url('../static/iconfont/rate.woff2') format('woff2'),
    url('../static/iconfont/rate.woff') format('woff'),
    url('../static/iconfont/rate.ttf') format('truetype');
}

.rate-icon {
  font-family: 'rate' !important;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.rate-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: v-bind('props.gap + "rpx"');
  flex-wrap: nowrap;
}
.rate-item {
  position: relative;
  color: v-bind('props.inactiveColor');
  font-size: v-bind('props.size + "rpx"');

  .halfSelected {
    position: absolute;
    width: 50%;
    left: 0;
    top: 0;
    overflow: hidden;
    color: v-bind('props.activeColor');
  }

  &.selected {
    color: v-bind('props.activeColor');
  }
}
</style>
