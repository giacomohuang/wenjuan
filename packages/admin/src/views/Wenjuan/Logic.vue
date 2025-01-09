<template>
  <div class="header"><icon name="logic" size="1.2em" />逻辑编辑器</div>
  <div class="viewport" data-simplebar>
    <div class="canvas">
      <svg class="svg-container" ref="svgContainer">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <polyline transform="translate(8, 1) rotate(45) " points="-2 2 4 2 4 8" stroke="#666" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round"></polyline>
          </marker>
        </defs>
        <g class="line-wrap" v-for="(line, index) in lines" :key="'line-' + index" @click.stop="handleLineRemove(index)" :class="{ dragging: draggingLine }">
          <path class="line" :d="generatePath(line)" marker-end="url(#arrow)" :class="{ active: currentLogicIdx !== -1 && (line.from.id === logics[currentLogicIdx]?.id || line.to.id === logics[currentLogicIdx]?.id) }" />
          <path class="line-h" :d="generatePath(line)" />
        </g>
        <path v-if="tempLine" class="line" :d="generatePath(tempLine)" fill="none" stroke-width="2" stroke-dasharray="5,5" />
      </svg>

      <div class="logics">
        <div class="logic" v-for="(item, index) in logics" :data-id="item.id" :key="item.id" draggable="true" :style="{ left: item.logic.x + 'px', top: item.logic.y + 'px' }" @click.stop="setCurrentLogic($event, index)" :class="{ current: currentLogicIdx === index }">
          <div class="title">
            <span class="title-text" :title="getPlainText(item.title)">{{ Q.data.findIndex((itm) => itm.id === item.id) + 1 }}. {{ getPlainText(item.title) }}</span>
            <!-- <a-tag>x:{{ logic.x }}</a-tag> <a-tag>y:{{ logic.y }}</a-tag> -->
            <icon name="remove" size="1em" class="remove" @click.stop="removeLogic(item)" />
          </div>

          <div class="body">
            <template v-if="Q.data.findIndex((itm) => itm.id === item.id) > 0">
              <div class="item action">
                <div class="name">跳转到本题，否则不跳转</div>
                <div class="port input" data-port-id="jump" @mousedown.stop="handlePortDragStart($event, item.id, 'jump', 'input')"></div>
              </div>
              <div class="item action">
                <div class="name">显示本题，否则隐藏</div>
                <div class="port input" data-port-id="show" @mousedown.stop="handlePortDragStart($event, item.id, 'show', 'input')"></div>
              </div>
              <div class="item action">
                <div class="name">隐藏本题，否则显示</div>
                <div class="port input" data-port-id="hide" @mousedown.stop="handlePortDragStart($event, item.id, 'hide', 'input')"></div>
              </div>
              <div class="split-line"></div>
            </template>
            <!------output--------->
            <template v-if="Q.data.findIndex((itm) => itm.id === item.id) < Q.data.length - 1">
              <div class="item condition">
                <div class="name">如果本题显示</div>
                <div class="port output" data-port-id="show" @mousedown.stop="handlePortDragStart($event, item.id, 'show', 'output')"></div>
              </div>
              <div class="item condition">
                <div class="name">如果本题隐藏</div>
                <div class="port output" data-port-id="hide" @mousedown.stop="handlePortDragStart($event, item.id, 'hide', 'output')"></div>
              </div>
              <div class="item condition">
                <div class="name">如果本题已答</div>
                <div class="port output" data-port-id="answered" @mousedown.stop="handlePortDragStart($event, item.id, 'answered', 'output')"></div>
              </div>
              <div class="item condition">
                <div class="name">如果本题未答</div>
                <div class="port output" data-port-id="unanswered" @mousedown.stop="handlePortDragStart($event, item.id, 'unanswered', 'output')"></div>
              </div>
              <div class="split-line"></div>

              <!-- 评分题、NPS题 -->
              <template v-if="['Rate', 'NPS'].includes(item.type)">
                <!-- 添加评分范围配置界面 -->
                <div v-for="range in item.scoreRanges" :key="range.id" class="item">
                  <div class="score-range-item">
                    <a-input-number v-model:value="range.min" :min="item.minScore" :max="range.max" size="small" style="width: 60px" @change="(value) => handleRangeChange(item, range.id, 'min', value)" />
                    <span class="score-range-separator">-</span>
                    <a-input-number v-model:value="range.max" :min="range.min" :max="item.maxScore" size="small" style="width: 60px" @change="(value) => handleRangeChange(item.id, range.id, 'max', value)" />
                    <span class="score-range-separator">分</span>
                    <icon name="remove" size="1em" class="remove-range" @click="removeScoreRange(item, range.id)" />
                  </div>
                  <div class="port output" :data-port-id="range.id" @mousedown.stop="handlePortDragStart($event, item.id, range.id, 'output')"></div>
                </div>

                <a-button style="margin: 8px 0" type="link" size="small" block @click.stop="addScoreRange(item)" :disabled="!canAddRange(item)">添加评分范围</a-button>
              </template>

              <!-- 单选、多选、图片单选 -->
              <template v-if="['SingleChoice', 'MultiChoice', 'ImageChoice'].includes(item.type)">
                <div v-for="option in item.options" :key="option.id" class="item condition">
                  <div class="name">
                    <a-tag v-if="option.select == false" color="red" @click.stop="toggleOptionSelection(option)">未选</a-tag>
                    <a-tag v-else color="blue" @click.stop="toggleOptionSelection(option)">选择</a-tag>
                    <span class="option-text" :title="getPlainText(option.text)">{{ getPlainText(option.text) }}</span>
                  </div>
                  <div class="port output" :data-port-id="option.id" @mousedown.stop="handlePortDragStart($event, item.id, option.id, 'output')"></div>
                </div>
              </template>
            </template>
          </div>
        </div>
      </div>
      <svg class="guide-line-container">
        <g>
          <line v-for="(line, index) in guideLines.x" :key="'x-' + index" class="guide-line vertical" :x1="line.position" :y1="line.start" :x2="line.position" :y2="line.end" />
          <line v-for="(line, index) in guideLines.y" :key="'y-' + index" class="guide-line horizontal" :x1="line.start" :y1="line.position" :x2="line.end" :y2="line.position" />
        </g>
      </svg>
    </div>
  </div>

  <div class="minimap-canvas">
    <div class="minimap-content">
      <div class="mini-logics">
        <div class="mini-logic" v-for="item in logics" :key="item.id" :style="{ left: item.logic.x + 'px', top: item.logic.y + 'px' }"></div>
      </div>
    </div>
    <div class="mini-viewport"></div>
  </div>

  <div class="questions" data-simplebar>
    <div class="question" v-for="(item, index) in Q.data" :class="{ disabled: item._canDrag === false }" :key="item.id" :draggable="item._canDrag !== false" @dragstart="handleQuestionDragStart($event, item)">{{ index + 1 }}. {{ getPlainText(item.title) }}</div>
  </div>
  <!-- <div style="border: 1px solid #ccc; padding: 10px; background-color: #fff; border-radius: 10px; height: 80%; width: 400px; position: absolute; right: 40px; top: 20px; z-index: 1000; overflow: auto">
    {{ currentLogicIdx }}
    <pre><code>{{ JSON.stringify(qItems, null, 2) }}</code></pre>
    <pre><code>{{ JSON.stringify(qItems, null, 2) }}</code></pre>
  </div> -->
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, inject, computed, h } from 'vue'
import 'simplebar'
import '@/assets/simplebar.css'
import Drag from '@/js/dragCanvas'
import { calculateSnap } from '@/js/snapHelper'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 12)

