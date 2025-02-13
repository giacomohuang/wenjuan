<template>
  {{ (item.id, answers[item.id]) }}
  <!-- 填空题 -->
  <template v-if="item.type === 'FillBlank'">
    <view v-if="!item.multiMode" class="fill-blank">
      <up-input v-model="answers[item.id]" />
    </view>
    <view v-else class="fill-blank">
      <view v-for="opt in item.options" :key="opt.id" class="blank-item">
        <view class="blank-title">
          <text class="required" v-if="opt.required">*</text>
          <rich-text :nodes="opt.text" style="font-size: 28rpx"></rich-text>
        </view>
        <up-input v-model="answers[item.id + '_' + opt.id]" :placeholder="opt.placeholder || '请填写'" :maxlength="opt.maxLength" />
      </view>
    </view>
  </template>

  <!-- 单选题 -->
  <template v-if="item.type === 'SingleChoice'">
    <view class="radio-group">
      <up-radio-group v-model="answers[item.id]" placement="column">
        <up-radio v-for="opt in item.options" :key="opt.id" :name="opt.id">
          <template #label>
            <rich-text :nodes="opt.text" style="font-size: 28rpx"></rich-text>
          </template>
        </up-radio>
      </up-radio-group>
      <view v-for="opt in item.options" :key="opt.id">
        <uni-easyinput v-if="opt.fill?.show && answers[item.id] === opt.id" v-model="answers[item.id + '_fill']" :placeholder="opt.fill.placeholder || '请填写'" :maxlength="opt.fill.length" />
      </view>
    </view>
  </template>

  <!-- 多选题 -->
  <template v-if="item.type === 'MultiChoice'">
    <view class="checkbox-group">
      <up-checkbox-group v-model="answers[item.id]" placement="column">
        <up-checkbox v-for="(item, index) in item.options" :key="index" :name="item.id">
          <template #label>
            <rich-text :nodes="item.text" style="font-size: 28rpx"></rich-text>
          </template>
        </up-checkbox>
      </up-checkbox-group>
      <view v-for="opt in item.options" :key="opt.id">
        <up-input v-if="opt.fill?.show && answers[item.id]?.includes(opt.id)" v-model="answers[item.id + '_' + opt.id]" :placeholder="opt.fill.placeholder || '请填写'" :maxlength="opt.fill.length" border="surround" />
      </view>
    </view>
  </template>

  <!-- 图片选择-->
  <template v-if="item.type === 'ImageChoice'">
    <view class="image-choice">
      <up-radio-group v-model="answers[item.id]">
        <view class="image-choice-wrap">
          <view v-for="opt in item.options" :key="opt.id" class="image-item">
            <image :src="OSS_PREFIX + opt.imageUrl" :alt="opt.text" mode="aspectFit" style="align-self: center; width: 100%; max-height: 250rpx" lazy-load="true" @tap="previewImage(OSS_PREFIX + opt.imageUrl)" />
            <up-radio :label="opt.text" :name="opt.id" :custom-style="{ display: 'grid', gridTemplateColumns: 'auto 1fr', padding: '0 16rpx' }">
              <template #label>
                <rich-text :nodes="opt.text" style="font-size: 28rpx"></rich-text>
              </template>
            </up-radio>
          </view>
        </view>
      </up-radio-group>
    </view>
  </template>

  <!-- 评分题 -->
  <template v-if="item.type === 'Rate'">
    <view class="rate-wrap">
      <template v-if="item.maxScore <= 10">
        <up-rate v-model="answers[item.id]" :count="item.maxScore" :score="0.5" :allowHalf="item.step === 0.5" size="24" />
      </template>
      <template v-else>
        <up-slider v-model="answers[item.id]" :min="item.minScore" :max="item.maxScore" :step="item.step" />
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

import { getNVueFlexDirection } from "@dcloudio/uni-cli-shared";
<script setup>
import { inject } from "vue";
defineOptions({
  styleIsolation: "shared",
});
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});
const answers = inject("answers");

const OSS_PREFIX = "http://localhost:9000/mpadmin/";

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
      color: #999;
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
  text-wrap: wrap;
  word-break: break-all;

  .image-choice-wrap {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
  }
  .image-item {
    border: 1rpx solid #f1f1f1;
    border-radius: 24rpx;
  }
}

.rate-wrap,
.nps-wrap {
  // padding: 20rpx 32rpx;

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
    font-size: 24rpx; // 稍微减小字体大小以适应小屏幕
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
