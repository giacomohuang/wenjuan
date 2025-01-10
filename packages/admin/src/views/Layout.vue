<template>
  <div class="layout">
    <header class="header">
      <div class="logo-container">
        <a @click="router.push('/')" class="logo-link">
          <img src="@/assets/logo.svg" vvv class="logo-image" />
          <div class="app-name">{{ t('common.appname') }}</div>
        </a>
      </div>
      <div class="page-title">{{ t($route.meta.title) }}</div>
      <div class="user-dropdown">
        <a-dropdown>
          <a @click.prevent class="user-info">
            <img src="@/assets/avatar.jpg" class="avatar" />
            <div class="user-name">
              <span class="real-name">
                {{ store.realname }}
              </span>
              <span class="account-name"> {{ store.accountname }}</span>
            </div>
          </a>
          <template #overlay>
            <a-menu>
              <a-menu-item>
                <a @click="router.push('/my/profile')">{{ t('my.profile._title') }}</a>
              </a-menu-item>
              <a-menu-item>
                <a @click="signout">{{ t('signout._title') }}</a>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
      <div class="language-dropdown">
        <a-dropdown>
          <a @click.prevent> <Icon name="global" /></a>
          <template #overlay>
            <a-menu @click="onChangeLocale">
              <a-menu-item v-for="lang in LANGS" :key="lang.key">
                <a-tag :color="lang.key === i18n.global.locale.value ? 'blue' : 'default'">{{ lang.code }}</a-tag>
                <span :class="`font-${lang.key}`">{{ lang.label }}</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
      <div class="theme">
        <Icon name="theme-light" class="icon" @click="store.changeTheme('light')" :class="{ light: store.theme === 'light' }"></Icon>
        <Icon name="theme-dark" class="icon" @click="store.changeTheme('dark')" :class="{ dark: store.theme === 'dark' }"></Icon>
        <Icon name="theme-system" class="icon" @click="store.changeTheme('system')" :class="{ system: store.theme === 'system' }"></Icon>
      </div>
      <!-- <div class="assist-icon"><img src="@/assets/assist.svg" style="width: 1.5em; height: 1.5em" @click="showAssist = !showAssist" /></div> -->
    </header>
    <aside class="menu" data-simplebar :data-simplebar-direction="DIR">
      <div style="display: flex; align-items: center; justify-content: center; margin: 10px">
        <div class="toggle-menu" @click="toggleMenu"></div>
      </div>
      <div v-for="(item, index) in menu" :key="index">
        <div class="wrapper" @click.stop="clickMenuItem(item, index)" @mouseenter.stop="mouseOverMenuItem(item, index)" @mouseleave.stop="mouseLeaveMenuItem">
          <div :class="['item', { active: isActiveMenu(item) }]">
            <div class="icon"><Icon :name="item.icon || 'func'" :key="item.icon"></Icon></div>
            <span class="text">{{ t(item.name) }}</span>
          </div>
        </div>
      </div>
    </aside>

    <aside class="submenu" ref="submenuRef" data-simplebar :data-simplebar-direction="DIR" :class="{ hide: submenu?.length == 0 || (isFloat && isHideSubmenu), float: isFloat }" @mouseleave.stop="mouseLeaveSubmenu">
      <SubMenu :data="submenu" :isFloat="isFloat"></SubMenu>
    </aside>

    <div class="main-content">
      <a-spin :spinning="globalLoading" style="margin: 20px"></a-spin>
      <router-view v-if="isRouterAlive" />
    </div>
    <!-- <aside class="assist" v-show="showAssist">
      <div class="assist-header"></div>
    </aside> -->
  </div>
</template>

<script setup>
import { onMounted, ref, toRefs, provide, watch, onUnmounted, onBeforeMount, computed, nextTick } from 'vue'
import SubMenu from './SubMenu.vue'
import { useStore } from '../stores/stores'
import helper from '../js/helper'
import API from '../api/API'
import { useRouter, useRoute } from 'vue-router'
import i18n, { LANGS } from '../js/i18n'
import { useI18n } from 'vue-i18n'
import 'simplebar'
import '@/assets/simplebar.css'

