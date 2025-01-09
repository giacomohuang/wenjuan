export class DnD {
  constructor(elRef, options = {}) {
    // console.log(elRef.value)
    this.elRef = elRef
    this.onReorder = options.onReorder
    this.onDrop = options.onDrop
    this.sourceEl = null
    this.list = null
    // console.log(options)

    // 添加嵌套选项，默认为 true
    this.allowNesting = options.allowNesting ?? true

    this.onDragStart = this.onDragStart.bind(this)
    // this.onDragEnter = this.onDragEnter.bind(this)
    this.onDragEnd = this.onDragEnd.bind(this)
    this.onDragOver = this.onDragOver.bind(this)

    this.scrollSpeed = 10
    this.scrollThreshold = 50
    this.scrollInterval = null
    this.maxScrollSpeed = 20
    this.scrollAcceleration = 0.2
    this.currentScrollSpeed = { x: 0, y: 0 }

    this.isAnimating = false
  }

  onDragStart(e) {
    this.sourceEl = e.target.closest('li')
    console.log('onDragStart', this.sourceEl)
    if (!this.sourceEl) return
    e.dataTransfer.effectAllowed = 'move'
    requestAnimationFrame(() => this.sourceEl.classList.add('dragging'))
    e.stopPropagation()
  }

  // onDragOver(e) {
  //   e.preventDefault()
  //   e.stopPropagation()
  //   this.handleScroll(e)
  // }

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

      if (scrollX === 0 && scrollY === 0) {
        clearInterval(this.scrollInterval)
      }
    }, 16)
  }

  onDragOver(e) {
    e.preventDefault()

    if (!this.sourceEl || this.isAnimating) return
    const targetEl = e.target.closest('li')
    if (!targetEl || !targetEl.draggable) return

    // 添加检查，防止将父元素拖到其子元素中
    if (this.sourceEl.contains(targetEl)) {
      return
    }

    // 确保目标元素和源元素在同一个父元素内
    if (targetEl === this.sourceEl) return

    // console.log('allowNesting', this.allowNesting)
    // 根据 allowNesting 选项检查是否允许跨级拖动
    if (!this.allowNesting && targetEl.parentElement !== this.sourceEl.parentElement) return

    // 确保目标元素和源元素类型相同（resource专用）
    if (targetEl.dataset.type !== this.sourceEl.dataset.type) return

    const itemsEl = [...targetEl.parentElement.children]
    const sourceIndex = itemsEl.indexOf(this.sourceEl)
    const targetIndex = itemsEl.indexOf(targetEl)
    const moveTarget = targetIndex > sourceIndex ? targetEl.nextElementSibling : targetEl

    if (moveTarget !== this.sourceEl && moveTarget !== this.sourceEl.nextElementSibling) {
      const oldTop = targetEl.getBoundingClientRect().top
      targetEl.parentElement.insertBefore(this.sourceEl, moveTarget)
      const newTop = targetEl.getBoundingClientRect().top
      const offset = oldTop - newTop
      // 避免元素交换时抖动
      this.isAnimating = true

      targetEl.animate([{ transform: `translateY(${offset}px)` }, { transform: 'translateY(0px)' }], {
        duration: 80,
        easing: 'ease-in-out'
      }).onfinish = () => {
        this.isAnimating = false
      }
    }
  }

  onDragEnd() {
    if (!this.sourceEl) return
    this.sourceEl.classList.remove('dragging')
    clearInterval(this.scrollInterval)
    const items = [...this.sourceEl.parentElement.children]
    const ids = items.map((item) => item.dataset.id)
    this.onReorder(ids)
    this.onDrop(oldIndex, newIndex)
    this.sourceEl = null
  }

  init() {
    this.list = this.elRef.value
    if (!this.list) return
    this.list.addEventListener('dragstart', this.onDragStart)
    // this.list.addEventListener('dragenter', this.onDragEnter)
    this.list.addEventListener('dragover', this.onDragOver)
    this.list.addEventListener('dragend', this.onDragEnd)
  }

  destroy() {
    if (!this.list) return
    this.list.removeEventListener('dragstart', this.onDragStart)
    // this.list.removeEventListener('dragenter', this.onDragEnter)
    this.list.removeEventListener('dragover', this.onDragOver)
    this.list.removeEventListener('dragend', this.onDragEnd)
  }
}
