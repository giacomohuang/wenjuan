<template>
  <div class="settings-container" data-simplebar>
    <a-form :model="formState" layout="vertical">
      <!-- 基础设置 -->
      <a-card title="基础设置" class="setting-card">
        <a-form-item label="问卷收集起止时间" name="collectTime">
          <a-range-picker
            v-model:value="formState.collectTime"
            style="width: 400px"
            :show-time="{
              defaultValue: [dayjs('00:00:00', 'HH:mm:ss'), dayjs('11:59:59', 'HH:mm:ss')]
            }"
            format="YYYY-MM-DD HH:mm:ss"
          />
        </a-form-item>
        <a-form-item label="答题时限（0表示不限时）" name="timeLimit">
          <a-input-number v-model:value="formState.timeLimit" :min="0" :max="999" style="width: 120px" addon-after="分钟" placeholder="请输入" />
        </a-form-item>
        <a-form-item label="用户答题次数限制" name="submitLimit">
          <a-form-item-rest>
            <a-space>
              <a-select v-model:value="formState.submitLimitType" style="width: 120px">
                <a-select-option value="none">不限制</a-select-option>
                <a-select-option value="once">只允许一次</a-select-option>
                <a-select-option value="daily">每日限制</a-select-option>
                <a-select-option value="weekly">每周限制</a-select-option>
                <a-select-option value="monthly">每月限制</a-select-option>
              </a-select>
              <a-input-number v-if="formState.submitLimitType !== 'once'" v-model:value="formState.submitLimitCount" :min="1" :max="999" style="width: 120px" placeholder="次" :disabled="formState.submitLimitType === 'none'">
                <template #addonAfter>次</template>
              </a-input-number>
            </a-space>
          </a-form-item-rest>
        </a-form-item>
        <a-form-item label="问卷标签" name="tags">
          <a-select v-model:value="formState.tags" mode="tags" placeholder="请输入标签，多个标签用逗号或空格分隔" :token-separators="[',', '，', ' ']" />
        </a-form-item>
      </a-card>

      <!-- 外观和封面设置 -->
      <a-card title="外观和封面设置" class="setting-card">
        <a-form-item label="封面图片" name="coverImage">
          <div class="img-upload"><ImageUpload v-model="formState.coverImage" width="150px" height="150px" /></div>
        </a-form-item>
        <a-form-item label="背景图片" name="backgroundImage">
          <div class="img-upload"><ImageUpload v-model="formState.backgroundImage" width="150px" height="150px" /></div>
        </a-form-item>
        <a-form-item label="主题色" name="themeColor">
          <a-radio-group v-model:value="formState.themeColorMode" style="margin-bottom: 16px">
            <a-radio-button value="custom">自定义</a-radio-button>
            <a-radio-button value="system">系统预置</a-radio-button>
          </a-radio-group>
          <div class="theme-color-container">
            <div class="color-block custom" v-if="formState.themeColorMode === 'custom'">
              <input type="color" v-model="formState.themeColor" class="color-input" />
            </div>
            <!-- <ColorPicker v-model="formState.themeColor" v-if="formState.themeColorMode === 'custom'" /> -->
            <div class="color-presets" v-if="formState.themeColorMode === 'system'">
              <div v-for="(color, name) in colorSchemes" :key="name" class="color-block" :class="{ active: formState.themeColor === color }" @click="handleColorSchemeSelect(color, name)">
                <div class="inner" :style="{ backgroundColor: color }"></div>
              </div>
            </div>
          </div>
        </a-form-item>
      </a-card>

      <!-- 显示设置 -->
      <a-card title="显示设置" class="setting-card">
        <a-form-item label="显示答题进度条" name="showProgress">
          <a-switch v-model:checked="formState.showProgress" />
        </a-form-item>
        <a-form-item label="显示题号" name="showQuestionNumber">
          <a-switch v-model:checked="formState.showQuestionNumber" />
        </a-form-item>
        <a-form-item label="每页显示一题" name="showOnePerPage">
          <a-switch v-model:checked="formState.showOnePerPage" />
        </a-form-item>
      </a-card>

      <!-- 提交设置 -->
      <a-card title="提交设置" class="setting-card">
        <a-form-item label="允许重复提交" name="allowMultiSubmit">
          <a-switch v-model:checked="formState.allowMultiSubmit" />
        </a-form-item>
        <a-form-item label="提交成功提示语" name="submitSuccessMessage">
          <a-input v-model:value="formState.submitSuccessMessage" placeholder="请输入提交成功后显示的提示语" />
        </a-form-item>
      </a-card>
    </a-form>
  </div>
  <div class="form-actions">
    <a-button type="primary" @click="saveSettings">保存设置</a-button>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, reactive } from 'vue'