const currentLogicIdx = ref(-1)
const lines = ref([])
const tempLine = ref(null)
const draggingLine = ref(false)
// const conditionModal = ref(false)
const Q = inject('Q')
const logics = computed(() => Q.data.filter((item) => item.logic))

let dragInstance
let isDragging = false

const guideLines = ref({
  x: [],
  y: []
})

const setCurrentLogic = (event, index) => {
  event.preventDefault()
  event.stopPropagation()
  currentLogicIdx.value = index

  document.addEventListener('mouseup', closeSettings)
  function closeSettings(ev) {
    if (ev.target.closest('.logic') || ev.target.closest('.port') || ev.target.closest('.line-wrap') || draggingLine.value) {
      return
    }
    currentLogicIdx.value = -1
    document.removeEventListener('mouseup', closeSettings)
  }
}

const generatePath = (line) => {
  const dx = line.endX - line.startX
  const dy = line.endY - line.startY
  const distance = Math.sqrt(dx * dx + dy * dy)

  if (distance < 100) {
    if (Math.abs(dy) < 20) {
      return `M ${line.startX} ${line.startY} L ${line.endX} ${line.endY}`
    }

    const controlPointOffset = distance * 0.3
    const startControlX = line.startX + controlPointOffset
    const endControlX = line.endX - controlPointOffset

    return `M ${line.startX} ${line.startY} C ${startControlX} ${line.startY}, ${endControlX} ${line.endY}, ${line.endX} ${line.endY}`
  }

  let controlPointOffset = Math.min(Math.abs(dx), distance * 0.5)
  controlPointOffset = Math.max(50, Math.min(controlPointOffset, 200))

  const total = Math.abs(dx) + Math.abs(dy)
  const verticalFactor = total === 0 ? 0 : Math.abs(dy) / total
  const horizontalFactor = total === 0 ? 1 : Math.abs(dx) / total

  let startControlX, endControlX
  if (line.startX > line.endX - 10) {
    startControlX = line.startX - controlPointOffset * (dx >= 0 ? 1 : -1) * horizontalFactor
    endControlX = line.endX + controlPointOffset * (dx >= 0 ? 1 : -1) * horizontalFactor
  } else {
    startControlX = line.startX + controlPointOffset * (dx >= 0 ? 1 : -1) * horizontalFactor
    endControlX = line.endX - controlPointOffset * (dx >= 0 ? 1 : -1) * horizontalFactor
  }

  let startControlY = line.startY - controlPointOffset * verticalFactor * (dy >= 0 ? 0.2 : -0.2)
  let endControlY = line.endY - controlPointOffset * verticalFactor * (dy >= 0 ? 0.2 : -0.2)

  return `M ${line.startX} ${line.startY} C ${startControlX} ${startControlY}, ${endControlX} ${endControlY}, ${line.endX} ${line.endY}`
}

const getPortPosition = (element) => {
  if (!element) return { x: 0, y: 0 }

  try {
    const rect = element.getBoundingClientRect()
    const canvas = document.querySelector('.canvas')
    if (!canvas) return { x: 0, y: 0 }

    const canvasRect = canvas.getBoundingClientRect()

    const x = rect.left - canvasRect.left + rect.width / 2
    const y = rect.top - canvasRect.top + rect.height / 2

    return { x, y }
  } catch (error) {
    return { x: 0, y: 0 }
  }
}

