<template>
  <a-result status="404" title="404" :sub-title="sub_title">
    <template #extra>
      <a-space>
        <template #split>
          <a-divider style="border-color: var(--border-dark)" type="vertical" />
        </template>
        <a href="/">{{ t('404.backhome') }}</a>
        <a :href="return_url" v-if="return_url">{{ return_text }}</a>
      </a-space>
    </template>
  </a-result>
</template>
<script setup>
//接收url prams传值
import { router } from '@/router/router'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { type } = router.currentRoute.value.query

const { t } = useI18n()
let sub_title = ref(null)
let return_url = ref(null)
let return_text = ref(null)
switch (type) {
  case 'wenjuan':
    sub_title.value = t('404.wenjuan')
    return_url.value = '/wenjuan/project'
    return_text.value = t('404.backwenjuan')
    break
  default:
    sub_title.value = t('404.description')
}
</script>