import 'simplebar'
import 'simplebar/dist/simplebar.css'
import ImageUpload from '@/components/ImgUpload.vue'

import dayjs from 'dayjs'

const Q = inject('Q')
const settingsModal = inject('settingsModal')

// 表单数据
const formState = reactive({
  // 基础设置
  description: Q.settings?.description ?? '',
  status: Q.settings?.status ?? true,
  tags: Q.settings?.tags ?? [],
  timeLimit: Q.settings?.timeLimit ?? 0,
  submitLimitType: Q.settings?.submitLimitType ?? 'none',
  submitLimitCount: Q.settings?.submitLimitCount ?? 1,
  collectTime: Q.settings?.collectTime ? [dayjs(Q.settings?.collectTime?.[0]), dayjs(Q.settings?.collectTime?.[1])] : [],
  // 外观和封面设置
  coverImage: Q.settings?.coverImage ?? '',
  backgroundImage: Q.settings?.backgroundImage ?? '',
  themeColorMode: Q.settings?.themeColorMode ?? 'custom',
  themeColor: Q.settings?.themeColor ?? '#0090ff',
  // 显示设置
  showProgress: Q.settings?.showProgress ?? true,
  showQuestionNumber: Q.settings?.showQuestionNumber ?? true,
  showOnePerPage: Q.settings?.showOnePerPage ?? false,
  questionsPerPage: Q.settings?.questionsPerPage ?? 5,

  // 提交设置
  allowMultiSubmit: Q.settings?.allowMultiSubmit ?? false,
  submitSuccessMessage: Q.settings?.submitSuccessMessage ?? '感谢您的参与！'
})
console.log(formState.collectTime)

// 初始化数据
onMounted(() => {})

// 保存设置
const saveSettings = () => {
  Q.settings = { ...formState }
  settingsModal.value = false
}

const colorSchemes = {
  blue: '#0090ff', // 默认蓝
  green: '#52c41a', // 清新绿
  purple: '#6857e8', // 典雅紫
  orange: '#ff8a18', // 活力橙
  red: '#f5222d', // 热情红
  cyan: '#13c2c2' // 清爽青
}

const handleColorSchemeSelect = (color, name) => {
  formState.themeColor = color
}
</script>

<style scoped lang="scss">
.settings-container {
  max-height: 80vh;
  overflow-y: auto;
  padding: 24px;
  // background-color: var(--bg-secondary);

  .setting-card {
    margin-bottom: 24px;
  }
}

.form-actions {
  display: flex;
  height: 60px;
  justify-content: center;
  align-items: center;
}

.img-upload {
  width: 150px;
  height: 150px;
  outline: 1px solid var(--border-medium);
  cursor: pointer;
  border-radius: 4px;
  &:hover {
    outline: 1px solid var(--c-brand);
  }
}

.theme-color-container {
  display: flex;
  align-items: center;
  gap: 16px;

  .color-presets {
    display: flex;
    gap: 6px;
  }

  .color-block {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    cursor: pointer;
    padding: 4px;
    border: 1px solid transparent;
    &.custom {
      border: 1px solid var(--border-medium);
    }
    &:hover {
      border: 1px solid var(--border-dark);
    }
    &.active {
      border: 1px solid var(--border-dark);
    }
    .inner {
      border-radius: 2px;
      width: 22px;
      height: 22px;
    }
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
}
</style>
