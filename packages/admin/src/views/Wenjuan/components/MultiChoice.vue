<template>
  <VueDraggable v-model="currentItem.options" tag="ul" handle=".q-handle" class="options" ghostClass="ghost-opt">
    <li v-for="(item, index) in currentItem.options" :id="item.id" :key="item.id" class="item" @click.stop="clickOption($event, index)">
      <icon name="handle" class="q-handle" />
      <span class="checkbox"></span>
      <XEditer class="text" :class="{ fillbox: item.fill?.show }" v-model="item.text" :autofocus="index == autoFocusIndex ? true : false"></XEditer>

      <icon name="del" class="ico remove" size="1.5em" title="删除" @click.stop="removeOption(index)"></icon>
    </li>
  </VueDraggable>

  <div @click.stop="addOption" class="add-option"><icon name="plus" />添加选项</div>

  <!-- 选项设置 -->
  <Teleport to="#__WENJUAN_SETTINGS_CONTENT" v-if="seleItemId === itemId">
    <div class="num">{{ itemIndex + 1 }}. 多选题</div>
    <a-tabs v-model:activeKey="tabName" type="card" class="tabs">
      <!-- Tabs:题目设置 -->
      <a-tab-pane key="item" tab="题目设置">
        <div class="prop-item">
          <h4>本题必答</h4>
          <a-switch v-model:checked="currentItem.required" size="small" />
        </div>
        <div class="prop-item">
          <h4>可选范围</h4>
          <div style="display: flex; flex-direction: row; align-items: center">
            <div style="margin-right: 4px">最少</div>
            <a-select v-model:value="currentItem.minRange" placeholder="请选择" size="small" style="width: 70px" @change="fixMaxRange">
              <a-select-option :value="0">不限</a-select-option>
              <a-select-option v-for="i in currentItem.options.length" :key="i" :value="i"> {{ i }}项 </a-select-option>
            </a-select>
            <div style="margin: 0 4px 0 12px">最多</div>
            <a-select v-model:value="currentItem.maxRange" placeholder="请选择" size="small" style="width: 70px">
              <a-select-option :value="0">不限</a-select-option>
              <a-select-option v-for="i in maxRangeArray" :key="i" :value="i"> {{ i }}项 </a-select-option>
            </a-select>
          </div>
        </div>
      </a-tab-pane>
      <!-- Tabs:选项设置 -->
      <a-tab-pane v-if="currentOptionIndex >= 0" :key="'option'" :tab="'第' + (currentOptionIndex + 1) + '项设置'">
        <div class="prop-item">
          <h4>在选项后添加填空</h4>
          <a-switch v-model:checked="currentItem.options[currentOptionIndex].fill.show" size="small" @change="handleFillChange" />
        </div>
        <div class="prop-item" v-if="currentItem.options[currentOptionIndex].fill.show">
          <h4>填空必答</h4>
          <a-switch v-model:checked="currentItem.options[currentOptionIndex].fill.required" size="small" />
        </div>
        <div class="prop-item" v-if="currentItem.options[currentOptionIndex].fill.show">
          <h4>
            填空长度限制<a-tooltip title="为空或填0时，不限字数" placement="top"><icon name="help" class="help" /></a-tooltip>
          </h4>
          <a-input-number v-model:value="currentItem.options[currentOptionIndex].fill.length" min="0" max="500" style="width: 100px" size="small">
            <template #addonAfter>字符</template>
          </a-input-number>
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
const autoFocusIndex = ref(-1)
const tabName = ref('')

const currentItem = computed(() => {
  return Q.data.find((item) => item.id === itemId)
})

const maxRangeArray = computed(() => {
  var arr = []
  for (let i = currentItem.value.minRange; i <= currentItem.value.options.length; i++) {
    if (i) arr.push(i)
  }
  return arr
})

