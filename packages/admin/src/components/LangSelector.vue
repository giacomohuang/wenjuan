<template>
  <div style="display: flex; align-items: center; justify-content: center; margin: 0 0 24px 0">
    <a-radio-group v-model:value="lang" size="small">
      <a-radio-button v-for="lang in LANGS" :key="lang.key" :value="lang.key">{{ lang.label }}</a-radio-button>
    </a-radio-group>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import i18n, { LANGS, changeLocale } from '@/js/i18n'

const lang = ref(i18n.global.locale.value)

watch(lang, (newLang) => {
  changeLocale(newLang)
})
</script>
