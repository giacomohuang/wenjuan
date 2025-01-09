<template>
  <ul v-if="data">
    <li v-for="role in data" :key="role.id" draggable="true" class="dragitem" :data-id="role.id" :data-type="role.type" :id="'_MPRES_' + role.id">
      <div class="item" :style="{ paddingInlineStart: `${lv * 24 + 12}px` }">
        <div class="role-content" :class="{ gapper: !role.children }">
          <icon v-if="role.children" name="arrow-down" class="arrow" :class="{ collapse: collapseRoleIds.has(role.id) }" @click.stop="toggleCollapse(role.id)" />
          <div class="role-info">
            <span class="role-name">
              <icon name="role" size="1.4rem" class="role-icon"></icon>
              {{ role.name }}
            </span>
            <span class="role-description">{{ role.description }}</span>
          </div>
        </div>
        <div class="tools">
          <icon name="edit" class="opr edit" @click.stop="openEditor(role, EDITOR_MODE.EDIT)" />
          <icon name="add" class="opr add" @click.stop="openEditor(role, EDITOR_MODE.ADD)" />
          <icon name="del" class="opr del" @click.stop="confirm(role.path)" />
        </div>
      </div>
      <RoleList v-show="!collapseRoleIds.has(role.id)" :level="lv + 1" :data="role.children" @open="openEditor" @remove="confirm" @toggleCollapse="toggleCollapse" />
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

const EDITOR_MODE = { ADD: 1, EDIT: 2 },
  { data, level } = defineProps(['data', 'level']),
  emits = defineEmits(['open', 'remove', 'toggleCollapse']),
  collapseRoleIds = inject('collapseRoleIds')

const lv = level || 0

function toggleCollapse(id) {
  emits('toggleCollapse', id)
}

function confirm(path) {
  console.log(path)
  emits('remove', path)
}

function openEditor(parent, mode) {
  emits('open', parent, mode)
}
</script>

<style lang="scss" scoped>
.dragging {
  border: 2px dashed var(--c-brand-500);
  background-color: var(--c-brand-50);

  > * {
    opacity: 0;
  }
}

.list:has(.dragging) {
  .item * {
    pointer-events: none;
  }
  .item > .tools {
    display: none;
  }
}

.item {
  display: flex;
  // height: 64px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-light);
  padding: 14px 0;
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

.item:hover .tools {
  opacity: 1;
}

.role-content {
  display: flex;
}

.arrow {
  cursor: pointer;
  transition: transform 0.2s;

  &.collapse {
    transform: rotate(-90deg);
  }
}

.role-info {
  // margin-left: 24px;
  display: flex;
  flex-direction: column;
}

.role-name {
  display: flex;
  align-items: center;
  font-size: 1.2em;
}

.role-icon {
  color: var(--c-orange-600);
  margin-right: 4px;
}

.role-description {
  margin-left: 24px;
  padding-top: 4px;
  color: var(--text-tertiary);
}

.gapper {
  margin-left: 20px;
}
</style>