const findPort = (event) => {
  const elements = document.elementsFromPoint(event.clientX, event.clientY)
  for (const element of elements) {
    if (element.classList.contains('port')) {
      const logicElement = element.closest('.logic')
      if (!logicElement) continue

      const id = logicElement.getAttribute('data-id')
      const type = element.classList.contains('input') ? 'input' : 'output'
      const portId = element.getAttribute('data-port-id')
      return { id, portId, type }
    }
  }
  return null
}

const isValidCondition = (fromPort, toPort) => {
  if (!fromPort || !toPort || fromPort.type === toPort.type || fromPort.id === toPort.id) {
    return false
  }
  const outputPort = fromPort.type === 'output' ? fromPort : toPort
  const inputPort = fromPort.type === 'input' ? fromPort : toPort

  // 检查output端口是否已经连接到其他input端口
  const existingOutput = lines.value.find((line) => {
    return line.from.id === outputPort.id && line.from.portId === outputPort.portId
  })

  if (existingOutput) {
    return false // 如果output端口已经有连接，则不允许再连接
  }

  // 检查是否已存在相同的连接
  const existingConnection = lines.value.find((line) => {
    return line.from.id === outputPort.id && line.from.portId === outputPort.portId && line.to.id === inputPort.id && line.to.portId === inputPort.portId
  })

  const fromIndex = Q.data.findIndex((item) => item.id === fromPort.id)
  const toIndex = Q.data.findIndex((item) => item.id === toPort.id)

  // 如果是output到input的连接,检查索引关系
  if (fromPort.type === 'output' && toPort.type === 'input') {
    if (fromIndex > toIndex) {
      return false // 不允许从大索引连接到小索引
    }
  }
  // 如果是从input到output的连接,检查索引关系
  else if (fromPort.type === 'input' && toPort.type === 'output') {
    if (toIndex > fromIndex) {
      return false // 不允许从大索引连接到小索引
    }
  }
  return !existingConnection
}

// 处理端口拖拽开始
const handlePortDragStart = (event, id, portId, type) => {
  event.preventDefault()
  event.stopPropagation()
  draggingLine.value = true
  const portElement = event.target
  const portPos = getPortPosition(portElement)

  // 根据端口类型设置同的偏移量
  const xOffset = type === 'input' ? -10 : 10

  tempLine.value = {
    startX: type === 'output' ? portPos.x + xOffset : portPos.x + xOffset,
    startY: portPos.y,
    endX: type === 'output' ? portPos.x + xOffset : portPos.x + xOffset,
    endY: portPos.y,
    from: type === 'output' ? { id, portId, type } : null,
    to: type === 'output' ? null : { id, portId, type }
  }
  // console.log(tempLine.value)

  window.addEventListener('mousemove', handlePortDragMove)
  window.addEventListener('mouseup', handlePortDragEnd)
}

// const addCondition = (type, id) => {
//   const index = qItems.value.findIndex((item) => item.id === id)
//   currentLogicIdx.value = index
//   const qItem = qItems.value.find((item) => item.id === id)
//   conditionModal.value = true

//   if (!qItem.logic.conditions) {
//     qItem.logic.conditions = []
//   }
//   qItem.logic.conditions.push({
//     id: nanoid(),
//     conditionType: 'select',
//     conditionValue: null
//   })

//   currentCondition.value = qItem.logic.conditions[qItem.logic.conditions.length - 1]
// }

// 处理端口拖拽移动
const handlePortDragMove = (event) => {
  event.preventDefault()
  event.stopPropagation()

  if (!tempLine.value) return

  const canvas = document.querySelector('.canvas')
  const canvasRect = canvas.getBoundingClientRect()

  // 计算鼠标位置，移除缩放因素
  const mouseX = event.clientX - canvasRect.left
  const mouseY = event.clientY - canvasRect.top

  // 根据是从输入端口还是输出端口拖动来更新不同的端点
  if (tempLine.value.from) {
    // 从输出端口拖动
    tempLine.value.endX = mouseX - 10
    tempLine.value.endY = mouseY
  } else {
    // 从输入端口拖动
    tempLine.value.startX = mouseX + 10
    tempLine.value.startY = mouseY
  }
}

// 改端口拖拽结束函数
const handlePortDragEnd = (event) => {
  event.preventDefault()
  event.stopPropagation()
  draggingLine.value = false
  if (!tempLine.value) return

  const targetPort = findPort(event)

  if (targetPort) {
    const fromPort = tempLine.value.from || targetPort
    const toPort = tempLine.value.from ? targetPort : tempLine.value.to

    if (isValidCondition(fromPort, toPort)) {
      // 获取正确的端口元素
      const fromElement = fromPort.type === 'input' ? document.querySelector(`.logic[data-id="${fromPort.id}"] .port.input[data-port-id="${fromPort.portId}"]`) : document.querySelector(`.logic[data-id="${fromPort.id}"] .port.output[data-port-id="${fromPort.portId}"]`)

      const toElement = toPort.type === 'input' ? document.querySelector(`.logic[data-id="${toPort.id}"] .port.input[data-port-id="${toPort.portId}"]`) : document.querySelector(`.logic[data-id="${toPort.id}"] .port.output[data-port-id="${toPort.portId}"]`)

      if (fromElement && toElement) {
        const fromPos = getPortPosition(fromElement)
        const toPos = getPortPosition(toElement)

        lines.value.push({
          startX: fromPos.x + 10,
          startY: fromPos.y,
          endX: toPos.x - 10,
          endY: toPos.y,
          from: fromPort,
          to: toPort
        })

        // 保存连接关系到源节点的 conditions 数组中
        const sourceItem = logics.value.find((l) => l.id === fromPort.id)
        if (sourceItem) {
          if (!sourceItem.logic.conditions) {
            sourceItem.logic.conditions = []
          }
          sourceItem.logic.conditions.push({
            fromPortId: fromPort.portId,
            toLogicId: toPort.id,
            toPortId: toPort.portId
          })
        }
      }
    }
  }

  tempLine.value = null
  window.removeEventListener('mousemove', handlePortDragMove)
  window.removeEventListener('mouseup', handlePortDragEnd)
}

