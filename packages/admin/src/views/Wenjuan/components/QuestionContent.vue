<template>
  <!-- 填空题 -->
  <template v-if="item.type === 'FillBlank'">
    <div v-if="!item.multiMode" class="fill-blank">
      <a-input v-model:value="answers[item.id]" :placeholder="item.options[0]?.placeholder || '请填写'" :maxLength="item.options[0]?.maxLength || undefined" />
    </div>
    <div v-else class="fill-blank">
      <div v-for="opt in item.options" :key="opt.id" class="blank-item">
        <div class="blank-title">
          <span class="required" v-if="opt.required">*</span>
          <div v-html="opt.text"></div>
        </div>
        <a-input v-model:value="answers[item.id + '_' + opt.id]" :placeholder="opt.placeholder || '请填写'" :maxLength="opt.maxLength || undefined" />
      </div>
    </div>
  </template>

  <!-- 单选题 -->
  <template v-if="item.type === 'SingleChoice'">
    <a-radio-group v-model:value="answers[item.id]">
      <div v-for="opt in item.options" :key="opt.id" class="radio-item">
        <a-radio :value="opt.id">
          <span v-html="opt.text"></span>
        </a-radio>
        <a-input v-if="opt.fill?.show && answers[item.id] === opt.id" v-model:value="answers[item.id + '_fill']" :placeholder="opt.fill.placeholder || '请填写'" :maxLength="opt.fill.length || undefined" />
      </div>
    </a-radio-group>
  </template>

  <!-- 多选题 -->
  <template v-if="item.type === 'MultiChoice'">
    <a-checkbox-group v-model:value="answers[item.id]" :min="item.minRange || 0" :max="item.maxRange || item.options.length">
      <div v-for="opt in item.options" :key="opt.id" class="checkbox-item">
        <a-checkbox :value="opt.id">
          <span v-html="opt.text"></span>
        </a-checkbox>
        <a-input v-if="opt.fill?.show && answers[item.id]?.includes(opt.id)" v-model:value="answers[item.id + '_' + opt.id]" :placeholder="opt.fill.placeholder || '请填写'" :maxLength="opt.fill.length || undefined" />
      </div>
    </a-checkbox-group>
  </template>

  <!-- 图片选择 -->
  <template v-if="item.type === 'ImageChoice'">
    <div class="image-choice">
      <a-radio-group v-model:value="answers[item.id]">
        <div v-for="opt in item.options" :key="opt.id" class="image-item">
          <div class="image-preview">
            <a-image
              :src="OSS_PREFIX + opt.imageUrl"
              :alt="opt.text"
              :preview="{
                src: OSS_PREFIX + opt.imageUrl,
                mask: false
              }"
            />
          </div>
          <div class="image-text">
            <a-radio :value="opt.id"><span v-html="opt.text"></span></a-radio>
          </div>
        </div>
      </a-radio-group>
    </div>
  </template>

  <!-- 评分题 -->
  <template v-if="item.type === 'Rate'">
    <div class="rate-wrap">
      <template v-if="item.maxScore <= 10">
        <a-rate v-model:value="answers[item.id]" :count="item.maxScore" :allow-half="item.step === 0.5" :character="item.customIcon ? () => h(Icon, { name: item.customIcon.icon }) : undefined" />
      </template>
      <template v-else>
        <a-slider v-model:value="answers[item.id]" :min="item.minScore" :max="item.maxScore" :step="item.step" />
      </template>
      <div v-if="item.showLabels" class="rate-labels">
        <span>{{ item.minLabel }}</span>
        <span>{{ item.maxLabel }}</span>
      </div>
    </div>
  </template>

  <!-- NPS -->
  <template v-if="item.type === 'NPS'">
    <div class="nps-wrap">
      <div class="nps-scores">
        <div v-for="score in 11" :key="score - 1" class="score-item" :class="{ active: answers[item.id] === score - 1 }" @click="answers[item.id] = score - 1">
          {{ score - 1 }}
        </div>
      </div>
      <div v-if="item.showLabels" class="nps-labels">
        <span>{{ item.minLabel }}</span>
        <span>{{ item.maxLabel }}</span>
      </div>
    </div>
  </template>
</template>

<router lang="json">
{
  "isRouter": false
}
</router>

<script setup>
import { h, inject } from 'vue'
import Icon from '@/components/Icon.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const answers = inject('answers')
const OSS_PREFIX = import.meta.env.VITE_UPLOAD_URL_PREFIX
</script>

<style scoped lang="scss">
.fill-blank {
  text-wrap: wrap;
  word-break: break-all;
  .required {
    display: flex;
    color: red;
    margin-right: 4px;
  }

  .blank-item {
    margin-bottom: 16px;

    .blank-title {
      display: flex;
      flex-direction: row;
      margin-bottom: 8px;
      color: var(--text-secondary);
    }
  }
  .blank-input {
    flex-grow: 1;
  }
}

.radio-item,
.checkbox-item {
  text-wrap: wrap;
  word-break: break-all;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  width: 100%;

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }

  :deep(.ant-radio-wrapper),
  :deep(.ant-checkbox-wrapper) {
    font-size: 15px;
  }
}

.image-choice {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  text-wrap: wrap;
  word-break: break-all;

  :deep(.ant-radio-group) {
    display: contents;
  }

  .image-item {
    border: 1px solid var(--border-light);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .image-preview {
      width: 100%;
      height: 160px;
      position: relative;
      overflow: hidden;

      :deep(.ant-image) {
        width: 100%;
        height: 100%;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
          cursor: zoom-in;
        }

        &:hover img {
          transform: scale(1.05);
        }
      }
    }

    .image-text {
      padding: 12px;
      background: #fff;
      border-top: 1px solid var(--border-light);

      :deep(.ant-radio-wrapper) {
        width: 100%;
        font-size: 14px;
        color: var(--text-primary);
      }
    }
  }
}

.rate-wrap,
.nps-wrap {
  padding: 8px 0;

  :deep(.ant-rate) {
    font-size: 24px;
  }

  :deep(.ant-slider) {
    margin: 16px 8px;
  }

  .rate-labels,
  .nps-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
    color: var(--text-secondary);
    font-size: 13px;
  }
}

.nps-scores {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;

  .score-item {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid var(--border-medium);
    border-radius: 50%;
    cursor: pointer;
    font-size: 15px;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--c-brand);
      color: var(--c-brand);
    }

    &.active {
      background: var(--c-brand);
      color: white;
      border-color: var(--c-brand);
    }
  }
}
</style>
