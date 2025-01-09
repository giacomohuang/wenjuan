/**
* 防抖指令
*
* @param fn  - 回调函数
* @param delay - 延迟时间
* example: *
*
* <template>
*   <button v-debounce:click="{ fn: onClick, delay: 500 }></button>
* </template>
* <script>
*   function onClick() {
      to do something
*   }
* </script>
*/
const vDebounce = {
  beforeMount: (el, binding) => {
    let timer
    el.addEventListener(binding.arg, () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        binding.value.fn()
      }, binding.value.delay)
    })
  }
}

export default vDebounce