// 修改节点拖拽函数
const handleLogicDrag = (event) => {
  event.preventDefault()
  event.stopPropagation()

  const targetEl = event.target.closest('.logic')
  if (!targetEl) return

  isDragging = false

  const id = targetEl.getAttribute('data-id')

  // 记录初始位置，移除缩放因素
  const startX = event.clientX
  const startY = event.clientY
  const initialLeft = targetEl.offsetLeft
  const initialTop = targetEl.offsetTop

  // 添加全局事件监听
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onMouseUp)

  function onMove(event) {
    event.stopPropagation()
    event.preventDefault()

    // 计算移动距离，移除缩放因素
    const deltaX = event.clientX - startX
    const deltaY = event.clientY - startY

    // 只有移动距离超过5像素认为拖拽
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      isDragging = true
    }

    // 计算新位置
    let newX = initialLeft + deltaX
    let newY = initialTop + deltaY

    // 限制最小值为0
    newX = Math.max(0, newX)
    newY = Math.max(0, newY)

    // 获取当前节点元素
    const currentLogicEl = document.querySelector(`.logic[data-id="${id}"]`)
    const currentRect = currentLogicEl.getBoundingClientRect()

    // 准备当前节点信息
    const currentLogic = {
      id: id,
      x: newX,
      y: newY,
      width: currentRect.width,
      height: currentRect.height
    }

    // 准备其他节点信息
    const otherLogics = logics.value
      .filter((item) => item.id !== id)
      .map((item) => {
        const el = document.querySelector(`.logic[data-id="${item.id}"]`)
        const rect = el.getBoundingClientRect()
        return {
          id: item.id,
          x: item.logic.x,
          y: item.logic.y,
          width: rect.width,
          height: rect.height
        }
      })

    // 计算吸附位置和辅助线
    const { snapX, snapY, guideLines: newGuideLines } = calculateSnap(currentLogic, otherLogics)

    // 应用吸附位置
    if (snapX !== null) {
      newX = snapX
    }
    if (snapY !== null) {
      newY = snapY
    }

    // 更新辅助线
    guideLines.value = newGuideLines

    // 更新节点位置
    const logic = Q.data.find((n) => n.id === id).logic
    if (logic) {
      logic.x = newX
      logic.y = newY
      updateLinesPosition(id)
    }
  }

  function onMouseUp() {
    targetEl.classList.remove('dragging')
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onMouseUp)
    resizeCanvas()

    // 如果发生了拖拽，阻止click事件
    if (isDragging) {
      event.preventDefault()
      event.stopPropagation()
      // 止后续的click事件
      const clickHandler = (e) => {
        e.preventDefault()
        e.stopPropagation()
        document.removeEventListener('click', clickHandler, true)
      }
      document.addEventListener('click', clickHandler, true)
    }

    // 清空辅助线
    guideLines.value = { x: [], y: [] }
  }
}

// 调整画布大小
const resizeCanvas = () => {
  // 获取canvas元素
  const canvas = document.querySelector('.canvas')
  if (!canvas) return

  // 取当前画尺寸
  const currentWidth = parseInt(canvas.style.width) || 2000
  const currentHeight = parseInt(canvas.style.height) || 2000

  // 找出所有节点中最右和最下的位置
  let maxX = 2000 // 保持最小宽度
  let maxY = 2000 // 持最小高度

  logics.value.forEach((item) => {
    const logicBox = document.querySelector(`.logic[data-id="${item.id}"]`).getBoundingClientRect()
    const rightEdge = item.logic.x + logicBox.width
    const bottomEdge = item.logic.y + logicBox.height
    maxX = Math.max(maxX, rightEdge + 200)
    maxY = Math.max(maxY, bottomEdge + 200)
  })
  // console.log(maxX, maxY)

  // // 使用当前尺寸和计算尺寸中的较大值
  // maxX = Math.max(maxX, currentWidth)
  // maxY = Math.max(maxY, currentHeight)

  canvas.style.width = `${maxX}px`
  canvas.style.height = `${maxY}px`
}

// 添加更新连接线位置的工具函数
const updateLinesPosition = (id) => {
  lines.value.forEach((line, index) => {
    const updatedLine = { ...line }
    let needsUpdate = false

    // 更新起点（如果连接线从该节点开始）
    if (line.from.id === id) {
      // 修改选择器以精确匹配端口ID
      const fromElement = document.querySelector(`.logic[data-id="${id}"] .${line.from.type}.port[data-port-id="${line.from.portId}"]`)

      if (fromElement) {
        const pos = getPortPosition(fromElement)
        updatedLine.startX = pos.x + (line.from.type === 'output' ? 10 : -10)
        updatedLine.startY = pos.y
        needsUpdate = true
      }
    }

    // 更新点（如果连接线连到该节点）
    if (line.to.id === id) {
      // 修改选择器以精确匹配端口ID
      const toElement = document.querySelector(`.logic[data-id="${id}"] .${line.to.type}.port[data-port-id="${line.to.portId}"]`)

      if (toElement) {
        const pos = getPortPosition(toElement)
        updatedLine.endX = pos.x + (line.to.type === 'output' ? 10 : -10)
        updatedLine.endY = pos.y
        needsUpdate = true
      }
    }

    // 如果位置有更新，则更新连接线
    if (needsUpdate) {
      lines.value[index] = updatedLine
    }
  })
}

