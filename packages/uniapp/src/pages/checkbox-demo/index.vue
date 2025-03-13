<template>
  <view class="container">
    <view class="section">
      <view class="section-title">基础用法</view>
      <view class="demo-box">
        <mp-checkbox v-model="checked1" label="单个复选框"></mp-checkbox>
      </view>
      <view class="demo-desc">选中状态：{{ checked1 }}</view>
    </view>

    <view class="section">
      <view class="section-title">禁用状态</view>
      <view class="demo-box">
        <mp-checkbox v-model="checked2" label="禁用的复选框" disabled></mp-checkbox>
        <mp-checkbox v-model="checked3" label="禁用且选中" disabled></mp-checkbox>
      </view>
    </view>

    <view class="section">
      <view class="section-title">自定义样式</view>
      <view class="demo-box">
        <mp-checkbox v-model="checked4" label="自定义颜色" active-color="#ff4500"></mp-checkbox>
        <mp-checkbox v-model="checked5" label="圆形图标" shape="circle"></mp-checkbox>
        <mp-checkbox v-model="checked6" label="大尺寸图标大尺寸图标大尺寸图标大尺寸图标大尺寸图标大尺寸图标大尺寸图标大尺寸图标大尺寸图标大尺寸图标" :icon-size="48"></mp-checkbox>
      </view>
    </view>

    <view class="section">
      <view class="section-title">复选框组（横向排列）</view>
      <view class="demo-box">
        <mp-checkbox-group v-model="fruitList">
          <mp-checkbox name="apple" label="苹果"></mp-checkbox>
          <mp-checkbox name="banana" label="香蕉"></mp-checkbox>
          <mp-checkbox name="orange" label="橙子"></mp-checkbox>
        </mp-checkbox-group>
      </view>
      <view class="demo-desc">选中的水果：{{ fruitList }}</view>
    </view>

    <view class="section">
      <view class="section-title">复选框组（纵向排列）</view>
      <view class="demo-box">
        <mp-checkbox-group v-model="hobbyList" placement="column">
          <mp-checkbox name="reading" label="阅读"></mp-checkbox>
          <mp-checkbox name="music" label="音乐"></mp-checkbox>
          <mp-checkbox name="sports" label="运动"></mp-checkbox>
          <mp-checkbox name="travel" label="旅行"></mp-checkbox>
        </mp-checkbox-group>
      </view>
      <view class="demo-desc">选中的爱好：{{ hobbyList }}</view>
    </view>

    <view class="section">
      <view class="section-title">自定义内容复选框</view>
      <view class="demo-box">
        <mp-checkbox-group v-model="colorList" placement="column">
          <mp-checkbox name="red" label="红色"></mp-checkbox>
          <input v-if="colorList.includes('red')" v-model="textareaValue" placeholder="请输入" style="border: 1px solid #000; border-radius: 4px; padding: 4px; margin-left: 10px" />

          <mp-checkbox name="blue" label="蓝色"></mp-checkbox>
          <mp-checkbox name="green" label="绿色"></mp-checkbox>
          <mp-checkbox name="yellow" label="黄色"></mp-checkbox>
        </mp-checkbox-group>
      </view>
      <view class="demo-desc">当前选中：{{ colorList }}</view>
    </view>

    <view class="section">
      <view class="section-title">自定义内容</view>
      <view class="demo-box">
        <mp-checkbox v-model="checked7">
          <text>自定义文本</text>
        </mp-checkbox>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import MpCheckbox from '../../components/MpCheckbox.vue'
import MpCheckboxGroup from '../../components/MpCheckboxGroup.vue'

// 单个复选框
const checked1 = ref(false)
const checked2 = ref(false)
const checked3 = ref(true)
const checked4 = ref(true)
const checked5 = ref(true)
const checked6 = ref(true)
const checked7 = ref(false)
const textareaValue = ref('')
// 复选框组
const fruitList = ref(['apple'])
const hobbyList = ref(['reading', 'music'])
const colorList = ref([])
</script>

<style lang="scss" scoped>
.container {
  padding: 30rpx;
}

.section {
  margin-bottom: 40rpx;

  &-title {
    margin-bottom: 20rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
}

.demo-box {
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 8rpx;
  margin-bottom: 10rpx;
}

.demo-desc {
  font-size: 24rpx;
  color: #666;
  margin-top: 10rpx;
}
</style>
