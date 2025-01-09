import { router } from './router'
import dynamicRoutes from 'virtual:router'

// import store from './store'
// import { Message } from 'element-ui'
// import NProgress from 'nprogress' // progress bar
// import 'nprogress/nprogress.css' // progress bar style
// import { getToken } from '@/utils/auth' // getToken from cookie

// NProgress.configure({ showSpinner: false }) // NProgress Configuration

// permissiom judge function
// function hasPermission(userPermissions, allowedPermission) {
//   if (allowedPermission) {
//     return userPermissions.indexOf(allowedPermission) >= 0
//   } else {
//     return true
//   }
// }
addRoutes(dynamicRoutes)

function addRoutes(routes) {
  for (let route of routes) {
    // console.log(route)
    router.addRoute(route)
    // if (route.children && route.children.length) {
    //   addRoutes(route.children)
    // }
  }
}
// function getDynamicRoute(routes, permissions){
//   router.beforeEach((to, from, next) => {
//     routes.forEach((route) => {
//       if (route.children && route.children.length)
//         route
//     })
//   })

// }

// const whiteList = ['/signin'] // no redirect whitelist

// router.beforeEach((to, from, next) => {
//   NProgress.start() // start progress bar
//   if (getToken()) {
//     // determine if there has token
//     if (store.getters.permissions.length === 0) {
//       // 判断当前用户是否已拉取完user_info信息
//       store
//         .dispatch('GetAccountInfo')
//         .then((res) => {
//           // 拉取user_info
//           const permissions = res.data.permissions // note: roles must be a array! such as: ['editor','develop']
//           store.dispatch('GenerateRoutes', { permissions }).then(() => {
//             // 根据roles权限生成可访问的路由表
//             router.addRoutes(store.getters.permission_routers) // 动态添加可访问路由表
//             next({ ...to, replace: true }) // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
//           })
//         })
//         .catch(() => {
//           store.dispatch('Fedsignout').then(() => {
//             Message.error('Verification failed, please signin again')
//             next({ path: '/signin' })
//           })
//         })
//     } else {
//       // 没有动态改变权限的需求可直接next() 删除下方权限判断
//       if (hasPermission(store.getters.permissions, to.meta.permission)) {
//         next()
//       } else {
//         next({ path: '/401', replace: true, query: { noGoBack: true } })
//       }
//     }
//   } else {
//     /* has no token */
//     if (whiteList.indexOf(to.path) !== -1) {
//       // 在免登录白名单，直接进入
//       next()
//     } else {
//       next('/signin') // 否则全部重定向到登录页
//       NProgress.done() // if current page is signin will not trigger afterEach hook, so manually handle it
//     }
//   }
// })

// router.afterEach(() => {
//   NProgress.done() // finish progress bar
// })