// 删除逻辑节点
const removeLogic = (qItem) => {
  currentLogicIdx.value = -1
  // 删除与该节点相关的所有连接线
  lines.value = lines.value.filter((line) => line.from.id !== qItem.id && line.to.id !== qItem.id)
  // 删除节点
  qItem._canDrag = true

  // 删除逻辑节点数据
  delete qItem.logic
  // 删除评分范围选项
  delete qItem.scoreRanges
  // 删除连接到该节点的condition
  logics.value.forEach((item) => {
    if (item.logic.conditions) {
      item.logic.conditions = item.logic.conditions.filter((conn) => conn.toLogicId !== qItem.id)
    }
  })
  // 删除options中的select
  if (qItem.options) {
    qItem.options.forEach((option) => {
      delete option.select
    })
  }
  // 更新画布大小
  nextTick(() => {
    resizeCanvas()
  })
}

// 添加问题拖拽开始处理函数
const handleQuestionDragStart = (event, qItem) => {
  event.stopPropagation()

  event.dataTransfer.effectAllowed = 'copy'
  const itemEl = event.target.closest('.question')
  const itemRect = itemEl.getBoundingClientRect()
  const startX = event.clientX
  const startY = event.clientY
  const initialLeft = itemRect.left
  const initialTop = itemRect.top

  const canvasEl = document.querySelector('.canvas')

  canvasEl.addEventListener('dragover', dragOver)
  canvasEl.addEventListener('drop', drop)

  // 加画布拖拽相关处理函数
  function dragOver(ev) {
    ev.preventDefault()
    ev.dataTransfer.dropEffect = 'copy'
  }

  function drop(ev) {
    ev.preventDefault()
    // ev.stopPropagation()
    // console.log('drop', ev.clientX, ev.clientY)
    if (ev.clientX > window.innerWidth || ev.clientY > window.innerHeight || ev.clientX < 0 || ev.clientY < 0) {
      return
    }

    qItem._canDrag = false

    // 获取滚动容器
    const scrollContainer = document.querySelector('.viewport .simplebar-content-wrapper')
    const scrollLeft = scrollContainer?.scrollLeft || 0
    const scrollTop = scrollContainer?.scrollTop || 0
    const canvasRect = canvasEl.getBoundingClientRect()
    const canvasOffsetX = canvasRect.left > 0 ? canvasRect.left : 0
    console.log('canvasOffsetX', canvasOffsetX)

    // 考虑滚动条
    const deltaX = ev.clientX - startX + scrollLeft
    const deltaY = ev.clientY - startY + scrollTop

    // 计算放置位置
    const dropX = initialLeft + deltaX - canvasOffsetX
    const dropY = initialTop + deltaY

    // 创建新点,只保存问题ID和位置信息
    const logic = {
      x: dropX,
      y: dropY,
      conditions: []
    }

    qItem.logic = logic
    canvasEl.removeEventListener('dragover', dragOver)
    canvasEl.removeEventListener('drop', drop)

    nextTick(() => {
      resizeCanvas()
    })
  }
}

const toggleOptionSelection = (option) => {
  if (option.select == null) {
    option.select = false
  } else {
    option.select = !option.select
  }
}

// 添加初始化连接线的函数
const initializeLines = () => {
  // 清空现有连接线
  lines.value = []

  // 遍历所有逻辑节点
  logics.value.forEach((item) => {
    // 检查节点是否有连接关系数据
    if (item.logic.conditions) {
      item.logic.conditions.forEach((condition) => {
        // 获起始端口元素
        const fromElement = document.querySelector(`.logic[data-id="${item.id}"] .port.output[data-port-id="${condition.fromPortId}"]`)

        // 获标口元素
        const toElement = document.querySelector(`.logic[data-id="${condition.toLogicId}"] .port.input[data-port-id="${condition.toPortId}"]`)

        if (fromElement && toElement) {
          const fromPos = getPortPosition(fromElement)
          const toPos = getPortPosition(toElement)

          // 创建连接线
          lines.value.push({
            startX: fromPos.x + 10,
            startY: fromPos.y,
            endX: toPos.x - 10,
            endY: toPos.y,
            from: {
              id: item.id,
              portId: condition.fromPortId,
              type: 'output'
            },
            to: {
              id: condition.toLogicId,
              portId: condition.toPortId,
              type: 'input'
            }
          })
        }
      })
    }
  })
}

// 删除连接线
const handleLineRemove = (index) => {
  const line = lines.value[index]

  // 从源节点的 conditions 数组中删除对应的连接
  const sourceItem = logics.value.find((l) => l.id === line.from.id)
  if (sourceItem && sourceItem.logic.conditions) {
    sourceItem.logic.conditions = sourceItem.logic.conditions.filter((conn) => !(conn.fromPortId === line.from.portId && conn.toLogicId === line.to.id && conn.toPortId === line.to.portId))
  }

  // 删除连接线
  lines.value.splice(index, 1)
}

