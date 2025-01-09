<template>
  <svg class="iconfont" :style="[size ? { height: size, width: size } : {}, height ? { height: height } : {}, width ? { width: width } : {}]">
    <use :href="symbolId" />
  </svg>
</template>

<script>
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'

export default defineComponent({
  name: 'SvgIcon',
  props: {
    prefix: {
      type: String,
      default: 'icon'
    },
    name: {
      type: String,
      required: true
    },
    size: {
      type: String,
      default: '1.5em'
    },
    height: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const symbolId = ref('')
    let loadedSymbolId = null
    const isExternal = props.name.endsWith('.svg')

    const getFileNameFromUrl = (url) => {
      const fileName = url.split('/').pop()
      return fileName.replace('.svg', '')
    }

    const loadExternalSvg = async (url) => {
      try {
        const response = await fetch(import.meta.env.VITE_SVGICON_URL_PREFIX + url)
        const svgText = await response.text()
        const div = document.createElement('div')
        div.innerHTML = svgText
        const svg = div.querySelector('svg')

        if (!svg) {
          throw new Error('Invalid SVG')
        }

        const fileName = getFileNameFromUrl(url)
        const symbolId = `cus-${fileName}`

        if (document.getElementById(symbolId)) {
          loadedSymbolId = symbolId
          // console.log('symbolId', loadedSymbols.value)
          return symbolId
        }

        const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol')
        symbol.setAttribute('id', symbolId)
        symbol.setAttribute('viewBox', svg.getAttribute('viewBox') || '0 0 48 48')

        symbol.appendChild(svg)

        const spriteContainer =
          document.getElementById('__SVG__SPRITE__CUS') ||
          (() => {
            const container = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
            container.style.display = 'none'
            container.id = '__SVG__SPRITE__CUS'
            document.body.appendChild(container)
            return container
          })()

        spriteContainer.appendChild(symbol)
        loadedSymbolId = symbolId
        // console.log('symbolId', loadedSymbols.value)
        return symbolId
      } catch (error) {
        console.error('Failed to load external SVG:', error)
        return null
      }
    }

    onMounted(async () => {
      if (isExternal) {
        const externalSymbolId = await loadExternalSvg(props.name)
        if (externalSymbolId) {
          symbolId.value = `#${externalSymbolId}`
        }
      } else {
        symbolId.value = `#${props.prefix}-${props.name}`
      }
    })

    onUnmounted(() => {
      if (isExternal) {
        const symbol = document.getElementById(loadedSymbolId)
        if (symbol && !document.querySelector(`use[href="#${loadedSymbolId}"]`)) {
          symbol.remove()
        }
      }
    })
    loadedSymbolId = null

    return { symbolId }
  }
})
</script>
