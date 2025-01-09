// 定义吸附阈值
const SNAP_THRESHOLD = 5
const GUIDE_LINE_EXTENSION = 50

/**
 * 计算节点的关键位置
 * @param {Object} node - 节点元素的位置和尺寸信息
 * @returns {Object} - 返回节点的关键位置信息
 */
export const calculateNodePositions = (node) => {
  return {
    left: node.x,
    right: node.x + node.width,
    top: node.y,
    bottom: node.y + node.height,
    centerX: node.x + node.width / 2,
    centerY: node.y + node.height / 2,
    width: node.width,
    height: node.height
  }
}

/**
 * 获取水平对齐配置
 */
const getHorizontalAlignments = (current, other) => [
  // 左对齐
  {
    type: 'left',
    pos: other.left,
    value: current.left,
    start: Math.min(current.top, other.top) - GUIDE_LINE_EXTENSION,
    end: Math.max(current.bottom, other.bottom) + GUIDE_LINE_EXTENSION
  },
  // 中心对齐
  {
    type: 'center',
    pos: other.centerX,
    value: current.centerX,
    start: Math.min(current.top, other.top) - GUIDE_LINE_EXTENSION,
    end: Math.max(current.bottom, other.bottom) + GUIDE_LINE_EXTENSION
  },
  // 右对齐
  {
    type: 'right',
    pos: other.right,
    value: current.right,
    start: Math.min(current.top, other.top) - GUIDE_LINE_EXTENSION,
    end: Math.max(current.bottom, other.bottom) + GUIDE_LINE_EXTENSION
  },
  // 边缘间距对齐
  {
    type: 'edge-right-left',
    pos: other.left,
    value: current.right,
    start: Math.min(current.top, other.top) - GUIDE_LINE_EXTENSION,
    end: Math.max(current.bottom, other.bottom) + GUIDE_LINE_EXTENSION
  },
  {
    type: 'edge-left-right',
    pos: other.right,
    value: current.left,
    start: Math.min(current.top, other.top) - GUIDE_LINE_EXTENSION,
    end: Math.max(current.bottom, other.bottom) + GUIDE_LINE_EXTENSION
  }
]

/**
 * 获取垂直对齐配置
 */
const getVerticalAlignments = (current, other) => [
  // 顶部对齐
  {
    type: 'top',
    pos: other.top,
    value: current.top,
    start: Math.min(current.left, other.left) - GUIDE_LINE_EXTENSION,
    end: Math.max(current.right, other.right) + GUIDE_LINE_EXTENSION
  },
  // 中心对齐
  {
    type: 'center',
    pos: other.centerY,
    value: current.centerY,
    start: Math.min(current.left, other.left) - GUIDE_LINE_EXTENSION,
    end: Math.max(current.right, other.right) + GUIDE_LINE_EXTENSION
  },
  // 底部对齐
  {
    type: 'bottom',
    pos: other.bottom,
    value: current.bottom,
    start: Math.min(current.left, other.left) - GUIDE_LINE_EXTENSION,
    end: Math.max(current.right, other.right) + GUIDE_LINE_EXTENSION
  },
  // 边缘间距对齐
  {
    type: 'edge-bottom-top',
    pos: other.top,
    value: current.bottom,
    start: Math.min(current.left, other.left) - GUIDE_LINE_EXTENSION,
    end: Math.max(current.right, other.right) + GUIDE_LINE_EXTENSION
  },
  {
    type: 'edge-top-bottom',
    pos: other.bottom,
    value: current.top,
    start: Math.min(current.left, other.left) - GUIDE_LINE_EXTENSION,
    end: Math.max(current.right, other.right) + GUIDE_LINE_EXTENSION
  }
]

/**
 * 计算吸附位置和辅助线
 * @param {Object} currentNode - 当前拖动的节点信息
 * @param {Array} otherNodes - 其他节点的信息数组
 * @returns {Object} - 返回吸附位置和辅助线信息
 */
export const calculateSnap = (currentNode, otherNodes) => {
  const guideLines = { x: [], y: [] }
  let snapX = null
  let snapY = null

  const current = calculateNodePositions(currentNode)

  otherNodes.forEach((other) => {
    if (other.id === currentNode.id) return
    const otherPos = calculateNodePositions(other)

    // 水平对齐检测
    getHorizontalAlignments(current, otherPos).forEach(({ type, pos, value, start, end }) => {
      if (Math.abs(pos - value) < SNAP_THRESHOLD) {
        if (type === 'edge-right-left') {
          snapX = pos - current.width
        } else if (type === 'edge-left-right') {
          snapX = pos
        } else {
          snapX = pos - (value - current.left)
        }

        guideLines.x.push({ position: pos, start, end })
      }
    })

    // 垂直对齐检测
    getVerticalAlignments(current, otherPos).forEach(({ type, pos, value, start, end }) => {
      if (Math.abs(pos - value) < SNAP_THRESHOLD) {
        if (type === 'edge-bottom-top') {
          snapY = pos - current.height
        } else if (type === 'edge-top-bottom') {
          snapY = pos
        } else {
          snapY = pos - (value - current.top)
        }

        guideLines.y.push({ position: pos, start, end })
      }
    })
  })

  return { snapX, snapY, guideLines }
}
