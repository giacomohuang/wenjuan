<template>
  <ul v-if="data">
    <li v-for="resource in data" :key="resource.id" v-show="resourceType == 0 || resource.type <= 1 || resourceType == resource.type" :draggable="resource.pid != null" class="dragitem" :data-id="resource.id" :data-type="resource.type" :id="'_MPRES_' + resource.id">
      <div class="item" :style="{ paddingInlineStart: `${lv * 24 + 12}px` }">
        <div class="resource-content" :class="{ gapper: !resource.children }">
          <icon v-if="resource.pid > 0 && resource.type == 1 && resource.children" name="arrow-down" class="collapse-icon" :class="{ collapsed: collapseIds.has(resource.id) }" @click="toggleCollapse(resource.id)" />
          <icon :name="RESTYPE[resource.type].type" :class="RESTYPE[resource.type].style"></icon>
          <span class="resource-name">{{ resource.name }}</span>
          <mp-tag size="small" color="red">{{ resource.id }}</mp-tag>
          <mp-tag size="small" color="gray" class="resource-code" :title="t('sys.permission.resource.copyToClipboard')" @click="copyToClipBoard($event, resource.code)">{{ resource.code }}</mp-tag>
        </div>
        <div class="tools">
          <icon name="edit" class="opr edit" @click="openEditor(resource, EDITOR_MODE.EDIT)" :title="t('common.edit')" />
          <icon v-if="resource.type === 1" name="add" class="opr add" @click="openEditor(resource, EDITOR_MODE.ADD)" :title="t('sys.permission.resource.addSubResource')" />
          <icon name="del" class="opr del" @click="confirm(resource.path, resource.pid)" :title="t('common.del')" />
        </div>
      </div>
      <ResourceList v-show="!collapseIds.has(resource.id)" :level="lv + 1" :data="resource.children" @open="openEditor" @remove="confirm" @toggleCollapse="toggleCollapse" />
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
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const { data, level } = defineProps(['data', 'level'])
const EDITOR_MODE = { ADD: 1, EDIT: 2 }
const emits = defineEmits(['open', 'remove', 'toggleCollapse'])

const collapseIds = inject('collapseIds')
const resourceType = inject('resourceType')

const lv = level || 0

const RESTYPE = {
  1: { type: 'menu', style: 'menu' },
  2: { type: 'func', style: 'func' },
  3: { type: 'data', style: 'data' }
}

function toggleCollapse(id) {
  emits('toggleCollapse', id)
}

function confirm(path, pid) {
  emits('remove', path, pid)
}

function openEditor(parent, mode) {
  emits('open', parent, mode)
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
.dragging {
  border: 2px dashed var(--c-brand-500);
  background-color: var(--bg-brand);
  > * {
    opacity: 0;
  }
}

/*rtl:begin:ignore*/
:deep(.checkmark) {
  color: #15803d;
  transition: opacity 150ms ease-in-out;
  animation: appear 1s forwards;
  font-size: 10px;
  position: relative;
  @keyframes appear {
    0% {
      opacity: 1;
      top: 0px;
    }
    100% {
      opacity: 0;
      top: -10px;
    }
  }
}
/*rtl:end:ignore*/

.item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-light);
  padding: 14px 0;
  &:hover {
    .tools {
      opacity: 1;
    }
  }
}

.dragitem[draggable='true'] {
  cursor: move;
}

.tools {
  opacity: 0;
  transition: opacity 0.15s ease-in-out;

  .opr {
    cursor: pointer;
    border-width: 1px;
    border-style: solid;
    border-radius: 50%;
    padding: 2px;
  }

  .del {
    margin-right: 12px;
    cursor: pointer;
    color: var(--c-red-600);
    border-color: var(--c-red-600);
  }

  .add {
    margin: 0 8px;
    cursor: pointer;
    color: var(--c-brand-600);
    border-color: var(--c-brand-600);
  }

  .edit {
    margin: 0 8px;
    cursor: pointer;
    color: var(--c-green-600);
    border-color: var(--c-green-600);
  }
}

.resource-content {
  // position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;

  &[data-pid='true'] {
    padding-left: 24px;
  }

  .func {
    color: var(--c-lime-600);
  }
  .data {
    color: var(--c-amber-600);
  }
  .menu {
    color: var(--c-sky-600);
  }
}
.gapper {
  padding-left: 24px;
}

.collapse-icon {
  // position: absolute;
  // left: -24px;
  cursor: pointer;
  transition: transform 0.2s;

  &.collapsed {
    transform: rotate(-90deg);
  }
}

.resource-code {
  margin-right: 8px;
  cursor: pointer;
}
</style>
