<template>
  <view class="progress-bar" v-if="percent > 0">
    <view class="progress">
      <view class="progress-inner" :style="{ width: percent + '%' }"></view>
    </view>
    <text class="progress-text">{{ percent }}%</text>
  </view>
</template>

<script setup>
defineProps({
  percent: {
    type: Number,
    default: 0,
    required: true
  }
})
</script>

<style lang="scss">
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

.progress {
  height: 8rpx;
  background-color: #f0f0f0;
  border-radius: 4rpx;
  overflow: hidden;
  flex: 1;
}

.progress-inner {
  height: 100%;
  background-color: $uni-color-primary;
  transition: width 0.3s;
}
</style>
