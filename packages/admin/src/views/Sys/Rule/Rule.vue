<template>
  <div class="rule-wrap" :class="{ root: isRoot }" v-if="modelValue">
    <div class="opr" v-if="modelValue.children && modelValue.children.length">
      <div class="btn" @click.stop="toggleOperator">{{ operator.label }}</div>
    </div>
    <div class="children" v-if="modelValue.children && modelValue.children.length">
      <Rule v-for="(child, index) in modelValue.children" :key="index" :modelValue="child" @update:modelValue="(newValue) => updateChild(index, newValue)" />
    </div>
    <div class="exps" v-else-if="modelValue.exp">
      <div class="item">
        <div class="item__wrap">
          <div class="field">{{ modelValue.exp.field }}</div>
          <div class="operator">{{ modelValue.exp.operator }}</div>
          <div class="value" v-html="modelValue.exp.value"></div>
        </div>
        <div class="del" @click.stop="delItem"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const { modelValue, isRoot = false } = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  isRoot: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const operatorOptions = [
  { label: '且', value: 'and' },
  { label: '或', value: 'or' }
]

const operator = computed(() => operatorOptions.find((item) => item.value === modelValue.operator) || operatorOptions[0])

const toggleOperator = () => {
  emit('update:modelValue', {
    ...modelValue,
    operator: operator.value.value === 'and' ? 'or' : 'and'
  })
}

const delItem = () => {
  // 通过发送null值通知父组件删除此项
  emit('update:modelValue', null)
}

// 更新子规则的方法
const updateChild = (index, newValue) => {
  if (!modelValue.children) return

  // 如果新值为null，表示需要删除此子项
  if (newValue === null) {
    const updatedChildren = [...modelValue.children]
    updatedChildren.splice(index, 1)

    const updatedValue = {
      ...modelValue,
      children: updatedChildren
    }

    emit('update:modelValue', updatedValue)
    return
  }

  const updatedChildren = [...modelValue.children]
  updatedChildren[index] = newValue

  const updatedValue = {
    ...modelValue,
    children: updatedChildren
  }

  emit('update:modelValue', updatedValue)
}
</script>

<style scoped lang="scss">
.rule-wrap {
  position: relative;
  display: flex;
  align-items: stretch;
  overflow: hidden;
  // border: 1px solid red;

  &:not(.root) {
    &:only-child::before {
      content: '';
      width: 20px;
      top: 50%;
      border-radius: 0;
      border-bottom: 1px solid var(--border-dark);
    }
    &:not(:only-child):not(:first-child):not(:last-child)::before {
      content: '';
      width: 20px;
      border-radius: 0;
      top: 50%;
      height: 50%;
      border-left: 1px solid var(--border-dark);
      border-bottom: 1px solid var(--border-dark);
      // transform: translateY(-50%);
      // border: 1px solid green;
    }
    &:not(:only-child):not(:first-child):not(:last-child)::after {
      position: absolute;
      content: '';
      width: 20px;
      border-radius: 0;
      top: 50%;
      height: 50%;
      border-left: 1px solid var(--border-dark);
      // border-bottom: 1px solid var(--border-dark);
      // transform: translateY(-50%);
      // border: 1px solid green;
    }
    &:not(:only-child):first-child::before {
      content: '';
      width: 20px;
      border-radius: 8px 0 0 0;
      border-left: 1px solid var(--border-dark);
      border-top: 1px solid var(--border-dark);
      // height: 50%;
      transform: translateY(50%);
      // border: 1px solid green;
    }

    &:not(:only-child):last-child::before {
      content: '';
      width: 20px;
      border-radius: 0 0 0 8px;
      border-left: 1px solid var(--border-dark);
      border-bottom: 1px solid var(--border-dark);
      // height: 50%;
      transform: translateY(-50%);
      // border: 1px solid green;
    }
  }
}

.opr {
  // border: 1px solid green;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  &::after {
    content: '';
    left: 0;
    top: 50%;
    z-index: 2000;
    transform: translateY(-50%);
    width: 20px;
    height: 1px;
    background-color: var(--border-dark);
  }
  // padding-right: 20px;
  // margin-top: 22px; // 垂直居中对齐

  .btn {
    border: 1px solid var(--border-medium);
    background-color: var(--bg-primary);
    border-radius: 4px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    user-select: none;
    position: relative;
    z-index: 2;
    cursor: pointer;
    &:hover {
      background-color: var(--bg-brand);
      border-color: var(--c-brand);
    }
  }

  // &::after {
  //   content: '';
  //   position: absolute;
  //   top: 50%;
  //   right: 0;
  //   width: 20px;
  //   height: 1px;
  //   background-color: var(--border-dark);
  // }
}

.children {
  display: flex;
  flex-direction: column;
  // margin-left: 20px;
}

.exps {
  display: flex;
  flex-direction: column;
  position: relative;

  .item {
    display: flex;
    align-items: center;
    // flex-direction: row;
    // position: relative;
    margin: 10px 0;

    &__wrap {
      background-color: var(--bg-secondary);
      display: flex;
      align-items: center;
      // gap: 10px;
      border: 1px solid var(--border-medium);
      border-radius: 4px;
      padding: 12px;
      // margin-left: 20px;
      position: relative;
      z-index: 1;
    }
  }
  .del {
    border-radius: 100%;
    padding: 10px;
    margin-left: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: 1px solid var(--border-dark);
    background-color: var(--bg-secondary);
    &:hover {
      background-color: var(--bg-brand);
      border-color: var(--c-brand);
      &::before,
      &::after {
        border-color: var(--c-brand);
      }
    }
    &::before {
      content: '';
      position: absolute;
      border-left: 1px solid var(--border-dark);
      width: 1px;
      height: 13px;
      transform: rotate(45deg);
    }
    &::after {
      position: absolute;
      content: '';
      border-right: 1px solid var(--border-dark);
      width: 1px;
      height: 13px;
      transform: rotate(-45deg);
    }
  }
}
</style>