// 移除HTML标记，获取纯文本
const getPlainText = (html) => {
  // 移除HTML标记，获取纯文本
  const plainText = html.replace(/<[^>]*>?/gm, '')
  return plainText
}

const handleResizeWindow = () => {
  resizeMinimap()
}

const resizeMinimap = () => {
  const viewport = document.querySelector('.viewport .simplebar-content-wrapper')
  const canvas = document.querySelector('.canvas')
  const minimap = document.querySelector('.minimap-canvas')
  const minimapViewport = document.querySelector('.mini-viewport')
  const minimapContent = document.querySelector('.minimap-content')

  if (!viewport || !canvas || !minimap || !minimapViewport || !minimapContent) return

  // 计算缩放比
  const scaleX = minimap.clientWidth / canvas.offsetWidth
  const scaleY = minimap.clientHeight / canvas.offsetHeight
  const scale = Math.min(scaleX, scaleY)

  // 设置minimap内容尺寸和缩放
  minimapContent.style.width = canvas.offsetWidth + 'px'
  minimapContent.style.height = canvas.offsetHeight + 'px'
  minimapContent.style.transform = `scale(${scale})`
  minimapContent.style.transformOrigin = '0 0'

  // 计算居中位置
  const scaledWidth = canvas.offsetWidth * scale
  const scaledHeight = canvas.offsetHeight * scale
  const leftOffset = (minimap.clientWidth - scaledWidth) / 2
  const topOffset = (minimap.clientHeight - scaledHeight) / 2

  minimapContent.style.left = `${leftOffset}px`
  minimapContent.style.top = `${topOffset}px`

  // 更新视口位置和大小
  minimapViewport.style.width = viewport.clientWidth * scale + 'px'
  minimapViewport.style.height = viewport.clientHeight * scale + 'px'
  minimapViewport.style.left = viewport.scrollLeft * scale + leftOffset + 'px'
  minimapViewport.style.top = viewport.scrollTop * scale + topOffset + 'px'
}

