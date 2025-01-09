import fs from 'fs'
import fg from 'fast-glob'
import cors from 'cors'
import getEtag from 'etag'
import chokidar from 'chokidar'
import { resolve } from 'path'
import { normalizePath } from 'vite'

// 修改插件函数定义，接受配置对象作为参数
export default function routesGeneratorPlugin(options = {}) {
  const virtualModuleId = 'virtual:router'
  const resolvedVirtualModuleId = '\0' + virtualModuleId
  // 设置 layoutDir 的默认值
  const layoutDir = options.layoutDir || '/src/views/Layout.vue'

  return {
    name: 'routes-generator-plugin', // 必须的，将会在 warning 和 error 中显示

    configureServer({ middlewares, watcher, ws }) {
      middlewares.use(cors({ origin: '*' }))
      middlewares.use(async (req, res, next) => {
        const url = normalizePath(req.url)
        if (url.includes(virtualModuleId)) {
          res.setHeader('Content-Type', 'application/javascript')
          res.setHeader('Cache-Control', 'no-cache')
          const content = `export default ${getCode(layoutDir)}`
          res.setHeader('Etag', getEtag(content, { weak: true }))
          res.statusCode = 200
          res.end(content)
        } else {
          next()
        }
      })

      // 添加文件监听逻辑
      const viewsWatcher = chokidar.watch('./src/views/**/*.vue', {
        ignored: /(^|[\/\\])\../,
        persistent: true
      })

      viewsWatcher.on('change', (path) => {
        console.log(`文件 ${path} 已被修改`)
        const content = `export default ${getCode()}`
        ws.send({
          type: 'custom',
          event: 'routes-update',
          data: { content }
        })
      })

      // 在服务器关闭时停止监听
      return () => {
        viewsWatcher.close()
      }
    },

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export default ${getCode()}`
      }
    }
  }
}

// 修改 getCode 函数，传入 layoutDir 参数
function getCode(layoutDir) {
  const viewsPath = './src/views'
  let vueFiles = []
  let dirSet = new Set()
  let globs = fg.sync(`${viewsPath}/**/*.vue`, { ignore: [`${viewsPath}/*.vue`] })
  globs.forEach((f) => {
    let file = f.replace(viewsPath, '')
    vueFiles.push(file)
  })
  vueFiles = vueFiles.sort()

  let routeJson = generateRoutes(vueFiles, layoutDir)

  const routeStr = JSON.stringify(routeJson, null, '  ')
    .replace(/"(\(\) => import\([\s\S]*?\))"/gm, '$1')
    .replace(/"Layout"/g, 'Layout')
  console.log('router has been generated.')
  return routeStr
}

// 修改 generateRoutes 函数，接受 layoutDir 参数
function generateRoutes(files, layoutDir) {
  let routes = []
  let map = {}

  files.forEach((file) => {
    const fullPath = resolve('./src/views' + file)
    const content = fs.readFileSync(fullPath, 'utf-8')
    const routerRegex = /<router\s+lang="json">([\s\S]*?)<\/router>/
    const match = content.match(routerRegex)
    let param = ''

    if (match) {
      const routerJson = JSON.parse(match[1])
      if (routerJson.isRouter === false) {
        return // 跳过这个文件，不生成路由
      }
      param = routerJson.param
    }

    let path = file.replace('.vue', '').toLowerCase()
    let parts = path.split('/').filter(Boolean)
    let currentLevel = routes
    let currentPath = ''

    parts.forEach((part, index) => {
      currentPath += '/' + part
      if (!map[currentPath]) {
        let route = {
          path: currentPath + param,
          name: parts.slice(0, index + 1).join('-'),
          meta: { title: parts.slice(0, index + 1).join('.') + '._title' }
        }

        if (index === parts.length - 1) {
          route.component = `() => import('/src/views${file}')`
        } else if (index === 0) {
          // 使用传入的 layoutDir 参数
          route.component = `() => import('/src/views/Layout.vue')`
          route.path = '/404'
          route.children = []
        } else {
          route.children = []
        }

        if (index === 0) {
          currentLevel.push(route)
        } else {
          let parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'))
          let parent = map[parentPath]
          if (parent && parent.children) {
            parent.children.push(route)
          }
        }

        map[currentPath] = route

        if (route.children) {
          currentLevel = route.children
        }
      } else {
        currentLevel = map[currentPath].children || []
        map[currentPath].children = currentLevel
      }
    })
  })

  return routes
}
