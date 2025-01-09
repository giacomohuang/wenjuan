<template>
  <a-config-provider :theme="{ algorithm: antTheme, token: { colorPrimary: antColorPrimary, fontFamily: 'inherit' } }" :locale="antLocale">
    <RouterView />
  </a-config-provider>
</template>

<script setup>
import { ref, watch } from 'vue'
import { RouterView } from 'vue-router'
import { useStore } from './stores/stores'
import { theme as antdTheme } from 'ant-design-vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import zhTW from 'ant-design-vue/es/locale/zh_TW'
import enUS from 'ant-design-vue/es/locale/en_US'
import arEG from 'ant-design-vue/es/locale/ar_EG'
import jaJP from 'ant-design-vue/es/locale/ja_JP'
import koKR from 'ant-design-vue/es/locale/ko_KR'
// 全局主题: [dark, light, system]
const store = useStore()
const { theme } = storeToRefs(store)
const { locale } = useI18n()
const antLocale = ref(null)

const setAntLocale = (locale) => {
  if (locale == 'zh-CN') {
    antLocale.value = zhCN
  } else if (locale == 'zh-HK' || locale == 'zh-TW') {
    antLocale.value = zhTW
  } else if (locale == 'en') {
    antLocale.value = enUS
  } else if (locale == 'ar') {
    antLocale.value = arEG
  } else if (locale == 'ja') {
    antLocale.value = jaJP
  } else if (locale == 'ko') {
    antLocale.value = koKR
  }
}

setAntLocale(locale.value)

theme.value = getTheme()
console.log(theme.value)

watch(theme, (val) => {
  console.log('watch', val)
  setTheme(val)
})
watch(locale, (val) => {
  setAntLocale(val)
})

// 媒体查询当前系统是否为暗黑模式
const darkMode = window.matchMedia('(prefers-color-scheme: dark)')
// antv组件主题
const antTheme = ref('')
// antv主色设置为系统的品牌色
var r = document.querySelector(':root')
const styles = getComputedStyle(r)
const antColorPrimary = ref(styles.getPropertyValue('--c-brand-500'))
setTheme(theme.value)

darkMode.addEventListener('change', (e) => {
  if (theme.value == 'system')
    if (e.matches) {
      setThemeCss('dark')
    } else {
      setThemeCss('light')
    }
})

// 从本地存储/系统配置中获取主题模式
function getTheme() {
  let mode = localStorage.getItem('theme')
  // 如果缓存中没有设置模式，则优先根据系统配置设置模式
  if (!mode || !['dark', 'light', 'system'].includes(mode)) {
    if (matchMedia('(prefers-color-scheme: dark)').matches) {
      mode = 'dark'
    } else if (matchMedia('(prefers-color-scheme: light)').matches) {
      mode = 'light'
    } else {
      mode = 'light'
    }
  }
  return mode
}

function setTheme(mode) {
  theme.value = mode
  localStorage.setItem('theme', mode)
  if (mode == 'system') {
    if (matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeCss('dark')
    } else if (matchMedia('(prefers-color-scheme: light)').matches) {
      setThemeCss('light')
    } else {
      setThemeCss('light')
    }
  } else {
    setThemeCss(mode)
  }
}

function setThemeCss(mode) {
  if (mode == 'dark') {
    antTheme.value = antdTheme.darkAlgorithm
    document.body.setAttribute('data-theme', 'dark')
    // 修改<html>标签属性
  } else {
    antTheme.value = antdTheme.defaultAlgorithm
    document.body.setAttribute('data-theme', 'light')
  }
}
</script>

<style>
/* 这里把字体的定义独立出来，解决postcss-rtl插件无法正确处理外部scss的问题 */
body {
  font-family:
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'PingFang SC',
    'Hiragino Sans GB',
    'Microsoft YaHei',
    'Helvetica Neue',
    Helvetica,
    Arial,
    sans-serif,
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol' /*rtl:prepend:'NeoSansArabic','Droid Arabic Kufi','dubai',*/;
}
</style>
