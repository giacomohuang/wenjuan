<template>
  <!-- 填空题 -->
  <template v-if="item.type === 'FillBlank'">
    <view v-if="!item.multiMode" class="fill-blank">
      <mp-input v-model="answers[item.id]" :placeholder="item.options[0].placeholder || '请填写'" :maxlength="item.options[0].maxLength" showCharCount />
    </view>
    <view v-else class="fill-blank">
      <view v-for="opt in item.options" :key="opt.id" class="blank-item">
        <view class="blank-title">
          <text class="required" v-if="opt.required">*</text>
          <rich-text :nodes="opt.text" style="font-size: 28rpx"></rich-text>
        </view>
        <mp-input v-model="answers[item.id + '_' + opt.id]" :placeholder="opt.placeholder || '请填写'" :maxlength="opt.maxLength" showCharCount />
      </view>
    </view>
  </template>

  <!-- 单选题 -->
  <template v-if="item.type === 'SingleChoice'">
    <view class="radio-group">
      <mp-radio-group v-model="answers[item.id]" placement="column">
        <template v-for="opt in item.options" :key="opt.id">
          <mp-radio :name="opt.id">
            <rich-text :nodes="opt.text" style="font-size: 28rpx"></rich-text>
          </mp-radio>
          <view class="fill-wrap" v-if="opt.fill?.show && answers[item.id] === opt.id">
            <text class="required" v-if="opt.fill.required">*</text>
            <mp-input v-model="answers[item.id + '_fill']" :placeholder="opt.fill.placeholder || '请填写'" :maxlength="opt.fill.length" showCharCount />
          </view>
        </template>
      </mp-radio-group>
    </view>
  </template>

  <!-- 多选题 -->
  <template v-if="item.type === 'MultiChoice'">
    <view class="range-tips" v-if="item.minRange || item.maxRange"> {{ item.minRange ? '最少选' + item.minRange + '项，' : '' }}{{ item.maxRange ? '最多选' + item.maxRange + '项' : '' }} </view>
    <view class="checkbox-group">
      <mp-checkbox-group v-model="answers[item.id]" placement="column">
        <template v-for="opt in item.options" :key="opt.id">
          <mp-checkbox :name="opt.id">
            <rich-text :nodes="opt.text" style="font-size: 28rpx"></rich-text>
          </mp-checkbox>
          <view class="fill-wrap" v-if="opt.fill?.show && answers[item.id]?.includes(opt.id)">
            <text class="required" v-if="opt.fill.required">*</text>
            <mp-input v-model="answers[item.id + '_' + opt.id]" :placeholder="opt.fill.placeholder || '请填写'" :maxlength="opt.fill.length" showCharCount />
          </view>
        </template>
      </mp-checkbox-group>
    </view>
  </template>

  <!-- 图片选择-->
  <template v-if="item.type === 'ImageChoice'">
    <view class="image-choice">
      <mp-radio-group v-model="answers[item.id]">
        <view class="image-choice-wrap">
          <view v-for="opt in item.options" :key="opt.id" class="image-item">
            <image :src="OSS_PREFIX + opt.imageUrl" :alt="opt.text" mode="aspectFit" class="img" lazy-load="true" @tap="previewImage(OSS_PREFIX + opt.imageUrl)" />
            <mp-radio :label="opt.text" :name="opt.id" :style="{ display: 'grid', gridTemplateColumns: 'auto 1fr', padding: '0 16rpx 16rpx 16rpx' }">
              <rich-text :nodes="opt.text" style="font-size: 28rpx"></rich-text>
            </mp-radio>
          </view>
        </view>
      </mp-radio-group>
    </view>
  </template>

  <!-- 评分题 -->
  <template v-if="item.type === 'Rate'">
    <view class="rate-wrap">
      <MpRate v-if="item.maxScore <= 10" v-model="answers[item.id]" :minScore="item.minScore" :maxScore="item.maxScore" :activeColor="item.iconColor" :icon="item.icon" :step="item.step" size="48" gap="12" :tips="item.tips" />
      <view class="rate-tip">{{ item.tips.find((tip) => tip.score == Math.floor(answers[item.id]))?.text }}</view>
    </view>
    <!-- <view class="rate-wrap">
      <template v-if="item.maxScore <= 10">
        <up-rate v-model="answers[item.id]" :count="item.maxScore" :minCount="0" :allowHalf="item.step === 0.5" size="24" />
      </template>
      <template v-else>
        <slider @change="handleSliderChange" activeColor="#007aff" :min="item.minScore" :max="item.maxScore" :step="item.step" show-value block-size="18" />
      </template>
      <view v-if="item.showLabels" class="rate-labels">
        <text>{{ item.minLabel }}</text>
        <text>{{ item.maxLabel }}</text>
      </view>
    </view> -->
  </template>

  <!-- NPS -->
  <template v-if="item.type === 'NPS'">
    <view class="nps-wrap">
      <view class="nps-scores">
        <view v-for="score in item.maxScore + 1" :key="score - 1" class="score-item" :class="{ active: answers[item.id] === score - 1 }" @tap="answers[item.id] = score - 1">
          {{ score - 1 }}
        </view>
      </view>
      <view v-if="item.showLabels" class="nps-labels">
        <text>{{ item.minLabel }}</text>
        <text>{{ item.maxLabel }}</text>
      </view>
    </view>
  </template>
