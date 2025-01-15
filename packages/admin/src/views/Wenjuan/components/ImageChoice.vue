<template>
  <VueDraggable v-model="currentItem.options" tag="ul" class="options" ghostClass="ghost-opt">
    <li v-for="(item, index) in currentItem.options" :id="item.id" :key="item.id" class="item" @click.stop="clickOption($event, index)">
      <div class="image-container">
        <ImgUpload v-model="item.imageUrl" width="150px" height="180px" />
      </div>
      <XEditer class="text" :class="{ fillbox: item.fill?.show }" v-model="item.text"></XEditer>
      <icon name="del" class="remove" size="1.5em" title="删除" @click.stop="removeOption(index)" />
    </li>
    <div v-if="currentItem.options.length < 10" @click.stop="addOption" class="add-option" disabled="false" :draggable="false">
      <div class="btn"><icon name="plus" />添加选项</div>
    </div>
  </VueDraggable>

  <!-- 选项设置 -->
  <Teleport to="#__WENJUAN_SETTINGS_CONTENT" v-if="seleItemId === itemId">
    <div class="num">{{ itemIndex + 1 }}. 图片选择题</div>
    <a-tabs v-model:activeKey="tabName" type="card" class="tabs">
      <!-- Tabs:题目设置 -->
      <a-tab-pane key="item" tab="题目设置">
        <div class="prop-item">
          <h4>本题必答</h4>
          <a-switch v-model:checked="currentItem.required" size="small" />
        </div>
      </a-tab-pane>
    </a-tabs>
  </Teleport>
</template>

<router lang="json">
{
  "isRouter": false
}
</router>

<script setup>
import { inject, ref, onMounted, watch, computed, onBeforeMount } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { customAlphabet } from 'nanoid'
import { cleanupOptions } from '../cleanup'
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 6)
const { itemIndex, itemId } = defineProps(['itemIndex', 'itemId'])

const Q = inject('Q')
const seleItemIndex = inject('seleItemIndex')
const seleItemId = inject('seleItemId')
const currentOptionIndex = ref(-1)
// const hoveredOptionIndex = ref(-1)

const currentItem = computed(() => {
  return Q.data.find((item) => item.id === itemId)
})

const tabName = ref('')

watch(currentOptionIndex, () => {
  setTab()
})

function addOption() {
  currentItem.value.options.push({
    text: '选项' + (currentItem.value.options.length + 1),
    id: nanoid()
  })
  currentOptionIndex.value = currentItem.value.options.length - 1
}

function removeOption(index) {
  if (currentItem.value.options.length <= 1) {
    currentItem.value.options[0].text = ''
    currentItem.value.options[0].imageUrl = ''
    return
  }
  currentItem.value.options.splice(index, 1)
  currentOptionIndex.value = -1
  cleanupOptions(Q.data)
}

function clickOption(ev, index) {
  currentOptionIndex.value = index
  const el = ev.currentTarget
  el.classList.add('focus')
  document.addEventListener('mouseup', clickOutSide)

  function clickOutSide(event) {
    event.stopPropagation()
    const targetEl = event.target
    const settingsWrapBox = document.getElementById('__WENJUAN_SETTINGS').getBoundingClientRect()
    const inside = event.clientX > settingsWrapBox.left && event.clientX < settingsWrapBox.right && event.clientY > settingsWrapBox.top && event.clientY < settingsWrapBox.bottom
    if (inside || el.contains(targetEl)) {
      return
    } else {
      callback(el)
    }
  }

  function callback(element) {
    element.classList.remove('focus')
    document.removeEventListener('mouseup', clickOutSide)
    currentOptionIndex.value = -1
  }
  // ev.stopPropagation()
}

function setTab() {
  if (currentOptionIndex.value == -1) {
    tabName.value = 'item'
  } else {
    tabName.value = 'option'
  }
}

onBeforeMount(() => {
  if (!currentItem.value.options) {
    currentItem.value.options = [
      {
        text: '选项1',
        id: nanoid()
      }
    ]
  }
  // qItems.value[itemIndex].options.forEach((option) => {
  //   if (!option.id) {
  //     option.id = nanoid()
  //   }
  // })
  setTab()
})

onMounted(() => {})
</script>

<style scoped lang="scss">
h4 {
  margin: 0;
  padding: 0;
  line-height: 100%;
  font-weight: 400;
  // vertical-align: middle;
}

:has(.ghost-opt) {
  .item:not(.ghost-opt) > * {
    pointer-events: none;
    user-select: none;
  }
  .item {
    .text {
      border-color: transparent !important;
    }
    .remove {
      opacity: 0 !important;
    }
  }
}

.options {
  position: relative;

  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  .item {
    position: relative;
    border: 2px solid transparent;
    &:hover {
      .remove {
        opacity: 1;
      }
      .q-handle {
        display: block;
      }
    }
    &.ghost-opt {
      /* display: none; */
      border-radius: 4px;
      border: 2px dashed var(--c-brand);
      // border: 0;
      box-shadow: none;
      background-color: var(--bg-brand);
      > * {
        opacity: 0;
      }
    }
  }
}

.text {
  width: 150px;
  margin-top: 8px;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 4px;
  background-color: var(--bg-tertiary);
  transition: border 0.15s ease-in-out;
  &:hover {
    border: 1px dashed var(--border-dark);
    // background-color: var(--bg-secondary);
  }
}
.focus .text {
  // border: 1px solid var(--c-brand) !important;
  border-color: transparent !important;
  background-color: var(--bg-tertiary);
}

.add-option {
  border: 2px solid transparent;
  .btn {
    cursor: pointer;
    color: var(--c-brand);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 150px;
    height: 180px;
    border-radius: 4px;
    outline: 1px dashed var(--border-dark);
    &:hover {
      color: var(--c-brand);
      outline: 1px solid var(--c-brand);
    }
  }
}

.remove {
  position: absolute;
  top: -10px;
  right: -10px;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: 50%;
  padding: 2px;
  border: 1px solid var(--border-dark);
  background-color: var(--bg-primary);
  &:link,
  &:visited {
    color: var(--text-secondary);
  }
  opacity: 0;
  transition: opacity 0.15s ease-in-out;
  &:hover,
  &:active {
    border-color: var(--c-red);
    color: var(--c-red);
  }
}

.num {
  margin: 18px 8px;
  font-size: 16px;
  font-weight: 800;
}

.prop-item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  font-size: 12px;
  .help {
    margin-left: 4px;
    color: var(--text-secondary);
  }
}

.fillbox :deep(.ProseMirror) p:last-child {
  &:after {
    content: ' ';
    display: inline-block;
    width: 80px;
    // height: 20px;
    // border-radius: 4px;
    margin-left: 6px;
    border-bottom: 1px solid var(--border-dark);
  }
}

.image-container {
  width: 150px;
  outline: 1px solid var(--border-dark);
  border-radius: 4px;
  &:hover {
    outline: 1px solid var(--c-brand);
  }
}
</style>