function addOption() {
  currentItem.value.options.push({
    text: '选项' + (currentItem.value.options.length + 1),
    id: nanoid(),
    fill: { show: false }
  })
  currentOptionIndex.value = currentItem.value.options.length - 1
  autoFocusIndex.value = currentOptionIndex.value
}

function removeOption(index) {
  if (currentItem.value.options.length <= 1) {
    currentItem.value.options[0].text = ''
    return
  }
  currentItem.value.options.splice(index, 1)
  if (currentItem.value.minRange > currentItem.value.options.length) {
    currentItem.value.minRange = currentItem.value.options.length
  }
  if (currentItem.value.maxRange > currentItem.value.minRange) {
    currentItem.value.maxRange = currentItem.value.options.length
  }
  currentOptionIndex.value = -1
  cleanupOptions(Q.data)
}

function clickOption(ev, index) {
  console.log('clickOption', ev, index)
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

watch(currentOptionIndex, () => {
  if (currentOptionIndex.value == -1) {
    tabName.value = 'item'
  } else {
    tabName.value = 'option'
  }
})

onBeforeMount(() => {
  if (!currentItem.value.options) {
    currentItem.value.options = [
      {
        text: '选项1',
        id: nanoid(),
        fill: {
          show: false,
          length: null,
          type: 'text',
          required: false
        }
      }
    ]
  }
  tabName.value = 'item'
})

onMounted(() => {})

// // init
// // 赋予默认值

// 可选范围-根据最小值的选择修正最大值
function fixMaxRange() {
  if (currentItem.value.maxRange < currentItem.value.minRange && currentItem.value.maxRange != 0) {
    currentItem.value.maxRange = currentItem.value.minRange
  }
}

function handleFillChange(checked) {
  if (!checked) {
    currentItem.value.options[currentOptionIndex.value].fill.length = null
    currentItem.value.options[currentOptionIndex.value].fill.type = 'text'
    currentItem.value.options[currentOptionIndex.value].fill.required = false
  }
}
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
  padding: 0;
  position: relative;
  .item {
    display: flex;
    margin-bottom: 8px;
    align-items: flex-start;
    border: 2px solid transparent;
    &:hover {
      .text {
        border: 1px dashed var(--border-dark);
        // background-color: var(--bg-secondary);
      }
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

.q-handle {
  // position: absolute;
  cursor: pointer;
  opacity: 0;
  color: var(--text-primary);
  margin-top: 2px;
  flex-shrink: 0;
  // left: 20px;
  &:hover,
  &:active {
    opacity: 1;
  }
}

.checkbox {
  flex-shrink: 0;
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  width: 15px;
  height: 15px;
  margin-left: 4px;
  margin-top: 5px;
}
.text {
  flex-grow: 1;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 4px;
  margin-left: 6px;
  transition: border 0.15s ease-in-out;
}
.focus .text {
  // border: 1px solid var(--c-brand) !important;
  border-color: transparent !important;
  background-color: var(--bg-tertiary);
}

.add-option {
  cursor: pointer;
  width: fit-content;
  color: var(--c-brand);
  padding: 4px 16px;
  border-radius: 4px;
  margin-left: 8px;
  &:hover {
    color: var(--c-brand);
    outline: 1px solid var(--c-brand);
  }
}

.ico {
  // padding-top: 6px;
  cursor: pointer;
  color: var(--text-secondary);
  &:link,
  &:visited {
    color: var(--text-secondary);
  }
  opacity: 0;
  transition: opacity 0.15s ease-in-out;
}

.remove {
  flex-shrink: 0;
  margin-left: 6px;
  padding: 2px;
  border: 1px solid var(--border-dark);
  border-radius: 50%;
  &:hover,
  &:active {
    color: var(--c-red);
    border-color: var(--c-red);
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

// pre {
//   background: var(--bg-secondary);
//   padding: 12px;
//   border-radius: 4px;
//   font-family: monospace;
//   white-space: pre-wrap;
//   word-wrap: break-word;
// }
</style>
