<template>
  <!-- 填空题 -->
  <template v-if="item.type === 'FillBlank'">
    <view v-if="!item.multiMode" class="fill-blank">
      <uni-easyinput v-model="answers[item.id]" :placeholder="item.options[0]?.placeholder || '请填写'" :maxlength="item.options[0]?.maxLength" />
    </view>
    <view v-else class="fill-blank">
      <view v-for="opt in item.options" :key="opt.id" class="blank-item">
        <view class="blank-title">
          <text class="required" v-if="opt.required">*</text>
          <rich-text :nodes="opt.text"></rich-text>
        </view>
        <uni-easyinput v-model="answers[item.id + '_' + opt.id]" :placeholder="opt.placeholder || '请填写'" :maxlength="opt.maxLength" />
      </view>
    </view>
  </template>

  <!-- 单选题 -->
  <template v-if="item.type === 'SingleChoice'">
    <view class="radio-group">
      <uni-data-checkbox v-model="answers[item.id]" :localdata="item.options.map((opt) => ({ value: opt.id, text: opt.text }))" mode="default" />
      <view v-for="opt in item.options" :key="opt.id">
        <uni-easyinput v-if="opt.fill?.show && answers[item.id] === opt.id" v-model="answers[item.id + '_fill']" :placeholder="opt.fill.placeholder || '请填写'" :maxlength="opt.fill.length" />
      </view>
    </view>
  </template>

  <!-- 多选题 -->
  <template v-if="item.type === 'MultiChoice'">
    <view class="checkbox-group">
      <uni-data-checkbox v-model="answers[item.id]" :localdata="item.options.map((opt) => ({ value: opt.id, text: opt.text }))" multiple :min="item.minRange || 0" :max="item.maxRange || item.options.length" />
      <view v-for="opt in item.options" :key="opt.id">
        <uni-easyinput v-if="opt.fill?.show && answers[item.id]?.includes(opt.id)" v-model="answers[item.id + '_' + opt.id]" :placeholder="opt.fill.placeholder || '请填写'" :maxlength="opt.fill.length" />
      </view>
    </view>
  </template>

  <!-- 图片选择 -->
  <template v-if="item.type === 'ImageChoice'">
    <view class="image-choice">
      <uni-data-checkbox
        v-model="answers[item.id]"
        :localdata="
          item.options.map((opt) => ({
            value: opt.id,
            text: opt.text,
            extra: OSS_PREFIX + opt.imageUrl,
          }))
        "
        mode="default"
      >
        <template #default="{ item }">
          <view class="image-item">
            <view class="image-preview">
              <image :src="item.extra" :alt="item.text" mode="aspectFill" @tap="previewImage(item.extra)" />
            </view>
            <view class="image-text">
              <rich-text :nodes="item.text"></rich-text>
            </view>
          </view>
        </template>
      </uni-data-checkbox>
    </view>
  </template>

  <!-- 评分题 -->
  <template v-if="item.type === 'Rate'">
    <view class="rate-wrap">
      <template v-if="item.maxScore <= 10">
        <uni-rate v-model="answers[item.id]" :max="item.maxScore" :allow-half="item.step === 0.5" :is-fill="true" :value="answers[item.id]" />
      </template>
      <template v-else>
        <uni-number-box v-model="answers[item.id]" :min="item.minScore" :max="item.maxScore" :step="item.step" />
      </template>
      <view v-if="item.showLabels" class="rate-labels">
        <text>{{ item.minLabel }}</text>
        <text>{{ item.maxLabel }}</text>
      </view>
    </view>
  </template>

  <!-- NPS -->
  <template v-if="item.type === 'NPS'">
    <view class="nps-wrap">
      <view class="nps-scores">
        <view v-for="score in 11" :key="score - 1" class="score-item" :class="{ active: answers[item.id] === score - 1 }" @tap="answers[item.id] = score - 1">
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
import { inject, ref } from "vue";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const answers = inject("answers");
const OSS_PREFIX = uni.getStorageSync("VITE_UPLOAD_URL_PREFIX");

const previewImage = (url) => {
  uni.previewImage({
    urls: [url],
    current: url,
  });
};
</script>

<style lang="scss">
.fill-blank {
  text-wrap: wrap;
  word-break: break-all;
  padding: 0 20rpx;

  .required {
    display: flex;
    color: red;
    margin-right: 8rpx;
  }

  .blank-item {
    margin-bottom: 32rpx;

    .blank-title {
      display: flex;
      flex-direction: row;
      margin-bottom: 16rpx;
      color: var(--text-secondary);
      font-size: 28rpx;
    }
  }
  .blank-input {
    flex-grow: 1;
  }
}

.radio-item,
.checkbox-item {
  padding: 20rpx 24rpx;
  margin-bottom: 8rpx;
}

.image-choice {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320rpx, 1fr));
  gap: 32rpx;
  padding: 20rpx;
  text-wrap: wrap;
  word-break: break-all;

  .image-item {
    border: 1rpx solid var(--border-light);
    border-radius: 24rpx;
    overflow: hidden;
    transition: all 0.3s ease;

    &:active {
      opacity: 0.8;
    }

    .image-preview {
      width: 100%;
      height: 320rpx;
      position: relative;
      overflow: hidden;

      image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .image-text {
      padding: 24rpx;
      background: #fff;
      border-top: 1rpx solid var(--border-light);
      font-size: 28rpx;
    }
  }
}

.rate-wrap,
.nps-wrap {
  padding: 20rpx 32rpx;

  .rate-labels,
  .nps-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 24rpx;
    color: var(--text-secondary);
    font-size: 26rpx;
  }
}

.nps-scores {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;

  .score-item {
    width: 64rpx;
    height: 64rpx;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3rpx solid var(--border-medium);
    border-radius: 50%;
    font-size: 30rpx;
    transition: all 0.2s ease;

    &:active {
      opacity: 0.8;
    }

    &.active {
      background: var(--c-brand);
      color: white;
      border-color: var(--c-brand);
    }
  }
}
</style>
