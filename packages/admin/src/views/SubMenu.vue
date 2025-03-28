<template>
  <RouterLink custom :to="item.router" v-slot="{ isActive }" v-for="(item, index) in data" :key="index">
    <template v-if="item.children.length > 0">
      <div @click.stop="toggle_children" class="wrapper">
        <div class="item"><span class="arrow"></span> {{ t(item.name) }}</div>
        <div class="children">
          <SubMenu :data="item.children" :isFloat="isFloat"></SubMenu>
        </div>
      </div>
    </template>
    <div v-else :class="['item', { active: isActive }]" @click.stop="clickMenuItem(item)"><span class="dot"></span>{{ t(item.name) }}</div>
  </RouterLink>
</template>

<script setup>
import { onMounted, inject } from 'vue'
const { data, isFloat } = defineProps(['data', 'isFloat'])
const isHideSubmenu = inject('isHideSubmenu')
import { useRouter } from 'vue-router'
const router = useRouter()
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

function toggle_children(ev) {
  const dom = ev.currentTarget
  dom.classList.toggle('expand')
}

function clickMenuItem(item) {
  // 路由跳转
  if (item.linkType === 1) {
    // 当前页面打开
    if (item.target === 'self') {
      router.push(item.router)
      // 关闭浮动子菜单
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

  isHideSubmenu.value = true
}

onMounted(() => {
  //   //默认展开当前路由的子菜单
  const dom = document.querySelector('.submenu .active')
  if (dom) {
    dom.parentElement.parentElement.classList.add('expand')
  }
})
</script>

<style scoped lang="scss">
.wrapper {
  &.expand {
    display: block;
    .arrow {
      transform: rotate(90deg);
    }
    .children {
      display: block;
    }
  }
  // display: none;

  .children {
    display: none;
    padding-left: 20px;
  }
}

.item {
  display: flex;
  align-items: center;
  height: 36px;
  width: 180px;
  overflow-x: hidden;
  padding-left: 12px;
  margin: 0;
  color: var(--text-primary);
  cursor: pointer;

  .dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;

    &::before {
      content: '';
      position: relative;
      display: block;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--bg-tertiary);
      transition: all 0.1s ease;
      // margin-right: 10px;
    }
  }

  &:hover {
    font-weight: 600;
    .dot::before {
      width: 10px;
      height: 10px;
      background: var(--c-brand-400);
    }
  }
}

.arrow {
  transition: transform 0.15s cubic-bezier(0.645, 0.045, 0.355, 1);
  width: 20px;
  height: 20px;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  left: -4px;

  &:before {
    content: '';
    position: absolute;
    display: block;
    width: 7px;
    height: 7px;
    // background: #444;

    border-color: var(--border-tertiary);
    border-width: 2px 2px 0 0;
    transform: translate(-2px, -1px) rotate(45deg);
  }
}

.active {
  font-weight: 600;
  color: var(--text-primary);
  .dot::before {
    width: 10px;
    height: 10px;
    background: var(--c-brand-400);
  }
}
</style>
