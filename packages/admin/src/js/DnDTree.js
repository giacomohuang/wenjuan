export class DnD {
  constructor(elRef, onReorder) {
    // console.log(elRef.value)
    this.elRef = elRef
    this.onReorder = onReorder
    this.sourceEl = null
    this.list = null

    // 生成拖拽图像，这里用canvas转image实现
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 100
    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = 'orange'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(1, 1, 198, 98, 10)
    ctx.fillStyle = 'rgba(255, 165, 0, 0.5)' // 半透明橙色
    ctx.fill()
    ctx.stroke()
    this.img = new Image()
    this.img.src = canvas.toDataURL()

    // 初始化事件
    this.onDragStart = this.onDragStart.bind(this)
    this.onDragEnter = this.onDragEnter.bind(this)
    this.onDragEnd = this.onDragEnd.bind(this)
    this.onDragOver = this.onDragOver.bind(this)

    this.scrollSpeed = 10 // 滚动速度
    this.scrollThreshold = 50 // 触发滚动的阈值
    this.scrollInterval = null // 用于存储滚动定时器
    this.maxScrollSpeed = 20 // 最大滚动速度
    this.scrollAcceleration = 0.2 // 滚动加速度
    this.currentScrollSpeed = { x: 0, y: 0 } // 当前滚动速度
  }

  onDragStart(e) {
    this.sourceEl = e.target.closest('li')
    if (!this.sourceEl) return
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setDragImage(this.img, 100, 50)
    setTimeout(() => this.sourceEl.classList.add('dragging'), 1)
    e.stopPropagation()
  }

  onDragOver(e) {
    e.preventDefault()
    e.stopPropagation()
    this.handleScroll(e)
  }

  handleScroll(e) {
    const container = document.querySelector('.ps')
    if (!container) return

    const containerRect = container.getBoundingClientRect()

    const topThreshold = containerRect.top + this.scrollThreshold
    const bottomThreshold = containerRect.bottom - this.scrollThreshold
    const leftThreshold = containerRect.left + this.scrollThreshold
    const rightThreshold = containerRect.right - this.scrollThreshold

    clearInterval(this.scrollInterval)

    this.scrollInterval = setInterval(() => {
      let scrollX = 0
      let scrollY = 0

      if (e.clientY < topThreshold) {
        const distance = Math.max(0, topThreshold - e.clientY)
        this.currentScrollSpeed.y -= this.scrollAcceleration * distance
        scrollY = Math.max(-this.maxScrollSpeed, this.currentScrollSpeed.y)
      } else if (e.clientY > bottomThreshold) {
        const distance = Math.max(0, e.clientY - bottomThreshold)
        this.currentScrollSpeed.y += this.scrollAcceleration * distance
        scrollY = Math.min(this.maxScrollSpeed, this.currentScrollSpeed.y)
      } else {
        this.currentScrollSpeed.y = 0
      }

      if (e.clientX < leftThreshold) {
        const distance = Math.max(0, leftThreshold - e.clientX)
        this.currentScrollSpeed.x -= this.scrollAcceleration * distance
        scrollX = Math.max(-this.maxScrollSpeed, this.currentScrollSpeed.x)
      } else if (e.clientX > rightThreshold) {
        const distance = Math.max(0, e.clientX - rightThreshold)
        this.currentScrollSpeed.x += this.scrollAcceleration * distance
        scrollX = Math.min(this.maxScrollSpeed, this.currentScrollSpeed.x)
      } else {
        this.currentScrollSpeed.x = 0
      }

      container.scrollBy(scrollX, scrollY)

      // 如果没有滚动，则停止定时器
      if (scrollX === 0 && scrollY === 0) {
        clearInterval(this.scrollInterval)
      }
    }, 16) // 约60fps的更新频率
  }

  onDragEnter(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!this.sourceEl) return
    const targetEl = e.target.closest('li')
    if (!targetEl || targetEl === this.sourceEl) return
    if (this.sourceEl.contains(targetEl)) return

    const targetParent = targetEl.parentElement
    if (targetEl.classList.contains('root')) return

    const targetRect = targetEl.querySelector('.node').getBoundingClientRect()

    const mouseY = e.clientY - targetRect.top
    const mouseX = e.clientX - targetRect.left
    const isLeft = mouseX < targetRect.width * 0.3
    const isRight = mouseX > targetRect.width * 0.4
    const isBottom = mouseY > targetRect.height * 0.9

    if (isBottom) {
      let targetChildList = targetEl.querySelector('ul')
      if (!targetChildList) {
        targetChildList = document.createElement('ul')
        targetEl.appendChild(targetChildList)
      }
      targetChildList.appendChild(this.sourceEl)
    } else if (isLeft) {
      targetParent.insertBefore(this.sourceEl, targetEl)
    } else if (isRight) {
      targetParent.insertBefore(this.sourceEl, targetEl.nextElementSibling)
    }
  }

  onDragEnd() {
    if (!this.sourceEl) return
    this.sourceEl.classList.remove('dragging')
    clearInterval(this.scrollInterval) // 停止滚动
    this.onReorder(this.sourceEl)
    this.sourceEl = null
  }

  init() {
    this.list = this.elRef.value
    if (!this.list) return
    this.list.addEventListener('dragstart', this.onDragStart)
    this.list.addEventListener('dragenter', this.onDragEnter)
    this.list.addEventListener('dragover', this.onDragOver)
    this.list.addEventListener('dragend', this.onDragEnd)
  }

  destroy() {
    if (!this.list) return
    this.list.removeEventListener('dragstart', this.onDragStart)
    this.list.removeEventListener('dragenter', this.onDragEnter)
    this.list.removeEventListener('dragover', this.onDragOver)
    this.list.removeEventListener('dragend', this.onDragEnd)
  }
}
