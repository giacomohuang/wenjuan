import { titleProps } from 'ant-design-vue/es/typography/Title'

export class DnDPlus {
  constructor(elRef, options = {}) {
    this.list = null
    this.elRef = elRef
    this.onDrop = options.drop
    this.sourceEl = null

    this.sourceIndex = null
    this.targetIndex = null

    // 拖拽元素，css selector
    this.dragItem = options.dragItem ?? 'li'
    // console.log(options)

    // 添加嵌套选项，默认为 true
    this.allowNesting = options.allowNesting ?? true

    this.onDragStart = this.onDragStart.bind(this)
    this.onDragEnd = this.onDragEnd.bind(this)
    this.onDragOver = this.onDragOver.bind(this)

    this.scrollSpeed = 10
    this.scrollThreshold = 50
    this.scrollInterval = null
    this.maxScrollSpeed = 20
    this.scrollAcceleration = 0.2
    this.currentScrollSpeed = { x: 0, y: 0 }

    this.isAnimating = false

    // 添加新的选项

    this.clone = options.clone ?? false // 是否允许克隆
    this.sort = options.sort ?? true // 是否允许排序
    this.put = options.put ?? true // 是否允许放入

    // 添加新的属性
    this.sourceList = null // 源列表元素
    this.isClone = false // 当前是否是克隆操作
  }

  onDragStart(e) {
    this.sourceEl = e.target.closest(this.dragItem, this.list)
    console.log(e.target, this.list)
    this.sourceList = this.sourceEl.parentElement
    this.sourceIndex = [...this.sourceList.children].indexOf(this.sourceEl)

    if (!this.sourceEl) return
    e.dataTransfer.effectAllowed = 'move'

    // 设置拖拽数据
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({
        group: this.group,
        index: this.sourceIndex,
        listId: this.sourceList.id
      })
    )

    requestAnimationFrame(() => this.sourceEl.classList.add('dragging'))
    e.stopPropagation()
  }

  // onDragOver(e) {
  //   e.preventDefault()
  //   e.stopPropagation()
  //   this.handleScroll(e)
  // }

  onDragOver(e) {
    e.preventDefault()
    e
    if (!this.sourceEl || this.isAnimating) return
    const targetEl = e.target.closest(this.dragItem, this.list)

    if (!targetEl || !targetEl.draggable) return

    const targetList = targetEl.parentElement

    console.log('group', this.group, 'target', this.list.dataset.group)

    // 检查是否允许放入
    if (targetList !== this.sourceList) {
      console.log('不同列表')
      if (!this.put) return
      // 检查 group 是否匹配

      if (this.group === null || this.group !== targetEl.dataset.group) return
    }
    // 同一个列表
    else if (!this.sort) {
      console.log('到这里了！')
      return
    }
    console.log('到这里了！！')
    // // 添加检查，防止将父元素拖到其子元素中
    // if (this.sourceEl.contains(targetEl)) {
    //   return
    // }

    // // 确保目标元素和源元素在同一个父元素内
    // if (targetEl === this.sourceEl) return

    // 根据 allowNesting 选项检查是否允许跨级拖动
    if (!this.allowNesting && targetEl.parentElement !== this.sourceEl.parentElement) return

    // 确保目标元素和源元素类型相同
    // if (targetEl.dataset.type !== this.sourceEl.dataset.type) return

    // console.log('到这里了！')

    const itemsEl = [...targetEl.parentElement.children]
    this.targetIndex = itemsEl.indexOf(targetEl)
    console.log(this.sourceIndex, this.targetIndex)

    // 获取鼠标在目标元素上的相对位置
    const targetRect = targetEl.getBoundingClientRect()
    const mouseY = e.clientY
    const threshold = targetRect.top + targetRect.height / 2

    // 根据鼠标位置决定是放在目标元素前面还是后面
    let moveTarget
    if (mouseY < threshold) {
      // 鼠标在上半部分，放在目标元素前面
      moveTarget = targetEl
    } else {
      // 鼠标在下半部分，放在目标元素后面
      moveTarget = targetEl.nextElementSibling
    }

    if (moveTarget !== this.sourceEl && moveTarget !== this.sourceEl.nextElementSibling) {
      const oldTop = targetEl.getBoundingClientRect().top

      if (targetList !== this.sourceList && this.clone) {
        // 克隆元素
        this.isClone = true
        const clonedEl = this.sourceEl.cloneNode(true)
        targetList.insertBefore(clonedEl, moveTarget)
        this.sourceEl = clonedEl
      } else {
        targetList.insertBefore(this.sourceEl, moveTarget)
      }

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

    const targetList = this.sourceEl.parentElement
    const targetIndex = [...targetList.children].indexOf(this.sourceEl)

    // 调用回调函数，传递更多信息
    if (this.onDrop) {
      this.onDrop({
        from: {
          index: this.sourceIndex,
          list: this.sourceList
        },
        to: {
          index: targetIndex,
          list: targetList
        },
        isClone: this.isClone,
        element: this.sourceEl
      })
    }

    // 重置状态
    this.sourceIndex = null
    this.targetIndex = null
    this.sourceEl = null
    this.sourceList = null
    this.isClone = false
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

      if (scrollX === 0 && scrollY === 0) {
        clearInterval(this.scrollInterval)
      }
    }, 16)
  }

  init() {
    this.list = this.elRef.value
    this.group = this.list.dataset.group ?? null // 分组名称
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
