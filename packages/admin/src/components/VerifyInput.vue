<template>
  <div class="wrap">
    <div class="verify-wrap" ref="verifyRef">
      <input v-for="(i, index) in digits" autocomplete="off" :disabled="loading" aria-autocomplete="none" :value="codeArray[index]" :index="index" maxlength="1" @keydown="onKeyDown($event, index)" @keyup="onKeyUp" @animationend="removeShake" />
    </div>
    <div class="lwrap" ref="loadingRef"></div>
  </div>
</template>

<script setup>
import { watch, ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  digits: {
    type: Number,
    default: 6
  },
  autofocus: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['finish'])
const value = defineModel('value')
const digits = props.digits
const autofocus = props.autofocus
const codeArray = ref(Array(digits).fill(''))
const verifyRef = ref(null)
const loadingRef = ref(null)
const loading = ref(false)

const isMac = navigator.userAgent.indexOf('Mac') !== -1

onMounted(() => {
  if (autofocus) {
    verifyRef.value.querySelectorAll('input')[0].focus()
  }
})

const check = () => {
  setTimeout(() => {
    emits('finish', (res) => {
      console.log('finish', res)
      if (!res) {
        verifyRef.value.querySelectorAll('input').forEach((item) => {
          item.classList.add('shake')
        })
        verifyRef.value.querySelectorAll('input')[0].focus()
      }
    })
    codeArray.value = Array(digits).fill('')
    loadingRef.value.classList.remove('loading')
    loading.value = false
    value.value = ''
  }, 120)
}

const removeShake = (e) => {
  e.target.classList.remove('shake')
}

const onKeyDown = async (e, index) => {
  e.preventDefault()
  // console.log('onKeyDown', e.key)
  const ctrlCmdKey = isMac ? e.metaKey : e.ctrlKey

  if (ctrlCmdKey && e.key === 'v') {
    const clipboardData = await navigator.clipboard.readText()
    const pastedNumbers = clipboardData.match(/\d/g) || []
    const clippedNumbers = pastedNumbers.slice(0, digits - index)
    codeArray.value.splice(index, clippedNumbers.length, ...clippedNumbers)
    let idx = index + clippedNumbers.length
    if (idx > digits - 1) idx = digits - 1
    verifyRef.value.querySelectorAll('input')[idx].focus()
    const code = codeArray.value.join('')
    value.value = code
    if (idx == digits - 1 && code.length === digits) {
      check()
    }
  } else if (e.key >= '0' && e.key <= '9') {
    e.target.value = e.key
    codeArray.value[index] = e.key
    if (e.target.nextElementSibling) {
      e.target.nextElementSibling.focus()
    } else {
      const code = codeArray.value.join('')
      value.value = code
      if (code.length === digits) {
        loadingRef.value.classList.add('loading')
        loading.value = true
        check()
      }
    }
  } else if (e.key === 'Backspace') {
    e.target.value = ''
    codeArray.value[index] = ''
    if (e.target.previousElementSibling) e.target.previousElementSibling.focus()
  } else {
    return
  }
}

const onKeyUp = (e) => {
  e.target.value = e.target.value.replace(/\D/g, '')
}
</script>

<style lang="scss" scoped>
.wrap {
  position: relative;
  display: flex;
  // display-direction: ;
  align-items: center;
  width: fit-content;
}

.verify-wrap :not(:first-child) {
  margin-left: 10px;
}

.lwrap {
  position: absolute;
  right: -5px;
  opacity: 0;
  transition-duration: 0.25s;
  transition-property: right, opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  // display: none;
}

.loading {
  right: -10px;
  opacity: 1;
  width: 20px;
  height: 20px;
  border: 2px solid var(--c-brand);
  border-top-color: rgba(0, 0, 0, 0.2);
  border-right-color: rgba(0, 0, 0, 0.2);
  border-bottom-color: rgba(0, 0, 0, 0.2);
  border-radius: 100%;
  animation: circle 1s linear infinite;
}

@keyframes circle {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}

input {
  all: unset;
  background: var(--bg-primary);
  height: 50px;
  width: 50px;
  border: 1px solid var(--border-medium);
  border-radius: 20%;
  font-size: 2em;
  font-weight: 600;
  text-align: center;
  caret-color: transparent;

  &:focus,
  .active {
    border-color: var(--c-brand);
    box-shadow: 0px 0px 0px 2px var(--c-brand);
  }
  &:disabled {
    color: var(--text-tertiary);
  }
}

.shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-2px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(2px);
  }
}
</style>
