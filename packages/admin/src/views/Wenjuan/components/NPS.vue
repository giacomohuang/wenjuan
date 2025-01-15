<template>
  <div class="nps-inner">
    <div class="nps-score-container">
      <div class="nps-scores">
        <div v-for="score in currentItem.maxScore - currentItem.minScore + 1" :key="score - 1" class="score-item" :class="{ active: currentItem.value === score - 1 + currentItem.minScore }" @click="currentItem.value = score - 1 + currentItem.minScore">
          <a-tooltip :title="currentItem.tips[score - 1]?.text">
            {{ score - 1 + currentItem.minScore }}
          </a-tooltip>
        </div>
      </div>
      <div v-if="currentItem.showLabels" class="nps-labels">
        <span class="min-label">{{ currentItem.minLabel }}</span>
        <span class="max-label">{{ currentItem.maxLabel }}</span>
      </div>
    </div>
  </div>

  <!-- 设置面板 -->

  <Teleport to="#__WENJUAN_SETTINGS_CONTENT" v-if="seleItemId === itemId">
    <div class="num">{{ itemIndex + 1 }}. NPS题</div>

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
      <a-input-number v-model:value="currentItem.maxScore" :min="currentItem.minScore" :max="10" size="small" style="width: 100px" @change="handleMaxScoreChange">
        <template #addonAfter>分</template>
      </a-input-number>
    </div>

    <div class="prop-item">
      <h4>极值标签</h4>
      <a-switch v-model:checked="currentItem.showLabels" size="small" />
    </div>

    <template v-if="currentItem.showLabels">
      <div class="prop-item">
        <h4>最低分标签</h4>
        <a-input v-model:value="currentItem.minLabel" size="small" placeholder="不可能" style="width: 120px" />
      </div>
      <div class="prop-item">
        <h4>最高分标签</h4>
        <a-input v-model:value="currentItem.maxLabel" size="small" placeholder="一定会" style="width: 120px" />
      </div>
    </template>

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
import { inject, onBeforeMount, watch, computed } from 'vue'
import { message } from 'ant-design-vue'
import { cleanupScoreRanges, cleanupConditions } from '../cleanup'

const { itemId, itemIndex } = defineProps(['itemId', 'itemIndex'])
console.log('props', itemId)
const Q = inject('Q')
const seleItemId = inject('seleItemId')
const currentItem = computed(() => {
  return Q.data.find((item) => item.id === itemId)
})

console.log('currentItem', currentItem.value)

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

onBeforeMount(() => {
  // 初始化默认值
  currentItem.value.required ??= false
  currentItem.value.value ??= null
  currentItem.value.tips ??= []
  currentItem.value.showLabels ??= true
  currentItem.value.minLabel ??= '不可能'
  currentItem.value.maxLabel ??= '一定会'
  currentItem.value.minScore ??= 0
  currentItem.value.maxScore ??= 10

  // 监听分数范围变化
  // watch(
  //   () => [currentItem.value.minScore, currentItem.value.maxScore],
  //   ([newMin, newMax]) => {
  //     // 清理超出范围的提示
  //     // console.log('tips', props.itemIndex, currentItem.value)
  //     currentItem.value.tips = currentItem.value.tips.filter((tip) => tip.score >= newMin && tip.score <= newMax)

  //     // 调整当前值到合法范围
  //     if (currentItem.value.value < newMin) {
  //       currentItem.value.value = newMin
  //     } else if (currentItem.value.value > newMax) {
  //       currentItem.value.value = newMax
  //     }
  //   }
  // )
})
</script>

<style scoped lang="scss">
.nps-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nps-inner {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  max-width: 500px;
  margin-bottom: 24px;
}

.nps-scores {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  margin-bottom: 12px;
}

.score-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-medium);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: var(--c-brand);
    color: var(--c-brand);
  }

  &.active {
    background-color: var(--c-brand);
    border-color: var(--c-brand);
    color: white;
  }
}

.nps-labels {
  position: absolute;
  width: 100%;
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 12px;
  // margin-top: 8px;
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

.min-label {
  position: absolute;
  left: 0;
}

.max-label {
  position: absolute;
  right: 0;
}
</style>
