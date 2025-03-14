<template>
  <div class="rate-wrap">
    <!-- 评分区域 -->
    <div class="rate-content">
      <template v-if="currentItem.maxScore <= 10">
        <div class="rate-inner" :style="{ color: currentItem.iconColor }">
          <span class="icon preview" v-for="i in currentItem.maxScore" :key="i">{{ currentItem.icon }}</span>
        </div>
      </template>
      <template v-else>
        <div class="slider-inner">
          <a-slider v-model:value="currentItem.value" :min="currentItem.minScore" :max="currentItem.maxScore" :step="currentItem.step" />
        </div>
      </template>
    </div>
  </div>

  <!-- 设置面板 -->
  <Teleport to="#__WENJUAN_SETTINGS_CONTENT" v-if="seleItemId === itemId">
    <div class="num">{{ itemIndex + 1 }}. 评分题</div>

    <div class="prop-item">
      <h4>本题必答</h4>
      <a-switch v-model:checked="currentItem.required" size="small" />
    </div>
    <div class="prop-item">
      <h4>最低分</h4>
      <a-input-number v-model:value="currentItem.minScore" :min="0" :max="currentItem.maxScore" size="small" style="width: 100px" @change="handleMinScoreChange">
        <template #addonAfter>分</template>
      </a-input-number>
    </div>
    <div class="prop-item">
      <h4>最高分</h4>
      <a-input-number v-model:value="currentItem.maxScore" :min="currentItem.minScore" :max="100" size="small" style="width: 100px" @change="handleMaxScoreChange">
        <template #addonAfter>分</template>
      </a-input-number>
    </div>
    <div class="prop-item">
      <h4>量级刻度</h4>
      <a-radio-group v-model:value="currentItem.step" size="small">
        <a-radio-button :value="1">1</a-radio-button>
        <a-radio-button :value="0.5">0.5</a-radio-button>
      </a-radio-group>
    </div>
    <template v-if="currentItem.maxScore <= 10">
      <div class="prop-item">
        <h4>图标</h4>
        <a-select v-model:value="currentItem.icon" size="small" style="width: 130px">
          <a-select-option v-for="icon in icons" :key="icon.name" :value="icon.code">
            <span class="icon select" :style="{ color: currentItem.iconColor }">{{ icon.code }}{{ icon.code }}{{ icon.code }}{{ icon.code }}{{ icon.code }}</span>
          </a-select-option>
        </a-select>
      </div>
      <div class="prop-item">
        <h4>图标颜色</h4>
        <input type="color" v-model="currentItem.iconColor" class="color-input" />
      </div>
    </template>

    <!-- <div class="prop-item">
      <h4>极值标签</h4>
      <a-switch v-model:checked="currentItem.showLabels" size="small" />
    </div> -->

    <!-- <template v-if="currentItem.showLabels">
      <div class="prop-item">
        <h4>最低分标签</h4>
        <a-input v-model:value="currentItem.minLabel" size="small" placeholder="最低" style="width: 120px" />
      </div>
      <div class="prop-item">
        <h4>最高分标签</h4>
        <a-input v-model:value="currentItem.maxLabel" size="small" placeholder="最高" style="width: 120px" />
      </div>
    </template> -->

    <!-- 评分提示设置 -->
    <div class="prop-item column">
      <h4>评分提示</h4>
      <div class="tips-list">
        <div v-for="(tip, index) in currentItem.tips" :key="index" class="tip-item">
          <a-input-number v-model:value="tip.score" :min="currentItem.minScore" :max="currentItem.maxScore" @change="(val) => handleTipScoreChange(val, index)" class="tip-score" size="small">
            <template #addonAfter>分</template>
          </a-input-number>
          <a-input v-model:value="tip.text" size="small" placeholder="请输入分数描述" />
          <icon name="del" class="remove-tip" @click="removeTip(index)" />
        </div>
        <a-button type="dashed" size="small" @click="addTip"> 添加提示 </a-button>
      </div>
    </div>
  </Teleport>
</template>

<router lang="json">
{
  "isRouter": false
}
</router>

<script setup>
import { inject, computed, onBeforeMount } from 'vue'
import { message } from 'ant-design-vue'
import Icon from '@/components/Icon.vue'
import { cleanupScoreRanges, cleanupConditions } from '../cleanup'

const { itemIndex, itemId } = defineProps(['itemIndex', 'itemId'])

const Q = inject('Q')
// const seleItemIndex = inject('seleItemIndex')
const seleItemId = inject('seleItemId')

const currentItem = computed(() => {
  return Q.data.find((item) => item.id === itemId)
})

const icons = [
  { name: 'heart', code: '\ue647' },
  { name: 'heart_filled', code: '\ue63f' },
  { name: 'star', code: '\ue9cf' },
  { name: 'star_filled', code: '\ue9df' },
  { name: 'like', code: '\ue9d0' },
  { name: 'like_filled', code: '\ue9dc' },
  { name: 'dislike', code: '\ue9cd' },
  { name: 'dislike_filled', code: '\ue9d7' },
  { name: 'flag', code: '\ue9ce' },
  { name: 'flag_filled', code: '\ue9da' }
  // { name: 'bookmark_filled', code: '\ue9d5' }
]

const cleanup = () => {
  cleanupScoreRanges(Q.data)
  cleanupConditions(Q.data)
}