const { t } = useI18n()
const isRouterAlive = ref(true)
const globalLoading = ref(false)
const isHideSubmenu = ref(false)
provide('globalLoading', globalLoading)
provide('isHideSubmenu', isHideSubmenu)

const reload = () => {
  isRouterAlive.value = false
  nextTick(() => {
    isRouterAlive.value = true
  })
}
provide('pageReload', reload)

const store = useStore()
const { accountname, accountid, realname } = toRefs(store)
const router = useRouter()
const route = useRoute()
const showAssist = ref(false)

const accountInfo = helper.decodeToken()
// const accountname = accessToken.accountname
accountname.value = accountInfo.accountname
accountid.value = accountInfo.id
realname.value = decodeURIComponent(accountInfo.realname)
let menudata = null
let currentMenuPath = ''

const DIR = document.dir === 'rtl' ? 'rtl' : 'ltr'
const menu = ref([])
const submenu = ref(null)
const currentMenuIdx = ref(-1)
const mouseOverMenuIndex = ref(-1)
// 子菜单是否浮动
const isFloat = ref(false)

const onChangeLocale = async ({ key }) => {
  // await changeLocale(key)
  localStorage.setItem('locale', key)
  // locale.value = key
  window.location.reload()
}

// 添加一个变量来跟踪用户点击选中的菜单项
const selectedMenuIndex = ref(-1)

const isActiveMenu = (item) => {
  // 如果有用户点击选中的菜单，优先显示该菜单的高亮
  if (isFloat.value && mouseOverMenuIndex.value !== -1) {
    return menu.value.indexOf(item) === mouseOverMenuIndex.value
  }
  if (selectedMenuIndex.value !== -1) {
    return menu.value.indexOf(item) === selectedMenuIndex.value
  }
  // 否则显示当前路由匹配的菜单高亮
  return currentMenuPath?.includes(item.id)
}

const activeMenuIndex = computed(() => {
  return menu.value.findIndex((item) => isActiveMenu(item))
})

watch(activeMenuIndex, (newIndex) => {
  if (newIndex !== -1) {
    currentMenuIdx.value = newIndex
    submenu.value = menu.value[newIndex].children
  }
})

function clickMenuItem(item, index) {
  // 切换子菜单
  if (item.children.length > 0) {
    submenu.value = item.children
    selectedMenuIndex.value = index
  }

  // 路由/外链跳转
  else {
    // 路由跳转
    if (item.linkType === 1) {
      // 当前页面打开
      if (item.target === 'self') {
        router.push(item.router)
        selectedMenuIndex.value = index
      }
      // 新页面打开
      else {
        window.open(item.router, item.target)
      }
    }
    // 外链跳转
    else {
      window.open(item.link, item.target)
    }
  }

  nextTick(() => {
    if (isFloat.value) {
      calcSubmenuTop()
    }
  })
}

function mouseOverMenuItem(item, index) {
  if (!isFloat.value) return
  isHideSubmenu.value = false
  mouseOverMenuIndex.value = index

  if (item.children.length > 0) {
    submenu.value = item.children
  }
  nextTick(() => {
    calcSubmenuTop()
  })
}

function mouseLeaveMenuItem() {
  // mouseOverMenuIndex.value = -1
}

function mouseLeaveSubmenu() {
  isHideSubmenu.value = true
}

const toggleMenu = () => {
  console.log('toggleMenu')
  isFloat.value = !isFloat.value
  calcSubmenuTop()
}

const calcSubmenuTop = () => {
  if (!isFloat.value) {
    submenuRef.value.style.top = 'auto'
    submenuRef.value.style.bottom = 'auto'
    return
  }
  const curMenuItem = document.querySelector('.menu .item.active')
  const menuRect = curMenuItem.getBoundingClientRect()
  const submenuEl = submenuRef.value
  let top = menuRect.top

  if (top + submenuEl.offsetHeight > document.documentElement.clientHeight) {
    submenuEl.style.bottom = '0'
    submenuEl.style.top = 'auto'
  } else {
    submenuEl.style.bottom = 'auto'
    submenuEl.style.top = `${top}px`
  }
}

