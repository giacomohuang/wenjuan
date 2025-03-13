<template>
  <view class="mp-input" :class="[disabled ? 'mp-input--disabled' : '', focus ? 'mp-input--focus' : '']">
    <!-- 左侧图标 -->
    <view class="mp-input__prepend" v-if="$slots.prepend">
      <slot name="prepend"></slot>
    </view>
    <!-- 输入区域 -->
    <view class="mp-input__content">
      <!-- 输入框标题 -->
      <view class="mp-input__label" v-if="$slots.label || label">
        <slot name="label">{{ label }}</slot>
      </view>
      <view class="mp-input__field">
        <!-- 输入框控件 -->
        <input class="mp-input__control" ref="inputRef" v-model="inputValue" :type="passwordVisible ? 'text' : type" :placeholder="placeholder" :placeholder-style="placeholderStyle" :disabled="disabled" :focus="autoFocus" :cursor="cursor" :confirm-type="confirmType" :confirm-hold="confirmHold" :cursor-spacing="cursorSpacing" :adjust-position="adjustPosition" :selection-end="selectionEnd" :selection-start="selectionStart" :password="type === 'password' && !passwordVisible" @input="onInput" @focus="onFocus" @blur="onBlur" @confirm="onConfirm" @keyboardheightchange="onKeyboardheightchange" />
        <!-- 右侧操作区域 -->
        <view class="mp-input__actions">
          <!-- 清除按钮 -->
          <view class="mp-input__clear" v-if="clearable && modelValue && !disabled" @tap.stop="onClear">
            <text class="mp-input__icon">×</text>
          </view>
          <!-- 密码可见按钮 -->
          <view v-if="type === 'password' && showPassword" class="mp-input__password" @tap.stop="togglePasswordVisible">
            <text class="mp-input__icon">{{ passwordVisible ? '👁️' : '👁️‍🗨️' }}</text>
          </view>
          <!-- 后缀图标 -->
          <view class="mp-input__suffix" v-if="$slots.suffix">
            <slot name="suffix"></slot>
          </view>
        </view>
      </view>
      <!-- 字符计数 -->
      <view class="mp-input__char-count" v-if="showCharCount && maxlength !== -1"> {{ valueLength }}/{{ maxlength }} </view>
    </view>
    <!-- 右侧内容 -->
    <view class="mp-input__append" v-if="$slots.append">
      <slot name="append"></slot>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

const props = defineProps({
  // 输入框的值
  modelValue: {
    type: [String, Number],
    default: ''
  },
  // 输入框类型
  type: {
    type: String,
    default: 'text' // text, number, idcard, digit, password
  },
  // 输入框占位文本
  placeholder: {
    type: String,
    default: '请输入内容'
  },
  // 占位文本样式
  placeholderStyle: {
    type: String,
    default: ''
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 最大长度
  maxlength: {
    type: [String, Number],
    default: -1
  },
  // 是否自动聚焦
  autoFocus: {
    type: Boolean,
    default: false
  },
  // 指定光标位置
  cursor: {
    type: [String, Number],
    default: -1
  },
  // 设置键盘右下角按钮的文字
  confirmType: {
    type: String,
    default: 'done' // done, go, next, search, send
  },
  // 点击键盘右下角按钮时是否保持键盘不收起
  confirmHold: {
    type: Boolean,
    default: false
  },
  // 光标与键盘的距离
  cursorSpacing: {
    type: [String, Number],
    default: 0
  },
  // 键盘弹起时，是否自动上推页面
  adjustPosition: {
    type: Boolean,
    default: true
  },
  // 光标起始位置
  selectionStart: {
    type: [String, Number],
    default: -1
  },
  // 光标结束位置
  selectionEnd: {
    type: [String, Number],
    default: -1
  },
  // 是否显示清除按钮
  clearable: {
    type: Boolean,
    default: false
  },
  // 标签文本
  label: {
    type: String,
    default: ''
  },
  // 是否显示密码切换按钮
  showPassword: {
    type: Boolean,
    default: false
  },
  // 是否显示字符计数
  showCharCount: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'input', 'focus', 'blur', 'confirm', 'clear', 'keyboardheightchange'])

// 输入框聚焦状态
const focus = ref(false)
// 密码可见状态
const passwordVisible = ref(false)

const inputValue = ref(fixInputValue())

// 如果输入值超过最大长度，则截取输入值
function fixInputValue() {
  if (props.maxlength !== -1 && props.modelValue.length > props.maxlength) {
    const newValue = props.modelValue.slice(0, props.maxlength)
    emit('update:modelValue', newValue)
    return newValue
  }
  return props.modelValue
}

// 计算输入值的长度
const valueLength = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined) return 0
  return String(props.modelValue).length
})

// 输入事件
const onInput = (e) => {
  let value = e.detail.value
  // 修正uniapp输入框bug
  if (props.maxlength !== -1 && value.length > props.maxlength) {
    value = value.slice(0, props.maxlength)
    setTimeout(() => {
      inputValue.value = value
    })
  }
  emit('update:modelValue', value)
  emit('input', {
    value,
    event: e
  })
}

// 聚焦事件
const onFocus = (e) => {
  focus.value = true
  emit('focus', {
    value: props.modelValue,
    event: e
  })
}

// 失焦事件
const onBlur = (e) => {
  focus.value = false
  emit('blur', {
    value: props.modelValue,
    event: e
  })
}

// 确认事件
const onConfirm = (e) => {
  emit('confirm', {
    value: props.modelValue,
    event: e
  })
}

// 键盘高度变化事件
const onKeyboardheightchange = (e) => {
  emit('keyboardheightchange', {
    height: e.detail.height,
    event: e
  })
}

// 清除输入内容
const onClear = () => {
  emit('update:modelValue', '')
  emit('clear')
}

// 切换密码可见状态
const togglePasswordVisible = () => {
  passwordVisible.value = !passwordVisible.value
}
</script>

<style lang="scss" scoped>
.mp-input {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  position: relative;
  box-sizing: border-box;
  font-size: 28rpx;
  color: #303133;

  &__prepend,
  &__append {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 16rpx;
    height: 70rpx;
    background-color: #f7f8fa;
    color: #606266;
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  &__label {
    font-size: 28rpx;
    color: #606266;
    margin-bottom: 8rpx;
  }

  &__field {
    display: flex;
    flex-direction: row;
    align-items: center;
    position: relative;
    min-height: 70rpx;
    background-color: #ffffff;
    border: 1rpx solid #dcdfe6;
    border-radius: 8rpx;
    padding: 0 16rpx;
    transition: border-color 0.2s;
  }

  &__control {
    flex: 1;
    height: 70rpx;
    line-height: 70rpx;
    font-size: 28rpx;
    color: #303133;
    padding: 0;
    background-color: transparent;
  }

  &__actions {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  &__clear,
  &__password,
  &__suffix {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 8rpx;
    height: 70rpx;
  }

  &__icon {
    font-size: 24rpx;
    color: #c0c4cc;
  }

  &__char-count {
    text-align: right;
    margin-top: 4rpx;
    font-size: 24rpx;
    color: #909399;
  }

  &--focus {
    .mp-input__field {
      border-color: #2979ff;
    }
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;

    .mp-input__field {
      background-color: #f5f7fa;
    }

    .mp-input__char-count {
      opacity: 0.7;
    }
  }
}
</style>
