<template>
  <div class="mp-tabs-wrap">
    <div class="mp-tabs-list" @wheel.stop="handleListWheel">
      <div class="mp-tabs-item" v-for="tab in tabs" :key="tab.id" :class="{ active: modelValue === tab.id }" @click.stop="handleItemClick(tab.id)">
        <slot name="item" :data="tab">{{ tab.name }}</slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
const { modelValue, tabs } = defineProps({
  modelValue: {
    type: String
  },
  tabs: {
    type: Object
    // required: true
  },
  data: {
    type: Object
    // required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const handleListWheel = (e) => {
  const listEl = e.target.closest('.mp-tabs-list')
  const containerEl = listEl.parentElement
  const listHeight = listEl.offsetHeight
  const containerHeight = containerEl.offsetHeight
  if (containerHeight - listHeight >= 0) return
  const deltaY = e.deltaY
  const translateY = getTranslateY(listEl)
  let newTranslateY = Math.min(Math.max(translateY - deltaY, containerHeight - listHeight), 0)
  if (newTranslateY == 0) {
    containerEl.classList.remove('scroll-up')
  } else if (newTranslateY == containerHeight - listHeight) {
    containerEl.classList.remove('scroll-down')
  } else {
    containerEl.classList.add('scroll-up')
    containerEl.classList.add('scroll-down')
  }
  listEl.style.transform = `translateY(${newTranslateY}px)`
  // console.log(translateY + e.deltaY)
  // el.scrollTop += e.deltaY
}

const handleItemClick = (id) => {
  emit('update:modelValue', id)
}

function getTranslateY(element) {
  // 获取元素的计算样式
  const style = window.getComputedStyle(element)
  // 获取transform矩阵
  const matrix = style.transform

  // 如果没有transform属性，返回0
  if (matrix === 'none' || !matrix) {
    return 0
  }

  // 解析transform matrix值
  // matrix(1, 0, 0, 1, 0, Y) 或 matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, Y, 0, 1)
  const matrixValues = matrix.match(/matrix.*\((.+)\)/)[1].split(', ')

  // 对于2D transform，Y值在第6个位置（索引5）
  // 对于3D transform，Y值在第14个位置（索引13）
  return parseFloat(matrixValues[matrixValues.length === 16 ? 13 : 5])
}

onMounted(() => {
  const listEl = document.querySelector('.mp-tabs-list')
  const containerEl = listEl.parentElement
  const containerHeight = containerEl.offsetHeight
  const listHeight = listEl.offsetHeight

  // 如果内容高度小于容器高度，不需要滚动
  if (listHeight <= containerHeight) return

  // 找到当前激活的tab项
  const activeItem = listEl.querySelector('.mp-tabs-item.active')
  if (!activeItem) return

  // 计算目标位置
  const itemTop = activeItem.offsetTop
  const itemHeight = activeItem.offsetHeight

  // 计算最佳滚动位置，使目标项居中显示
  let targetTranslateY = -(itemTop - (containerHeight - itemHeight) / 2)

  // 限制滚动范围
  targetTranslateY = Math.min(Math.max(targetTranslateY, containerHeight - listHeight), 0)

  // 应用滚动位置
  listEl.style.transform = `translateY(${targetTranslateY}px)`

  // 更新滚动状态类
  if (targetTranslateY === 0) {
    containerEl.classList.remove('scroll-up')
  } else if (targetTranslateY === containerHeight - listHeight) {
    containerEl.classList.remove('scroll-down')
  } else {
    containerEl.classList.add('scroll-up')
    containerEl.classList.add('scroll-down')
  }
})
// 根据modelValue.data,通过transformY定位到itemEl
</script>

<style scoped lang="scss">
.mp-tabs-wrap {
  overflow: hidden;
  position: relative;
  transition: opacity 0.15s ease-out;
  border-right: 1px solid var(--border-light);

  &:before,
  &:after {
    pointer-events: none;
    opacity: 0;
    z-index: 10;
    content: '';
    position: absolute;
    left: 0;
    width: 100%;
    height: 20px;
    transition: opacity 0.15s ease-out;
  }

  &:before {
    top: 0;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0));
    box-shadow: inset 0 10px 8px -8px rgba(0, 0, 0, 0.08);
  }

  &:after {
    bottom: 0;
    background: linear-gradient(to top, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0));
    box-shadow: inset 0 -10px 8px -8px rgba(0, 0, 0, 0.08);
  }

  &.scroll-up:before {
    opacity: 1;
  }

  &.scroll-down:after {
    opacity: 1;
  }
}

.mp-tabs-item {
  &:hover,
  &.active {
    color: var(--c-brand);
  }
  &.active {
    border-right: 2px solid var(--c-brand);
  }
}
</style>
