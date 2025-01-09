import { customRef } from 'vue'
/**
 * 防抖ref
 * @param data - 初始化数据
 * @param delay - 延迟同步时间
 */
export default function debounceRef(data, delay = 300) {
  // 创建定时器
  let timer = null
  // 对 delay 进行判断，如果传递的是 null 则不需要使用 防抖方案，直接返回使用 ref 创建的。
  return delay == null
    ? // 返回 ref 创建的
      ref(data)
    : // customRef 中会返回两个函数参数。一个是：track 在获取数据时收集依赖的；一个是：trigger 在修改数据时进行通知派发更新的。
      customRef((track, trigger) => {
        return {
          get() {
            // 收集依赖
            track()
            // 返回当前数据的值
            return data
          },
          set(value) {
            // 清除定时器
            if (timer != null) {
              clearTimeout(timer)
              timer = null
            }
            // 创建定时器
            timer = setTimeout(() => {
              // 修改数据
              data = value
              // 派发更新
              trigger()
            }, delay)
          }
        }
      })
}
