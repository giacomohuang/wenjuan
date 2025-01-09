import fs from 'fs'
import path from 'path'
import { optimize } from 'svgo'

export default function svgSpritePlugin() {
  const sourceDir = path.resolve(__dirname, '../../src/assets/icons/')
  const symbolCache = new Map()

  // SVGO配置
  const svgoConfig = {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            removeViewBox: false
          }
        }
      },
      'cleanupIds',
      {
        name: 'removeAttrs',
        params: {
          attrs: ['class', 'data-name']
        }
      }
    ]
  }

  // 转换SVG为Symbol
  function convertToSymbol(content, id) {
    // 首先替换颜色属性
    let processedContent = content.replace(/(fill|stroke)="([^"]+)"/g, (match, attr) => {
      // 保留 none 值，其他颜色值都替换为 currentColor
      if (match.includes('"none"') || !match.includes('#000000')) {
        return match
      }
      return `${attr}="currentColor"`
    })

    const optimizedSvg = optimize(processedContent, svgoConfig)
    return optimizedSvg.data
      .replace(/<svg([^>]*)>/, (match, attrs) => {
        // 保留viewBox属性
        const viewBox = attrs.match(/viewBox="([^"]*)"/)
        return `<symbol id="icon-${id}" ${viewBox ? viewBox[0] : ''}>`
      })
      .replace('</svg>', '</symbol>')
  }

  // 处理单个SVG文件
  function handleSvgFile(file) {
    // console.log('handleSvgFile', file)
    const filePath = path.join(sourceDir, file)
    const content = fs.readFileSync(filePath, 'utf8')
    const id = path.basename(file, '.svg')
    symbolCache.set(id, convertToSymbol(content, id))
  }

  // 生成Sprite内容
  function generateSprite() {
    let spriteContent = '<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">'
    symbolCache.forEach((symbol) => {
      spriteContent += symbol
    })
    spriteContent += '</svg>'
    return spriteContent
  }

  // 虚拟模块ID
  const virtualModuleId = 'virtual:svg-sprite'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'svg-sprite-plugin',

    configureServer(server) {
      // 监听SVG文件变化
      server.watcher.add(sourceDir)
      server.watcher.on('all', async (eventType, file) => {
        if (file.endsWith('.svg')) {
          console.log(`SVG file ${eventType}:`, file)

          // 清理旧的缓存（针对重命名和删除的情况）
          if (eventType === 'unlink') {
            const id = path.basename(file, '.svg')
            symbolCache.delete(id)
          }

          // 添加或更新缓存
          if (eventType === 'add' || eventType === 'change') {
            handleSvgFile(path.basename(file))
          }

          // 通知客户端模块更新
          const module = server.moduleGraph.getModuleById(resolvedVirtualModuleId)
          if (module) {
            server.moduleGraph.invalidateModule(module)
            // 通知客户端更新
            server.ws.send({
              type: 'update',
              updates: [
                {
                  type: 'js-update',
                  path: resolvedVirtualModuleId,
                  acceptedPath: resolvedVirtualModuleId,
                  timestamp: Date.now()
                }
              ]
            })

            // 确保更新已完成后再触发完整重载
            setTimeout(() => {
              server.ws.send({
                type: 'full-reload'
              })
            }, 100)
          }
        }
      })
    },

    buildStart() {
      // 初始化时处理所有SVG文件
      if (!fs.existsSync(sourceDir)) {
        console.warn(`SVG source directory ${sourceDir} does not exist`)
        return
      }

      const files = fs.readdirSync(sourceDir)
      files.forEach((file) => {
        if (file.endsWith('.svg')) {
          handleSvgFile(file)
        }
      })
    },

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },

    load(id) {
      if (id === resolvedVirtualModuleId) {
        const spriteContent = generateSprite()
        return {
          code: `

            
            const sprite = ${JSON.stringify(spriteContent)};
            const svgElement = document.createRange().createContextualFragment(sprite).firstElementChild;
            svgElement.id = '__SVG__SPRITE__';
            document.body.appendChild(svgElement);

            // 支持热更新
            if (import.meta.hot) {
              import.meta.hot.accept(() => {
                console.log('SVG sprite updated');
              });
            }
          `
        }
      }
    }
  }
}
