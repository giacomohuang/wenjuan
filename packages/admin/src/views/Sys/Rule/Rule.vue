<template>
  <div class="rule-wrap" :class="{ root: isRoot }" v-if="modelValue">
    <div class="opr" v-if="modelValue.children && modelValue.children.length">
      <div class="btn" @click.stop="toggleOperator">
        {{ operator.label }}
        <div class="handle">
          <a-tooltip title="在上面添加条件" v-if="!isRoot" :mouseLeaveDelay="0" :mouseEnterDelay="0">
            <div class="add top" @click.stop="addItem('prev')"></div>
          </a-tooltip>
          <a-tooltip title="在下面添加条件" v-if="!isRoot" :mouseLeaveDelay="0" :mouseEnterDelay="0">
            <div v-if="!isRoot" class="add bottom" @click.stop="addItem('next')"></div>
          </a-tooltip>
          <a-tooltip title="添加条件组合" :mouseLeaveDelay="0" :mouseEnterDelay="0">
            <div class="add left" @click.stop="addItem('parent')"></div>
          </a-tooltip>
        </div>
      </div>
    </div>
    <div class="children" v-if="modelValue.children && modelValue.children.length">
      <Rule v-for="(child, index) in modelValue.children" :key="index" :modelValue="child" @update:modelValue="(newValue) => updateChild(index, newValue)" @insert-before="(newItem) => insertBefore(index, newItem)" @insert-after="(newItem) => insertAfter(index, newItem)" />
    </div>
    <div class="exps" v-else-if="modelValue.exp">
      <div class="item">
        <div class="item__wrap">
          <div class="handle">
            <a-tooltip title="在上面添加条件" v-if="!isRoot" :mouseLeaveDelay="0" :mouseEnterDelay="0">
              <div class="add top" @click.stop="addItem('prev')"></div>
            </a-tooltip>
            <a-tooltip title="在下面添加条件" v-if="!isRoot" :mouseLeaveDelay="0" :mouseEnterDelay="0">
              <div v-if="!isRoot" class="add bottom" @click.stop="addItem('next')"></div>
            </a-tooltip>
            <a-tooltip title="添加条件组合" :mouseLeaveDelay="0" :mouseEnterDelay="0">
              <div class="add left" @click.stop="addItem('parent')"></div>
            </a-tooltip>
          </div>
          <div class="item__content">
            <a-dropdown>
              <icon name="logic" class="module-select-trigger"></icon>
              <template #overlay>
                <a-menu>
                  <template v-for="item in moduleOptions" :key="item.value">
                    <a-menu-item :disabled="item.value === modelValue.exp.type" @click="changeModule(item.value)">{{ item.label }}</a-menu-item>
                  </template>
                </a-menu>
              </template>
            </a-dropdown>
            <component :is="module[modelValue.exp.type]" :key="modelValue.exp.id" :modelValue="modelValue.exp" @update:modelValue="(newValue) => updateChild(index, newValue)" />
          </div>
        </div>
        <div class="del" @click.stop="delItem" v-if="!isRoot"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Consumption from './Modules/Consumption.vue'
// import Merchants from './Modules/Merchants.vue'
import { nanoid } from 'nanoid'
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

const module = {
  Consumption
  // Merchants
}

const moduleOptions = [
  { label: '会员消费', value: 'Consumption' }
  // { label: '适用商户', value: 'Merchants' }
]

const emit = defineEmits(['update:modelValue', 'insert-before', 'insert-after'])

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

const changeModule = (type) => {
  emit('update:modelValue', {
    ...modelValue,
    exp: { id: nanoid(), type }
  })
}

// 新增 addItem 功能
const addItem = (position) => {
  // 创建一个新的基础表达式节点
  const newExp = {
    exp: {
      id: Date.now(), // 使用时间戳作为唯一ID
      type: moduleOptions[0].value // 默认类型
      // 其他必要的初始属性
    }
  }

  switch (position) {
    case 'prev': // 在当前项之前添加
      // 通知父组件在当前位置前添加新项
      console.log('prev', newExp, modelValue)
      emit('insert-before', newExp)
      break

    case 'next': // 在当前项之后添加
      // 通知父组件在当前位置后添加新项
      emit('insert-after', newExp)
      break

    case 'parent': // 将当前项与新项作为子项添加到一个新的父项中
      // 当前项是一个表达式节点，需要将其与新节点合并为一个具有子项的节点
      emit('update:modelValue', {
        operator: 'and', // 默认操作符
        children: [
          // 保留当前项
          { ...modelValue },
          // 添加新项
          newExp
        ]
      })
      break
  }
}

// 插入在当前位置之前
const insertBefore = (index, newItem) => {
  if (!modelValue.children) return
  const updatedChildren = [...modelValue.children]
  updatedChildren.splice(index, 0, newItem)
  emit('update:modelValue', {
    ...modelValue,
    children: updatedChildren
  })
}