</template>

<script setup>
import { inject } from 'vue'
import MpRate from './MpRate.vue'
import MpCheckbox from './MpCheckbox.vue'
import MpCheckboxGroup from './MpCheckboxGroup.vue'
import MpRadio from './MpRadio.vue'
import MpRadioGroup from './MpRadioGroup.vue'
import MpInput from './MpInput.vue'

defineOptions({
  styleIsolation: 'shared'
})
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})
const answers = inject('answers')

const OSS_PREFIX = 'http://localhost:9000/mpadmin/'

const previewImage = (url) => {
  uni.previewImage({
    urls: [url],
    current: url
  })
}
</script>

<style lang="scss">
.required {
  color: red;
  margin-right: 8rpx;
}

.range-tips {
  color: #999;
  font-size: 24rpx;
  margin-bottom: 20rpx;
}

.fill-blank {
  text-wrap: wrap;
  word-break: break-all;
  padding: 0 20rpx;

  .blank-item {
    margin-bottom: 32rpx;

    .blank-title {
      display: flex;
      flex-direction: row;
      margin-bottom: 16rpx;
      color: #999;
      font-size: 28rpx;
    }
  }
  .blank-input {
    flex-grow: 1;
  }
}

.fill-wrap {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 8rpx;
}

.radio-item,
.checkbox-item {
  padding: 20rpx 24rpx;
  margin-bottom: 8rpx;
}

.image-choice {
  text-wrap: wrap;
  word-break: break-all;

  .image-choice-wrap {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
  }
  .image-item {
    border: 1rpx solid #f1f1f1;
    border-radius: 24rpx;
  }
  .img {
    align-self: center;
    width: 100%;
    max-height: 250rpx;
  }
}

.rate-tips {
  font-size: 28rpx;
  color: #999;
  // justify-content: center;
}

.rate-wrap,
.nps-wrap {
  .rate-labels,
  .nps-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 24rpx;
    color: #999;
    font-size: 26rpx;
  }
}

.nps-scores {
  display: flex;
  justify-content: space-between;
  gap: 2%;
  width: 100%;
  // padding: 16rpx 0;

  .score-item {
    flex: 1;
    aspect-ratio: 1;
    min-width: 0; // 防止内容溢出
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3rpx solid #e5e6eb;
    border-radius: 50%;
    font-size: 30rpx;
    transition: all 0.2s ease;

    &:active {
      opacity: 0.8;
    }

    &.active {
      background: #007aff;
      color: white;
      border-color: #007aff;
    }
  }
}
</style>