// 修改 initMinimapDrag 函数
const initMinimapDrag = () => {
  const minimap = document.querySelector('.minimap-canvas')
  const minimapViewport = document.querySelector('.mini-viewport')
  const viewport = document.querySelector('.viewport .simplebar-content-wrapper')
  const canvas = document.querySelector('.canvas')
  const minimapContent = document.querySelector('.minimap-content')

  if (!minimap || !minimapViewport || !viewport || !canvas || !minimapContent) return

  let isDragging = false
  let startX = 0
  let startY = 0
  let startScrollLeft = 0
  let startScrollTop = 0

  const onMouseDown = (e) => {
    isDragging = true
    const minimapRect = minimap.getBoundingClientRect()
    const scale = minimap.clientWidth / canvas.offsetWidth

    // 计算偏移量
    const leftOffset = parseFloat(minimapContent.style.left) || 0
    const topOffset = parseFloat(minimapContent.style.top) || 0

    // 记录起始位置和滚动位置
    startX = e.clientX
    startY = e.clientY
    startScrollLeft = viewport.scrollLeft
    startScrollTop = viewport.scrollTop

    // 如果点击的是 minimap 而不是 viewport，直接跳转到点击位置
    if (e.target === minimap) {
      const targetX = (e.clientX - minimapRect.left - leftOffset) / scale - viewport.clientWidth / 2
      const targetY = (e.clientY - minimapRect.top - topOffset) / scale - viewport.clientHeight / 2

      viewport.scrollLeft = targetX
      viewport.scrollTop = targetY

      // 更新起始位置
      startScrollLeft = viewport.scrollLeft
      startScrollTop = viewport.scrollTop
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const onMouseMove = (e) => {
    if (!isDragging) return
    e.preventDefault()

    const scale = minimap.clientWidth / canvas.offsetWidth
    const deltaX = (e.clientX - startX) / scale
    const deltaY = (e.clientY - startY) / scale

    // 基于起始滚动位置计算新的滚动位置
    viewport.scrollLeft = startScrollLeft + deltaX
    viewport.scrollTop = startScrollTop + deltaY
  }

  const onMouseUp = () => {
    isDragging = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  minimap.addEventListener('mousedown', onMouseDown)
}

// 监听滚动事件更新minimap
const initMinimapScroll = () => {
  const viewport = document.querySelector('.viewport .simplebar-content-wrapper')
  if (!viewport) return

  viewport.addEventListener('scroll', () => {
    resizeMinimap()
  })
}

const addScoreRange = (qItem) => {
  if (!qItem.scoreRanges) {
    qItem.scoreRanges = []
  }

  // 找到未覆盖的区间
  const coveredRanges = qItem.scoreRanges.sort((a, b) => a.min - b.min)
  let start = qItem.minScore

  for (const range of coveredRanges) {
    if (range.min > start) {
      // 找到空隙
      const newRange = {
        id: nanoid(), // 添加唯一id
        min: start,
        max: Math.min(range.min - 1, qItem.maxScore)
      }
      qItem.scoreRanges.push(newRange)
      qItem.scoreRanges.sort((a, b) => a.min - b.min) // 保持有序

      // 确保 conditions 数组存在
      if (!qItem.conditions) {
        qItem.conditions = []
      }

      nextTick(() => {
        // 等待 DOM 更新后再更新连接线位置
        updateLinesPosition(qItem.id)
      })
      return
    }
    start = range.max + 1
  }

  // 如果还有剩余空间
  if (start <= qItem.maxScore) {
    const newRange = {
      id: nanoid(), // 添加唯一id
      min: start,
      max: qItem.maxScore
    }
    qItem.scoreRanges.push(newRange)
    qItem.scoreRanges.sort((a, b) => a.min - b.min) // 保持有序

    // 确保 conditions 数组存在
    if (!qItem.conditions) {
      qItem.conditions = []
    }

    nextTick(() => {
      // 等待 DOM 更新后再更新连接线位置
      updateLinesPosition(qItem.id)
    })
  }
}

// 检查范围是否重叠
const isRangeOverlap = (range1, range2) => {
  return !(range1.max < range2.min || range1.min > range2.max)
}

// 验证并调整范围值
const validateRange = (range, ranges, minScore, maxScore, excludeId = null) => {
  // 基本范围验证
  let min = Math.max(minScore, range.min)
  let max = Math.min(maxScore, range.max)

  // 确保min不大于max（允许相等）
  if (min > max) {
    max = min
  }

  // 检查是否与其他范围重叠
  const otherRanges = ranges.filter((r) => r.id !== excludeId)
  for (const other of otherRanges) {
    if (isRangeOverlap({ min, max }, other)) {
      // 如果重叠，调整范围
      if (min < other.min) {
        max = other.min - 1
      } else {
        min = other.max + 1
      }
    }
  }

  return { min, max }
}

const removeScoreRange = (qItem, rangeId) => {
  // 删除与该评分范围相关的conditions
  qItem.logic.conditions = qItem.logic.conditions.filter((condition) => condition.fromPortId !== rangeId)
  // 删除实际的连接线
  lines.value = lines.value.filter((line) => line.from.portId !== rangeId)
  qItem.scoreRanges = qItem.scoreRanges.filter((range) => range.id !== rangeId)
  nextTick(() => {
    updateLinesPosition(qItem.id)
  })
}

const canAddRange = (qItem) => {
  if (!qItem.scoreRanges || qItem.scoreRanges.length === 0) return true

  // 检查是否还有未覆盖的区间
  const coveredRanges = qItem.scoreRanges.sort((a, b) => a.min - b.min)
  let start = qItem.minScore

  for (const range of coveredRanges) {
    if (range.min > start) return true
    start = range.max + 1
  }

  return start <= qItem.maxScore
}

// 处理范围变化
const handleRangeChange = (qItem, rangeId, type, value) => {
  const range = qItem.scoreRanges?.find((r) => r.id === rangeId)
  if (!range) return

  const newRange = { ...range }
  newRange[type] = value

  // 验证并调整范围
  const validatedRange = validateRange(newRange, qItem.scoreRanges, qItem.minScore, qItem.maxScore, rangeId)

  // 更新范围值
  range.min = validatedRange.min
  range.max = validatedRange.max

  // 重新排序范围
  qItem.scoreRanges.sort((a, b) => a.min - b.min)

  // 更新连接线位置
  nextTick(() => {
    updateLinesPosition(qItem.id)
  })
}

onMounted(async () => {
  await nextTick()
  const logicsEl = document.querySelector('.logics')
  logicsEl.addEventListener('mousedown', handleLogicDrag)
  window.addEventListener('resize', handleResizeWindow)

  dragInstance = new Drag(document.querySelector('.viewport .simplebar-content-wrapper'))

  // 初始化时滚动到画布中心
  const scrollContainer = document.querySelector('.viewport .simplebar-content-wrapper')
  if (scrollContainer) {
    const viewportWidth = scrollContainer.clientWidth
    const viewportHeight = scrollContainer.clientHeight
    const canvasWidth = 2000
    const canvasHeight = 2000

    const scrollLeft = (canvasWidth - viewportWidth) / 2
    const scrollTop = (canvasHeight - viewportHeight) / 2

    scrollContainer.scrollLeft = scrollLeft
    scrollContainer.scrollTop = scrollTop
  }
  // 初始化连接线
  initializeLines()
  // 初始化minimap
  resizeMinimap()
  initMinimapDrag()
  initMinimapScroll()
})

onUnmounted(() => {
  const logicsEl = document.querySelector('.logics')
  logicsEl?.removeEventListener('mousedown', handleLogicDrag)
})
</script>

<style scoped lang="scss">
.header {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  z-index: 1000;
  width: 100%;
  gap: 4px;
  text-align: center;
  font-size: 1.2em;
  background-image: radial-gradient(transparent 1px, var(--bg-secondary) 1px);
  background-size: 4px 4px;
  backdrop-filter: saturate(50%) blur(4px);
  border-bottom: 1px solid var(--border-medium);
}

.viewport {
  padding: 0;
  margin: 0;
  height: 100vh;
  width: 100vw;
  position: relative;
  cursor: grab;
  background: var(--bg-secondary);
  overflow: auto;
  display: flex;
  align-items: center;
}

.canvas {
  display: block;
  position: relative;
  min-width: 2000px;
  min-height: 2000px;
  width: fit-content;
  height: fit-content;
  margin: auto;
  // margin-left: 200px;
  transform-origin: center center;
  background-image: radial-gradient(circle, var(--border-dark) 0.5px, transparent 0.5px);
  background-size: 15px 15px;
  background-position: 20px 20px;
  background-color: var(--bg-primary);
  will-change: transform;
  border: 1px solid var(--border-medium);
}

.logic {
  position: absolute;
  left: 0;
  top: 0;
  width: 250px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: move;
  user-select: none;
  z-index: 2;
  transform-origin: center;
  transition: transform 0.1s ease;
  will-change: transform;

  &.current {
    border-color: var(--c-brand);
    z-index: 10;

    .title {
      background: var(--bg-brand);
      border-bottom: 1px solid var(--c-brand);
    }
  }

  .title {
    padding: 12px 8px;
    border-radius: 4px 4px 0 0;
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border-medium);
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title-text {
      flex: 1;
      width: 100%;
      text-wrap: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .remove {
    cursor: pointer;
    color: var(--text-tertiary);
    // border-radius: 50%;
    // border: 1px solid transparent;
    transition: all 0.15s ease;

    &:hover {
      color: var(--text-primary);
      // border-color: var(--c-r);
    }
  }

  .body {
    display: flex;
    flex-direction: column;

    .item {
      position: relative;
      padding: 8px 12px;

      &:not(:last-child) {
        border-bottom: 1px solid var(--border-medium);
      }
    }

    .score-range-separator {
      margin: 0 8px;
      color: var(--text-secondary);
    }

    .score-range-item {
      display: flex;
      align-items: center;
    }

    .action {
      font-style: italic;
    }

    .name {
      display: flex;
      align-items: center;
      // padding: 0 8px;
    }

    .option-text {
      flex: 1;
      width: 100%;
      text-wrap: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .split-line {
      border-bottom: 1px solid var(--border-medium);
      height: 4px;
      background: var(--bg-tertiary);
    }

    .add-condition {
      padding: 8px;
      color: var(--text-secondary);
      cursor: pointer;
      text-align: center;
      transition: all 0.2s ease;

      &:hover {
        color: var(--c-brand);
        background: var(--bg-secondary);
      }
    }
  }
}

.port {
  opacity: 1;
  position: absolute;
  width: 12px;
  height: 12px;
  background: #666;
  border-radius: 50%;
  cursor: pointer;
  transition: 0.2s ease;
  transform: translateY(-50%);
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-50%) scale(1.2);
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.3);
  }

  &.input {
    left: -6px;
    top: 50%;

    &:hover {
      background: #2196f3;
    }

    &.port-hover {
      background: #2196f3;
      transform: translateY(-50%) scale(1.2);
      box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.3);
    }
  }

  &.output {
    right: -6px;
    top: 50%;

    &:hover {
      background: #4caf50;
    }

    &.port-hover {
      background: #4caf50;
      transform: translateY(-50%) scale(1.2);
      box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.3);
    }
  }
}

