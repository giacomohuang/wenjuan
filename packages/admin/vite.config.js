import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import routesGeneratorPlugin from './plugins/routes-generator'
import svgSpritePlugin from './plugins/svg-sprite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  sourceMap: true,
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: (chunkInfo) => {
          // console.log(chunkInfo)
          return 'assets/[name]-[hash].js'
        },
        manualChunks(id) {
          if (id.includes('node_modules/.pnpm/')) {
            if (id.includes('ant-design-vue')) {
              return 'ant-design-vue'
            } else if (id.includes('zxcvbn')) {
              return 'zxcvbn'
            } else if (id.includes('vue')) {
              return 'vue'
            } else return 'mod'
          }
          // else if (id.includes('locales/')) {
          //   return 'lo/' + id.toString().split('locales/')[1]
          // }
        }
      }
    }
  },
  plugins: [
    vue(),
    routesGeneratorPlugin({ layoutDir: path.resolve(process.cwd(), './src/views/Layout.vue') }),
    svgSpritePlugin(),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false // css in js
        })
      ]
    })
    // obfuscatorPlugin({
    //   enable: true,
    //   options: {
    //     compact: true,
    //     controlFlowFlattening: true,
    //     controlFlowFlatteningThreshold: 0.75,
    //     deadCodeInjection: true,
    //     deadCodeInjectionThreshold: 0.4,
    //     debugProtection: false,
    //     debugProtectionInterval: 0,
    //     disableConsoleOutput: true,
    //     identifierNamesGenerator: 'hexadecimal',
    //     log: false,
    //     renameGlobals: false,
    //     rotateStringArray: true,
    //     selfDefending: true,
    //     shuffleStringArray: true,
    //     splitStrings: true,
    //     splitStringsChunkLength: 10,
    //     stringArray: true,
    //     stringArrayEncoding: ['rc4'],
    //     stringArrayThreshold: 1,
    //     sourceMap: false,
    //     transformObjectKeys: true,
    //     unicodeEscapeSequence: false,
    //     ignoreImports: true
    //   }
    // })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler' // or "modern"
      }
    }
  },
  server: {
    proxy: {
      '/baiduapi': {
        target: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/baiduapi/, '')
      }
    }
  }
})
