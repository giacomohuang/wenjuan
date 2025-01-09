<template>
  <div class="i18n-input-wrapper">
    <a-input v-bind="$attrs" autocomplete="new-password" :value="modelValue?.[i18n.global.locale.value] || ''" :dir="RTL_LANGS.includes(currentLang) ? 'rtl' : 'ltr'" @input="handleInput" class="i18n-input">
      <template #addonAfter v-if="languages.length > 1">
        <icon name="lang" class="lang-icon" @click="showEditor" />
      </template>
    </a-input>

    <!-- 编辑器模态框 -->
    <a-modal v-model:open="editorVisible" :title="t('comp.mpInputI18n.editorTitle')" @ok="handleOk" @cancel="handleCancel">
      <div class="lang-container">
        <a-form-item-rest>
          <div v-for="lang in languages" :key="lang" class="lang-item">
            <div class="lang-label" :class="'font-' + lang">{{ getLangLabel(lang) }}</div>
            <a-input v-model:value="translationData[lang]" :dir="RTL_LANGS.includes(lang) ? 'rtl' : 'ltr'" :class="'font-' + lang" autocomplete="new-password" />
            <a-button v-if="lang !== currentLang" type="link" size="small" @click="() => autoTranslate(lang)"> {{ t('comp.mpInputI18n.translate') }} </a-button>
          </div>
        </a-form-item-rest>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import i18n, { LANGS, RTL_LANGS } from '@/js/i18n'
import CryptoJS from 'crypto-js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => {
      const defaultValue = {}
      LANGS.forEach((lang) => {
        defaultValue[lang.key] = ''
      })
      return defaultValue
    }
  }
})

const emit = defineEmits(['update:modelValue'])

const currentLang = i18n.global.locale.value

const editorVisible = ref(false)
const translationData = ref({ ...props.modelValue })

const languages = ref([])

const getLangLabel = (lang) => {
  return LANGS.find((item) => item.key === lang)?.label || lang
}

onMounted(() => {
  // 确保每个语言都有对应的属性
  // 获取LANGS中的所有key
  const langs = LANGS.map((lang) => lang.key)
  languages.value = [currentLang, ...langs.filter((lang) => lang !== currentLang)]
  languages.value.forEach((lang) => {
    if (!translationData.value[lang]) {
      translationData.value[lang] = ''
    }
  })
})

const handleInput = (e) => {
  const value = typeof e === 'string' ? e : e.target.value
  const currentLocale = i18n.global.locale.value
  const updatedValue = {
    ...props.modelValue,
    [currentLocale]: value
  }
  LANGS.forEach((lang) => {
    if (!(lang.key in updatedValue)) {
      updatedValue[lang.key] = ''
    }
  })
  emit('update:modelValue', updatedValue)
}

const showEditor = () => {
  // 使用父组件传入的多语言数据初始化编辑器
  translationData.value = { ...props.modelValue }
  languages.value.forEach((lang) => {
    if (!translationData.value[lang]) {
      translationData.value[lang] = ''
    }
  })
  editorVisible.value = true
}

const handleOk = () => {
  emit('update:modelValue', translationData.value)
  editorVisible.value = false
}

const handleCancel = () => {
  editorVisible.value = false
}

// 添加以下常量用于百度翻译
const BAIDU_API_URL = '/baiduapi'
const BAIDU_APP_ID = import.meta.env.VITE_BAIDU_APP_ID
const BAIDU_SECRET_KEY = import.meta.env.VITE_BAIDU_SECRET_KEY

// 添加 MD5 加密函数
function MD5(string) {
  return CryptoJS.MD5(string).toString()
}

// 修改 autoTranslate 函数
const autoTranslate = async (targetLang) => {
  try {
    const sourceText = translationData.value[currentLang]
    if (!sourceText) {
      message.warning('请先输入默认语言的文本')
      return
    }

    // 准备百度翻译所需参数
    const salt = new Date().getTime()
    const str = BAIDU_APP_ID + sourceText + salt + BAIDU_SECRET_KEY
    const sign = MD5(str)

    const from = LANGS.find((lang) => lang.key === currentLang)?.baidu || 'auto'
    const to = LANGS.find((lang) => lang.key === targetLang)?.baidu || targetLang

    const params = new URLSearchParams({
      q: sourceText,
      from,
      to,
      appid: BAIDU_APP_ID,
      salt: salt,
      sign: sign
    })

    const response = await fetch(`${BAIDU_API_URL}?${params.toString()}`)

    // 正确处理 ReadableStream
    const reader = response.body.getReader()
    let chunks = []

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }

    // 将所有数据块合并成一个 Uint8Array
    const concatenated = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
    let position = 0
    for (const chunk of chunks) {
      concatenated.set(chunk, position)
      position += chunk.length
    }

    // 将 Uint8Array 转换为文本
    const text = new TextDecoder().decode(concatenated)
    const result = JSON.parse(text)

    if (result.trans_result && result.trans_result[0]) {
      translationData.value[targetLang] = result.trans_result[0].dst
      message.success('翻译完成')
    } else {
      throw new Error(result.error_msg || '翻译失败')
    }
  } catch (error) {
    message.error(`翻译失败: ${error.message}`)
  }
}
</script>

<style scoped>
.i18n-input-wrapper {
  display: inline-block;
  width: 100%;
}

.i18n-input {
  width: 100%;
}

.lang-container {
  display: flex;
  flex-direction: column;
}

.lang-icon {
  cursor: pointer;
  &:hover {
    color: var(--c-brand-500);
  }
}

.lang-item {
  display: grid;
  grid-template-columns: 100px 1fr 50px;

  align-items: center;
  margin-bottom: 16px;
}

.lang-label {
  /* width: 200px; */
  text-align: right;
  padding-right: 10px;
  &:after {
    content: ':';
  }
}
</style>
