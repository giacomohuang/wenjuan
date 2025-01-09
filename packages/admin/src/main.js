import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import { router } from './router/router'
import './router/permission'
import i18n, { changeLocale } from './js/i18n'

import './assets/main.scss'

// import 'virtual:svg-icons-register'
import 'virtual:svg-sprite'
import Icon from './components/Icon.vue'

const app = createApp(App)

if (!localStorage.getItem('locale')) {
  localStorage.setItem('locale', 'zh-CN')
}
changeLocale()

// 在应用启动时插入SVG sprite
// insertSprite()

app.use(router).use(createPinia()).use(i18n).component('Icon', Icon).mount('#app')
