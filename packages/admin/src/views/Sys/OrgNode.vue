<template>
  <ul class="group">
    <li v-for="item in data" class="wrapper" :class="{ draggable: level != 1, root: level == 1 }" :key="item.id" :data-id="item.id">
      <div class="node" :class="['level' + (((level - 1) % 10) + 1), { 'is-hover': cur_id === item.id }]" :draggable="item.pid != null" @mousedown.stop="" @mouseover="changeCurId(item.id)" @mouseout="cur_id = null" @click.stop="openEditor(item)">
        <div class="title">
          <div class="inputbox">
            <input v-model="item.name" />
            <div class="clear" @click.stop="clearText($event, item)"><icon name="remove" size="1em"></icon></div>
          </div>

          <div class="name" @click.stop="editTitle($event, item)">
            <span>{{ item.name }}</span>
            <icon name="edit"></icon>
          </div>

          <div class="tools">
            <div class="remove" v-if="level != 1" @click.stop="remove(item.path)"><icon name="remove" size="1em"></icon></div>
          </div>
        </div>

        <div class="body" @click.stop="edit($event, item)">
          <div class="leader">
            <icon name="role"></icon>
            <span class="name" :title="item.leaderName">{{ item.leaderName }}</span>
          </div>
          <div class="num">1000人</div>
        </div>

        <div class="handler">
          <!-- <div class="add top" v-if="level !== 1"><span class="btn" @click.stop="add(item, 'parent')"></span></div> -->
          <div class="add bottom"><span class="btn" @click.stop="add(item, 'child')"></span></div>
          <div class="add left" v-if="level !== 1"><span class="btn" @click.stop="add(item, 'previous')"></span></div>
          <div class="add right" v-if="level !== 1"><span class="btn" @click.stop="add(item, 'next')"></span></div>
        </div>
      </div>
      <OrgNode :data="item.children" :level="level + 1" @add="add" @edit="edit" @remove="remove" @rename="rename" @openEditor="openEditor"></OrgNode>
    </li>
  </ul>
</template>

<router lang="json">
{
  "isRouter": false
}
</router>

<script setup>
import { inject } from 'vue'
const { data, level } = defineProps(['data', 'parent', 'level'])
const emit = defineEmits(['add', 'edit', 'remove', 'rename', 'openEditor'])
let title_undo_text = ''
let cur_id = inject('cur_id')

function add(item, direction) {
  emit('add', item, direction)
}

function edit(id) {
  emit('edit', id)
}

function changeCurId(id) {
  if (!document.querySelector('.dragging')) {
    cur_id.value = id
    // console.log(id)
  }
}

function remove(path) {
  emit('remove', path)
}

function clearText(ev, item) {
  ev.currentTarget.previousElementSibling.focus()
  item.name = ''
}

function rename(item) {
  emit('rename', item)
}

function openEditor(item) {
  emit('openEditor', item)
}

function editTitle(ev, item) {
  const el = ev.currentTarget.previousElementSibling
  el.style.display = 'flex'
  el.children[0].focus()

  document.addEventListener('mousedown', onMouseDown, true)
  document.addEventListener('keydown', onKeyDown)
  title_undo_text = ''
  title_undo_text = item.name

  function onMouseDown(event) {
    if (!el.contains(event.target)) {
      document.addEventListener('mouseup', onMouseUp)
    }
  }
  function onMouseUp(event) {
    if (!el.contains(event.target)) {
      el.style.display = 'none'
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mousedown', onMouseDown, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }

  function onKeyDown(event) {
    // 记录修改前的值，用于回滚
    const key = event.keyCode
    // 回车：提交
    if (key === 13) {
      el.style.display = 'none'
      document.removeEventListener('keydown', onKeyDown)
      rename(item)
    }
    // ESC：回滚
    if (key === 27) {
      item.name = title_undo_text
      el.style.display = 'none'
      document.removeEventListener('keydown', onKeyDown)
    }
  }
}
</script>

<style scoped lang="scss">
@use 'sass:list';

:root:has(.dragging) {
  .handler {
    visibility: hidden !important;
  }
  .node {
    box-shadow: none !important;
  }
  .name {
    &:hover {
      background: none !important;
    }
    svg {
      display: none !important;
    }
  }
}

.dragging {
  .node {
    background: var(--c-brand-50);
    outline: 2px dashed var(--c-brand-500);
  }
  .node > * {
    opacity: 0;
  }
}

$border-color: var(--border-dark);
$border-radius: 5px;
$border-size: 1px;
.group {
  display: flex;
  padding: 0;
  margin: 0;
  list-style-type: none;
  &:not(:first-child) {
    padding-top: 20px;
  }

  // 如果节点只有一个子节点，并且不是根节点，则补一条竖线
  > :only-child:not(.root) > .node::before {
    content: '';
    position: absolute;
    z-index: 2;
    width: 50%;
    top: -20px;
    height: 20px;
    left: 50%;
    border-left: $border-size solid $border-color;
  }
}

.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    height: 20px;
    border-color: $border-color;
    border-style: solid;
  }

  // 不止一个子节点，才显示横线
  &:not(:only-child)::before {
    width: 100%;
    border-top-width: $border-size;
  }

  // 不是第一个也不是最后一个节点，需要显示T字形线段，所以借用node节点的before显示竖线
  &:not(:first-child):not(:last-child) {
    > .node::before {
      content: '';
      position: absolute;
      top: -20px;
      left: 50%;
      height: 20px;
      border-color: $border-color;
      border-left-width: $border-size;
      // $border-color;
    }
  }

  // 最后一个节点，并且不是单一节点，显示左圆角
  &:first-child:not(:only-child)::before {
    left: 50%;
    width: 50%;
    border-left-width: $border-size;
    border-radius: $border-radius 0 0 0;
  }

  // 最后一个节点，，并且不是单一节点，显示右圆角
  &:last-child:not(:only-child)::before {
    width: 50%;
    left: 0;
    border-right-width: $border-size;
    border-radius: 0 $border-radius 0 0;
  }
}