function handleTipScoreChange(newScore, currentIndex) {
  if (newScore === null || newScore === undefined) {
    currentItem.value.tips[currentIndex].score = currentItem.value.minScore
    return
  }

  const tips = currentItem.value.tips
  const duplicateIndex = tips.findIndex((tip, index) => tip.score === newScore && index !== currentIndex)

  if (duplicateIndex !== -1) {
    // 从最小分开始找一个未使用的分数
    const minScore = currentItem.value.minScore
    const maxScore = currentItem.value.maxScore
    let availableScore = minScore

    while (availableScore <= maxScore) {
      if (!tips.some((tip) => tip.score === availableScore)) {
        currentItem.value.tips[currentIndex].score = availableScore
        return
      }
      availableScore++
    }

    currentItem.value.tips[currentIndex].score = tips[currentIndex].score
    message.warning('没有可用的分数')
    return
  }

  currentItem.value.tips[currentIndex].score = newScore
}

function addTip() {
  const tips = currentItem.value.tips
  const minScore = currentItem.value.minScore

  let score = minScore
  while (tips.some((tip) => tip.score === score)) {
    score++
    if (score > currentItem.value.maxScore) {
      message.warning('已经没有可用的分数')
      return
    }
  }

  currentItem.value.tips.push({
    score,
    text: ''
  })
}

function removeTip(index) {
  currentItem.value.tips.splice(index, 1)
}

onBeforeMount(() => {
  // 初始化默认值
  currentItem.value.required ??= false
  currentItem.value.minScore ??= 0
  currentItem.value.maxScore ??= 5
  currentItem.value.step ??= 1
  currentItem.value.value ??= 0
  currentItem.value.tips ??= []
  currentItem.value.customIcon ??= null
  // currentItem.value.showLabels ??= false
  currentItem.value.minLabel ??= ''
  currentItem.value.maxLabel ??= ''
  currentItem.value.iconColor ??= '#ff0000'
})

// // 监听分数范围变化
// watch(
//   () => [currentItem.value.minScore, currentItem.value.maxScore],
//   ([newMin, newMax]) => {
//     // 清理超出范围的提示

//   }
// )

function handleMinScoreChange(value) {
  if (value > currentItem.value.maxScore) {
    currentItem.value.minScore = currentItem.value.maxScore
  }

  currentItem.value.tips = currentItem.value.tips.filter((tip) => tip.score >= currentItem.value.minScore && tip.score <= currentItem.value.maxScore)

  // 调整当前值到合法范围
  if (currentItem.value.value < currentItem.value.minScore) {
    currentItem.value.value = currentItem.value.minScore
  } else if (currentItem.value.value > currentItem.value.maxScore) {
    currentItem.value.value = currentItem.value.maxScore
  }
  cleanup()
}

function handleMaxScoreChange(value) {
  if (value < currentItem.value.minScore) {
    currentItem.value.maxScore = currentItem.value.minScore
  }

  currentItem.value.tips = currentItem.value.tips.filter((tip) => tip.score >= currentItem.value.minScore && tip.score <= currentItem.value.maxScore)

  // 调整当前值到合法范围
  if (currentItem.value.value < currentItem.value.minScore) {
    currentItem.value.value = currentItem.value.minScore
  } else if (currentItem.value.value > currentItem.value.maxScore) {
    currentItem.value.value = currentItem.value.maxScore
  }
  cleanup()
}
</script>

<style scoped lang="scss">
@font-face {
  font-family: 'rate';
  src:
    url('@/assets/iconfont/rate.woff2') format('woff2'),
    url('@/assets/iconfont/rate.woff') format('woff'),
    url('@/assets/iconfont/rate.ttf') format('truetype');
}

.icon {
  font-family: 'rate' !important;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  &.select {
    color: red;
    font-size: 18px;
  }
  &.preview {
    font-size: 30px;
    padding: 0 4px;
  }
}

.rate-wrap {
  padding: 12px 0;
}

.rate-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rate-tips {
  color: var(--text-secondary);
  font-size: 14px;
}

.prop-item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  font-size: 12px;

  &.column {
    margin-top: 12px;

    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .help {
    margin-left: 4px;
    color: var(--text-secondary);
  }
}

.tips-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;

  .tip-score {
    width: 100px;
    flex-shrink: 0;
  }

  .remove-tip {
    flex-shrink: 0;
    padding: 2px;
    border: 1px solid var(--border-medium);
    border-radius: 50%;
    color: var(--text-secondary);
    cursor: pointer;
    &:hover,
    &:active {
      color: var(--c-red);
      border-color: var(--c-red);
    }
  }
}

.num {
  margin: 18px 8px;
  font-size: 16px;
  font-weight: 800;
}

.rate-inner {
  position: relative;
  width: fit-content;
}

.rate-labels {
  position: absolute;
  width: 100%;
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 12px;
  margin-top: 4px;
}

.slider-inner {
  position: relative;
  width: 80%;
}

.slider-labels {
  position: absolute;
  width: 100%;
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 12px;
  // margin-top: -12px;
  padding: 0 4px;
}

.min-label {
  position: absolute;
  left: 0;
}

.max-label {
  position: absolute;
  right: 0;
}

.color-input {
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  &::-webkit-color-swatch {
    border: none;
    border-radius: 2px;
  }
}
</style>