// 获取当前菜单路径
function getCurrentMenuPath() {
  const path = route.path

  const item = menudata.find((item) => getRootPath(path) == getRootPath(item.router))
  const fullpath = item?.path
  return fullpath ? fullpath.split('-').map(Number) : null
}

function getRootPath(path) {
  try {
    const match = path.match(/^\/[^/]+\//)
    return match ? match[0] : '/'
  } catch (e) {
    return '/'
  }
}

async function signout() {
  await API.account.signout()
  store.accountid = undefined
  helper.removeToken()
  router.push('/signin')
}

const submenuRef = ref(null)
const hoverTimeout = ref(null)

onBeforeMount(async () => {
  menudata = await API.permission.resource.getMenu()
  // 构建树
  menu.value = buildTree(menudata)
  currentMenuPath = getCurrentMenuPath()
  // console.log('tree', currentMenuPath.value)
})

function buildTree(items) {
  const tree = []
  const itemMap = new Map()

  // 先创建所有节点的映射
  items.forEach((item) => {
    item.router = item.router || '/404'
    itemMap.set(item.id, { ...item, children: [] })
  })

  // 构建树形结构
  items.forEach((item) => {
    const node = itemMap.get(item.id)
    if (item.pid === null) {
      // 根节点直接加入树中
      tree.push(node)
    } else {
      // 非根节点加入到父节点的children中
      const parent = itemMap.get(item.pid)
      if (parent) {
        parent.children.push(node)
      }
    }
  })

  // 按order排序
  const sortByOrder = (arr) => {
    arr.sort((a, b) => a.order - b.order)
    arr.forEach((item) => {
      if (item.children && item.children.length) {
        sortByOrder(item.children)
      }
    })
  }
  sortByOrder(tree)

  return tree
}

onBeforeMount(() => {
  // 初始化当前活动菜单
  if (activeMenuIndex.value !== -1) {
    currentMenuIdx.value = activeMenuIndex.value
    submenu.value = menu.value[activeMenuIndex.value]
  }
})

onUnmounted(() => {
  clearTimeout(hoverTimeout.value)
})
</script>

<style scoped lang="scss">
.layout {
  display: grid;
  grid-template-areas:
    'header header header header'
    'menu submenu main assist';
  grid-template-columns: auto auto 1fr auto;
  grid-template-rows: 64px 1fr;
  height: 100vh;
  max-height: 100vh;
  min-width: 100vw;
  overflow: hidden;

  // max-width: 100vw;
}

.header {
  grid-area: header;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 24px;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);

  .logo-container {
    flex-shrink: 0;
    white-space: nowrap;
    border-right: 2px solid var(--border-light);

    .logo-link {
      display: flex;
      align-items: center;

      .logo-image {
        margin-right: 16px;
        height: 24px;
        width: 24px;
      }

      .app-name {
        font-size: 24px;
        line-height: 1;
        font-weight: 600;
        color: var(--text-primary);
        margin-right: 30px;
      }
    }
  }

  .page-title {
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 18px;
    color: var(--text-primary);
  }

  .user-dropdown {
    margin: 0 12px;

    .user-info {
      display: flex;
      align-items: center;
      font-size: 16px;

      .avatar {
        margin-right: 8px;
        height: 30px;
        width: 30px;
        border-radius: 50%;
      }

      .user-name {
        display: flex;
        max-width: 200px;

        .real-name,
        .account-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;

          @media (min-width: 768px) {
            max-width: 128px;
          }
        }

        .account-name {
          &::before {
            content: '(';
          }
          &::after {
            content: ')';
          }
        }
      }
    }
  }

  .language-dropdown {
    color: var(--text-tertiary);
    display: none;

    @media (min-width: 768px) {
      display: block;
    }
  }

  // .ho {
  //   padding: 10px;
  //   border-radius: 20px;
  //   &:hover {
  //     background: var(--bg-tertiary);
  //   }
  // }

  .theme {
    display: none;
    cursor: pointer;
    flex-wrap: nowrap;
    gap: 12px;
    color: var(--text-tertiary);
    @media (min-width: 768px) {
      display: flex;
    }

    .icon {
      &:hover {
        color: var(--c-brand);
      }
      &.light {
        color: var(--c-orange);
      }
      &.dark {
        color: var(--c-blue);
      }
      &.system {
        color: var(--c-black);
      }
    }
  }

  .assist-icon {
    display: none;
    flex-shrink: 0;
    cursor: pointer;
    width: 1.5em;
    height: 1.5em;
    @media (min-width: 768px) {
      display: block;
    }
  }
}