// 插入在当前位置之后
const insertAfter = (index, newItem) => {
  if (!modelValue.children) return
  const updatedChildren = [...modelValue.children]
  updatedChildren.splice(index + 1, 0, newItem)
  emit('update:modelValue', {
    ...modelValue,
    children: updatedChildren
  })
}

// 更新子规则的方法
const updateChild = (index, newValue) => {
  console.log('updateChild', index, newValue)

  // 处理exp类型的更新
  if (modelValue.exp) {
    emit('update:modelValue', {
      ...modelValue,
      exp: newValue
    })
    return
  }

  // 处理children类型的更新
  if (!modelValue.children) return

  // 创建子规则数组的副本
  const updatedChildren = [...modelValue.children]

  // 如果新值为null，表示需要删除此子项
  if (newValue === null) {
    updatedChildren.splice(index, 1)
  } else {
    updatedChildren[index] = newValue
  }

  // 检查删除后是否只剩一个子元素
  if (updatedChildren.length === 1) {
    // 如果只剩一个子元素，将它的属性合并到父级
    const lastChild = updatedChildren[0]
    emit('update:modelValue', {
      ...lastChild
    })
  } else {
    // 否则正常更新子元素数组
    emit('update:modelValue', {
      ...modelValue,
      children: updatedChildren
    })
  }
}
</script>

<style scoped lang="scss">
.rule-wrap {
  position: relative;
  display: flex;
  align-items: stretch;
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
      height: 50%;
      transform: translateY(100%);
      // border: 1px solid green;
    }

    &:not(:only-child):last-child::before {
      content: '';
      width: 20px;
      border-radius: 0 0 0 8px;
      border-left: 1px solid var(--border-dark);
      border-bottom: 1px solid var(--border-dark);
      height: 50%;
    }
  }
}

.opr {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  &::after {
    content: '';
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 1px;
    background-color: var(--border-dark);
  }

  .btn {
    flex-shrink: 0;
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
    &:hover {
      .handle {
        opacity: 1;
        transition: opacity 0.15s ease-in-out;
      }
    }
  }

  .tools {
    position: absolute;
    z-index: 10;
    // right: 0;
    // top: 0;
    // bottom: -20px;
    transform: translateY(-44px);
    opacity: 0;
    width: 200px;
    transition: opacity 0.15s ease-in-out;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
}

.children {
  display: flex;
  flex-direction: column;
}

.exps {
  display: flex;
  flex-direction: column;
  position: relative;

  .item {
    display: flex;
    align-items: center;
    margin: 10px 0;

    &__wrap {
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-medium);
      border-radius: 4px;
      position: relative;
      transition:
        border 0.15s ease-in-out,
        background-color 0.15s ease-in-out;
      // &:hover {
      //   border: 1px solid var(--c-brand);
      //   // background-color: var(--bg-brand);
      // }
    }

    &__content {
      margin: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 10;
      flex-wrap: nowrap;
    }
    .module-select-trigger {
      cursor: pointer;
      flex-shrink: 0;
      &:hover {
        color: var(--c-brand);
      }
    }

    &:hover {
      .del {
        opacity: 1;
        transition: opacity 0.15s ease-in-out;
      }
      .handle {
        opacity: 1;
        transition: opacity 0.15s ease-in-out;
      }
    }
  }
  .del {
    flex-shrink: 0;
    opacity: 0;
    position: relative;
    border-radius: 100%;
    height: 16px;
    width: 16px;
    margin-left: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: 1px solid var(--border-dark);
    background-color: var(--bg-secondary);
    &:hover {
      // background-color: var(--c-red-100);
      border-color: var(--c-red-500);
      &::before,
      &::after {
        border-color: var(--c-red-500);
      }
    }
    &::before {
      content: '';
      position: absolute;
      border-left: 1px solid var(--border-dark);
      width: 1px;
      height: 80%;
      transform: rotate(45deg);
    }
    &::after {
      position: absolute;
      content: '';
      border-right: 1px solid var(--border-dark);
      width: 1px;
      height: 80%;
      transform: rotate(-45deg);
    }
  }
}

.handle {
  opacity: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  pointer-events: none;

  .add {
    pointer-events: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    border-radius: 100%;
    height: 15px;
    width: 15px;
    border: 1px solid var(--border-dark);
    background-color: var(--bg-secondary);
    cursor: pointer;
    &:before,
    &:after {
      content: '';
      position: absolute;
      width: 9px;
      height: 9px;
      border-color: var(--border-dark);
      border-style: solid;
    }
    &:before {
      border-left-width: 1px;
      left: 6px;
    }
    &:after {
      border-top-width: 1px;
      top: 6px;
    }

    &:hover {
      background-color: var(--bg-brand);
      border-color: var(--c-brand);
      &:before,
      &:after {
        border-color: var(--c-brand);
      }
    }

    &.top {
      top: -8px;
      left: 20px;
      transform: translateX(-50%);
    }
    &.bottom {
      bottom: -8px;
      left: 20px;
      transform: translateX(-50%);
    }
    &.left {
      top: 50%;
      left: -8px;
      transform: translateY(-50%);
    }
  }
}
</style>