.node {
  position: relative;
  border-radius: 8px;
  padding: 4px;
  margin: 20px 20px 0 20px;
  z-index: 3;
  width: 180px;

  &.is-hover {
    .handler {
      visibility: visible;
    }
  }

  &:has(+ ul > li)::after {
    content: '';
    position: absolute;
    margin-top: 4px;
    width: 1px;
    height: 20px;
    left: 50%;
    border-left: $border-size solid $border-color;
  }

  &.root {
    margin-top: 0;
  }
  cursor: default;
}

// 层级颜色
$lv-colors: (#f29999, #eda763, #ceb0d2, #c8adad, #b3bcd9, #b0c6cd, #93b9fa, #9fce87, #cecc87, #aead93);
// 使用@each指令遍历颜色数组
@each $color in $lv-colors {
  $i: list.index($lv-colors, $color);
  .level#{$i} {
    background: $color;
    &.is-hover {
      box-shadow: 0px 0px 8px 0 $color;
    }
  }
}
// 深色模式
$lv-colors-dark: (#522f2f, #452917, #392b39, #443727, #1d2436, #203233, #1d2e52, #2c3f19, #444422, #292929);
@each $color in $lv-colors-dark {
  $i: list.index($lv-colors-dark, $color);
  [data-theme='dark'] .level#{$i} {
    background: $color;
    &.is-hover {
      box-shadow: 0px 0px 8px 0 $color;
    }
  }
}

.title {
  z-index: 1;
  position: relative;
  display: flex;
  justify-content: space-between;
  height: 24px;
  margin-bottom: 4px;
  color: var(--c-white);
  background: inherit;

  &:hover > .tools {
    display: flex;
  }

  .inputbox {
    display: none;
    align-content: space-between;
    align-items: center;
    position: absolute;
    z-index: 10;
    width: 100%;
    left: 0;
    height: 22px;
    background: #fff;
    padding-left: 4px;
    border-radius: 3px;

    input {
      // position: absolute;
      height: 22px;
      width: calc(100% - 20px);
      border-radius: 3px;
      border: 0;
      outline: 0;
      box-shadow: none;
      color: #000;
    }
    .clear {
      cursor: pointer;
      position: absolute;
      right: 3px;
      height: 12px;
      width: 12px;
      color: #fff;
      font-size: 8px;
      border-radius: 50%;
      background: #888;
      display: flex;
      align-items: center;
      justify-content: center;
      &:hover {
        background: #000;
      }
    }
  }

  .name {
    display: flex;
    text-align: left;
    align-items: center;
    padding: 2px 4px;
    border-radius: 5px;
    min-width: 120px;
    max-width: 140px;
    cursor: pointer;
    z-index: 2;
    &:hover {
      background: #00000030;
      svg {
        display: block;
      }
    }

    span {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      width: 100%;
      display: inline-block;
    }
    svg {
      display: none;
      font-size: 14px;
    }
  }

  .tools {
    display: none;
    justify-content: right;
    background: inherit;
    position: absolute;
    right: 0;
    width: 100%;
    color: #000;
    // padding: 2px 0;

    .remove {
      cursor: pointer;
      border-radius: 4px;
      margin: 2px 0;
      padding: 4px;
      //
      display: flex;
      justify-content: center;
      align-items: center;
      &:hover,
      &:active {
        background: #00000010;
      }
      > svg {
        font-size: 12px;
        color: #fff;
      }
    }
  }
}

.handler {
  position: absolute;
  visibility: hidden;
  top: -15px;
  left: -15px;
  bottom: -15px;
  right: -15px;
}

.add {
  z-index: 2;
  position: absolute;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  color: var(--c-brand-600);
  &.top {
    width: 100%;
    height: 15px;
  }
  &.bottom {
    width: 100%;
    height: 15px;
    bottom: 0;
  }
  &.left {
    width: 15px;
    height: 100%;
  }
  &.right {
    right: 0;
    width: 15px;
    height: 100%;
  }

  .btn {
    position: absolute;
    border: 1px solid var(--c-brand-600);
    background: var(--bg-primary);
    border-radius: 50%;
    height: 15px;
    width: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    &:after,
    &:before {
      content: '';
      position: absolute;
      display: block;
    }
    &:before {
      height: 9px;
      width: 11px;
      top: 2px;
      left: 6px;
      border-left: 1px solid var(--c-brand-600);
    }
    &:after {
      height: 11px;
      width: 9px;
      top: 6px;
      left: 2px;
      border-top: 1px solid var(--c-brand-600);
    }
  }
}

.body {
  z-index: 1;
  cursor: default;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
  padding: 6px 6px;
  background: var(--bg-primary);
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  color: var(--text-primary);
}

.leader {
  display: flex;
  align-items: center;

  .name {
    overflow: hidden;
    white-space: nowrap;

    width: 90px;
    margin-left: 4px;
  }
}
</style>