.line-wrap {
  cursor: pointer;

  .line-h {
    stroke-width: 10;
    stroke: transparent;
    pointer-events: stroke;
    fill: none;
  }

  &:not(&.dragging):hover {
    .line {
      stroke: #ff4d4f;
      stroke-dasharray: 5, 5;
      animation: dash 1s linear infinite;
    }
  }
}

.line {
  stroke: #666;
  stroke-width: 2;
  cursor: pointer;
  transition: stroke 0.2s ease;
  fill: none;
  pointer-events: stroke;
  stroke-linecap: round;
  paint-order: stroke;
  stroke-linejoin: round;

  &.active {
    stroke: var(--c-brand);
    stroke-dasharray: 5, 5;
    animation: dash 1s linear infinite;
  }
}

.add-logic {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 8px 16px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.svg-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  will-change: transform;
}

/* 添加箭头样式 */
#arrow {
  overflow: visible;
}

@keyframes dash {
  from {
    stroke-dashoffset: 10;
  }

  to {
    stroke-dashoffset: 0;
  }
}

.guide-line-container {
  z-index: 100;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.guide-line {
  stroke: #1890ff;
  stroke-width: 1;
  pointer-events: none;
  shape-rendering: crispEdges;
}

.questions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: absolute;
  top: 44px;
  left: 0;
  // max-height: 50%;
  height: calc(100% - 44px);
  width: 200px;
  border-right: 1px solid var(--border-medium);
  // border-radius: 4px;
  background-image: radial-gradient(transparent 1px, var(--bg-secondary) 1px);
  background-size: 4px 4px;
  backdrop-filter: saturate(50%) blur(4px);
  user-select: none;
  box-shadow: 1px 1px 2px 2px var(--border-light);

  // padding: 8px;

  .question {
    padding: 12px 8px;
    // min-width: 0;

    border-radius: 4px;
    text-wrap: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    // background: var(--bg-secondary);

    &:hover:not(&.disabled) {
      cursor: grab;
      background: var(--bg-brand);
    }

    &:active:not(&.disabled) {
      cursor: grabbing;
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.minimap-canvas {
  position: absolute;
  bottom: 20px;
  left: 220px;
  width: 200px;
  height: 150px;
  border: 1px solid var(--border-medium);
  border-radius: 4px;
  background: var(--bg-primary);
  overflow: hidden;
  cursor: pointer;
}

.minimap-content {
  position: absolute;
  transform-origin: 0 0;
  will-change: transform;
  background: var(--bg-tertiary);
}

.mini-logics {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.mini-logic {
  position: absolute;
  width: 160px;
  height: 40px;
  background: var(--c-brand);
}

.mini-viewport {
  position: absolute;
  background: var(--bg-brand);
  opacity: 0.5;
  border: 1px solid var(--c-brand);
  pointer-events: none;
}

.remove-range {
  margin-left: 8px;
  cursor: pointer;
  color: var(--text-tertiary);

  &:hover {
    color: var(--c-error);
  }
}
</style>
