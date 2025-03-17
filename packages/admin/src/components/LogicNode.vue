<template>
  <div class="logic-node" :class="[`logic-node--${isGroup ? 'group' : 'condition'}`]">
    <!-- 组逻辑 -->
    <template v-if="isGroup">
      <div class="logic-node__header">
        <div class="logic-node__header-left">
          <a-select v-model:value="data.operator" style="width: 80px" @change="handleOperatorChange">
            <a-select-option value="and">并且</a-select-option>
            <a-select-option value="or">或者</a-select-option>
          </a-select>
        </div>

        <div class="logic-node__header-right">
          <a-space>
            <a-button type="primary" size="small" @click="addCondition">
              <template #icon><plus-outlined /></template>添加条件
            </a-button>
            <a-button type="primary" size="small" @click="addGroup">
              <template #icon><plus-outlined /></template>添加分组
            </a-button>
            <a-button v-if="!isRoot" type="primary" danger size="small" @click="removeNode">
              <template #icon><delete-outlined /></template>
            </a-button>
          </a-space>
        </div>
      </div>

      <div class="logic-node__body" v-if="data.children && data.children.length">
        <div v-for="(child, index) in data.children" :key="index" class="logic-node__child">
          <div class="logic-node__connector">
            <div class="logic-node__connector-line"></div>
          </div>
          <logic-node :data="child" :parent="data" :index="index" @update:data="updateChild(index, $event)" @remove="removeChild(index)" />
        </div>
      </div>

      <div class="logic-node__empty" v-else>
        <a-empty description="请添加条件或分组" />
      </div>
    </template>

    <!-- 条件节点 -->
    <template v-else>
      <div class="logic-node__condition">
        <div class="logic-node__condition-content">
          <slot name="condition" :condition="data.value" :update-condition="updateCondition">
            <a-card size="small">
              <slot name="condition-content" :condition="data.value">
                <p>请使用 condition slot 自定义条件内容</p>
              </slot>
            </a-card>
          </slot>
        </div>

        <div class="logic-node__condition-actions">
          <a-button type="primary" danger size="small" @click="removeNode">
            <template #icon><delete-outlined /></template>
          </a-button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  parent: {
    type: Object,
    default: null
  },
  index: {
    type: Number,
    default: -1
  }
})

const emit = defineEmits(['update:data', 'remove'])

// 判断是否为组节点
const isGroup = computed(() => {
  return 'children' in props.data
})

// 判断是否为根节点
const isRoot = computed(() => !props.parent)

// 更新当前节点数据
const updateData = (newData) => {
  emit('update:data', newData)
}

// 更新条件节点内容
const updateCondition = (value) => {
  const newData = { ...props.data, value }
  updateData(newData)
}

// 更新子节点数据
const updateChild = (index, childData) => {
  const newChildren = [...props.data.children]
  newChildren[index] = childData

  const newData = {
    ...props.data,
    children: newChildren
  }

  updateData(newData)
}

// 移除子节点
const removeChild = (index) => {
  const newChildren = props.data.children.filter((_, i) => i !== index)

  const newData = {
    ...props.data,
    children: newChildren
  }

  updateData(newData)
}

// 移除当前节点
const removeNode = () => {
  emit('remove')
}

// 添加条件节点
const addCondition = () => {
  const newChildren = [...(props.data.children || [])]
  newChildren.push({
    value: {}
  })

  const newData = {
    ...props.data,
    children: newChildren
  }

  updateData(newData)
}

// 添加分组节点
const addGroup = () => {
  const newChildren = [...(props.data.children || [])]
  newChildren.push({
    operator: 'and',
    children: []
  })

  const newData = {
    ...props.data,
    children: newChildren
  }

  updateData(newData)
}

// 切换逻辑操作符
const handleOperatorChange = (value) => {
  const newData = {
    ...props.data,
    operator: value
  }

  updateData(newData)
}
</script>

<style lang="scss" scoped>
.logic-node {
  width: 100%;

  &--group {
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    background-color: #fafafa;
    padding: 12px;
    margin-bottom: 8px;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    &-left {
      flex-shrink: 0;
    }

    &-right {
      display: flex;
      align-items: center;
    }
  }

  &__body {
    padding-left: 20px;
  }

  &__child {
    position: relative;
    margin-bottom: 8px;
    display: flex;
  }

  &__connector {
    position: relative;
    width: 20px;
    flex-shrink: 0;

    &-line {
      position: absolute;
      top: 0;
      left: 0;
      width: 20px;
      height: 100%;
      border-left: 1px solid #d9d9d9;
      border-bottom: 1px solid #d9d9d9;
      border-bottom-left-radius: 4px;
    }
  }

  &__empty {
    padding: 20px 0;
    display: flex;
    justify-content: center;
  }

  &__condition {
    display: flex;
    align-items: flex-start;

    &-content {
      flex: 1;
      margin-right: 8px;
    }

    &-actions {
      flex-shrink: 0;
    }
  }
}
</style>