.menu {
  grid-area: menu;
  background-color: var(--bg-primary);
  padding-top: 10px;
  border-right: 1px solid var(--border-light);
  width: 100px;
  box-shadow: 0px 0 4px 0 rgba(100, 100, 100, 0.1);
  z-index: 1;
  max-height: calc(100vh - 64px);
  overflow-x: hidden;

  .wrapper {
    cursor: pointer;
    &:hover .item:not(.active) .icon {
      background-color: var(--c-brand-400);
      color: var(--c-white);
      font-weight: 600;
    }
    // padding: 5px;
  }
  .icon {
    margin: 0 0 2px 0;
    padding: 10px;
    border-radius: 8px;
    transition:
      color 0.15s ease,
      background-color 0.15s ease;
  }
  .item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 4px;

    color: var(--text-primary);
    border-radius: 10px;
    transition:
      color 0.2s ease,
      background-color 0.2s ease;

    &.active .icon {
      background-color: var(--c-brand);
      color: var(--c-white);
      font-weight: 600;
    }

    &.hover .icon {
      background-color: var(--c-brand-400);
      color: var(--c-white);
      font-weight: 600;
    }

    .text {
      text-align: center;
      line-height: 1.2;
    }
  }
}

.submenu {
  // position: relative;
  grid-area: submenu;
  background-color: var(--bg-primary);
  border-right: 1px solid var(--border-light);
  padding: 10px 0;
  z-index: 1;
  width: 180px;
  box-shadow: 2px 0 4px 0 rgba(100, 100, 100, 0.1);
  max-height: calc(100vh - 64px);
  overflow-x: hidden;
  transition: width 0.1s ease;

  &.float {
    position: fixed; // 改为fixed以确保在滚动时保持位置
    left: 98px; // 与mini menu的宽度对应
    z-index: 1000; // 确保浮动在其他元素之上

    height: min-content;
    border: 1px solid var(--border-light);
    border-radius: 10px;
    box-shadow: 1px 1px 2px 0 rgba(100, 100, 100, 0.1);
  }
  &.hide {
    z-index: 0;
    width: 0;
  }
}

.toggle-menu {
  position: relative;
  width: 20px;
  height: 10px;
  border-top: 2px solid var(--border-medium);
  margin-bottom: 10px;
  cursor: pointer;

  &:before,
  &:after {
    content: '';
    position: absolute;
    width: 20px;
    height: 10px;
    border-color: var(--border-medium);
  }

  &:hover {
    border-color: var(--border-dark);
    &:before,
    &:after {
      border-color: var(--border-dark);
    }
  }

  &::before {
    top: 4px;
    border-top-width: 2px;
  }
  &::after {
    top: 2px;
    border-bottom-width: 2px;
  }
}

.assist {
  position: relative;
  grid-area: assist;
  width: 400px;
  background-color: var(--bg-primary);
  border-left: 1px solid var(--border-light);
  box-shadow: 0px 0 4px 0 rgba(100, 100, 100, 0.1);
  &.float {
    position: absolute;
    top: 64px;
    bottom: 0;
    right: 0;
    height: calc(100vh - 64px);
    // z-index: 500;
  }
}
.icon {
  margin: 4px 0;
}

.main-content {
  position: relative;
  grid-area: main;
  overflow: auto;
  background-color: var(--bg-500);
}
</style>

<style>
.rtl-test {
  margin-left: 20px;
}
</style>
