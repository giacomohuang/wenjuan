<template>
  <div v-if="LANGS.length > 1" style="display: flex; align-items: center; justify-content: center; margin: 0 0 24px 0">
    <a-radio-group v-model:value="lang" size="small">
      <a-radio-button v-for="lang in LANGS" :key="lang.key" :value="lang.key" @change="changeLocale(lang.key)">{{ lang.label }}</a-radio-button>
    </a-radio-group>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import i18n, { LANGS, changeLocale } from '@/js/i18n'

const lang = ref(i18n.global.locale.value)
</script>
