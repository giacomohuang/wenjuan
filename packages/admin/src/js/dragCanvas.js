// 鼠标移动滚动位置类
class Drag {
  constructor(element) {
    this.element = element
    this._x = 0
    this._y = 0
    this._scrollLeft = 0
    this._scrollTop = 0
    this.isDown = false
    this.bindMouseDown = this.mouseDown.bind(this)
    this.bindMouseLeave = this.mouseLeave.bind(this)
    this.bindMouseUp = this.mouseUp.bind(this)
    this.bindMouseMove = this.mouseMove.bind(this)
    this.init()
  }

  init() {
    this.element.addEventListener('mousedown', this.bindMouseDown)
    document.addEventListener('mouseleave', this.bindMouseLeave)
    document.addEventListener('mouseup', this.bindMouseUp)
    document.addEventListener('mousemove', this.bindMouseMove)
  }

  mouseDown(e) {
    // console.log('mouseDown', e)
    e.preventDefault()
    this.isDown = true
    this._x = e.pageX - this.element.offsetLeft
    this._y = e.pageY - this.element.offsetTop
    this._scrollLeft = this.element.scrollLeft
    this._scrollTop = this.element.scrollTop
  }

  mouseLeave() {
    this.isDown = false
  }

  mouseUp() {
    this.isDown = false
  }

  mouseMove(e) {
    if (!this.isDown) return
    // console.log('mouseMove', e)
    e.preventDefault()
    const x = e.pageX - this.element.offsetLeft
    const y = e.pageY - this.element.offsetTop
    // console.log(x, y)
    const walkX = (x - this._x) * 1
    const walkY = (y - this._y) * 1
    this.element.scrollLeft = this._scrollLeft - walkX
    this.element.scrollTop = this._scrollTop - walkY
  }

  destroy() {
    this.element.removeEventListener('mousedown', this.bindMouseDown)
    document.removeEventListener('mouseleave', this.bindMouseLeave)
    document.removeEventListener('mouseup', this.bindMouseUp)
    document.removeEventListener('mousemove', this.bindMouseMove)
    this.element = null
  }
}
export default Drag
