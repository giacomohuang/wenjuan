<template>
  <ul v-if="data" class="list-wrap">
    <li v-for="resource in data" :key="resource.id" v-show="resourceType == 0 || resource.type <= 1 || resourceType == resource.type" class="dragitem" :data-id="resource.id" :data-type="resource.type" :id="'_MPRES_' + resource.id">
      <div class="item" @click.stop="toggleSelect(resource.id)">
        <div class="item-wrap" :class="{ gapper: resource.pid > 0 }">
          <icon v-if="resource.pid > 0 && resource.type === 1 && resource.children" name="arrow-down" class="arrow" :class="{ collapse: collapseIds.has(resource.id) }" @click.stop="toggleCollapse(resource.id)" />
          <icon :name="RESTYPE[resource.type].type" :class="RESTYPE[resource.type].style"></icon>
          <span class="resource-name">{{ resource.name }}</span>
          <!-- <span class="tag red">{{ resource.id }}</span> -->
          <!-- <span v-if="resource.code" class="tag gray clickable-item mr-2 cursor-pointer">{{ resource.code }}</span> -->
        </div>
        <div v-if="resource.type === 1" style="margin-right: 12px">
          <mpSwitch :checked="selectedIds.has(resource.id)" :disabled="!pidEnabled" />
        </div>
        <div v-else style="margin-right: 12px">
          <mpCheckbox :checked="selectedIds.has(resource.id)" :disabled="!pidEnabled" />
        </div>
      </div>
      <ResourceSelectorList v-show="!collapseIds.has(resource.id)" :pidEnabled="selectedIds.has(resource.id)" :data="resource.children" @toggleCollapse="toggleCollapse" @toggleSelect="toggleSelect" />
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

const { data, pidEnabled } = defineProps(['data', 'pidEnabled']),
  emits = defineEmits(['toggleCollapse', 'toggleSelect']),
  collapseIds = inject('collapseIds'),
  selectedIds = inject('selectedIds'),
  resourceType = inject('resourceType'),
  RESTYPE = {
    1: { type: 'menu', style: 'menu' },
    2: { type: 'func', style: 'func' },
    3: { type: 'data', style: 'data' }
  }
function toggleCollapse(id) {
  emits('toggleCollapse', id)
}

function toggleSelect(id) {
  if (pidEnabled) {
    emits('toggleSelect', id)
  }
}

function copyToClipBoard(ev, text) {
  navigator.clipboard.writeText(text)
  const clickableItem = ev.target
  if (clickableItem.nextSibling?.classList.contains('checkmark')) return
  const checkmark = document.createElement('span')
  checkmark.classList.add('checkmark')
  checkmark.textContent = '✓'
  clickableItem.insertAdjacentElement('afterend', checkmark)
  setTimeout(() => checkmark.remove(), 1800)
}
</script>

<style lang="scss" scoped>
.list-wrap {
  // display: block;
  width: 100%;
  // display: flex;

  // display: block;
}
.dragitem {
  width: 100%;
  cursor: pointer;
  padding-left: 20px;
  // display: flex;
}
.item {
  position: relative;
  display: flex;
  height: 48px;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-light);
  padding: 12px 0;
  &:hover {
    :deep(.mp-checkbox):not(.disabled) {
      .inner {
        border-color: #2893ff;
      }
    }
    :deep(.mp-switch):not(.disabled) {
      outline-color: #2893ff;
    }
  }
  .item-wrap {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .resource-name {
    padding-left: 6px;
  }
}

.gapper {
  padding-left: 12px;
}
.arrow {
  position: absolute;
  left: -12px;
  cursor: pointer;
  transition: transform 0.2s ease-in;
  &.collapse {
    transform: rotate(-90deg);
  }
}

.menu {
  color: var(--c-sky-600);
}
.func {
  color: var(--c-lime-600);
}
.data {
  color: var(--c-amber-600);
}
</style>
