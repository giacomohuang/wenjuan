import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/views/Layout.vue'
import helper from '../js/helper'
import i18n, { loadLocaleData, getLocale } from '../js/i18n'
import account from '../api/account'

export const router = createRouter({
  history: createWebHistory('/'),
  // scrollBehavior(to, from, savedPosition) {
  //   return {
  //     el: 'main',
  //     top: 0
  //   }
  // },
  // 静态加载的公共页面，不需要认证token
  routes: [
    { path: '/', redirect: '/wenjuan/project', meta: { title: 'wenjuan.project._title' } },
    { path: '/signin', name: 'signin', component: () => import('@/views/Signin.vue'), meta: { title: 'signin._title', noAuth: true } },
    { path: '/downauthapp', name: 'downauthapp', component: () => import('@/views/DownAuthApp.vue'), meta: { title: 'downauthapp._title', noAuth: true } },
    { path: '/404', name: '404', component: () => import('@/views/404.vue'), meta: { title: '404._title', noAuth: true } },
    { path: '/:pathMatch(.*)', redirect: '/404', meta: { title: '404._title', noAuth: true } }
  ]
})

const setTitle = (title) => {
  if (title) {
    document.title = `${i18n.global.t('common.appname')} - ${i18n.global.t(title)}`
  } else {
    document.title = i18n.global.t('common.appname')
  }
}

// 路由前置守卫
router.beforeEach(async (to, from, next) => {
  const { meta } = to
  // 载入路由对应的语言文件
  // console.log(getLocale())
  // console.log(to.path)
  // console.log(meta)
  // console.log(localStorage.getItem('refreshToken'))

  setTitle(meta.title)
  // 如果当前页面不需要认证token，直接放行
  if (meta.noAuth) {
    next()
  }
  // 如果需要认证token
  else {
    try {
      // console.log('token认证')
      // console.log(localStorage.getItem('refreshToken'))
      const resp = await account.verifyToken(helper.getToken())
      // console.log('resp', resp)
      if (!resp) throw new Error('token认证失败')
      // 如果响应头中有token刷新请求，刷新token
      // if (resp.newAccessToken && resp.newRefreshToken) {
      //   helper.setToken({ accessToken: resp.newAccessToken, refreshToken: resp.newRefreshToken })
      // }
      // 验证通过，放行
      next()
    } catch (e) {
      // console.log('验证失败', e)
      // 验证不通过，跳登录页
      if (e.status && e.status === 401) {
        next({ path: '/signin' })
        // console.log('e', e)
      } else if (e.status && e.status === 409) {
        const { newAccessToken, newRefreshToken } = await API.account.refreshToken(localStorage.getItem('refreshToken'))
        helper.setToken({ accessToken: newAccessToken, refreshToken: newRefreshToken })
        // console.log('====token 刷新了========')
      }
      // 如果是服务器内部错误或者未知错误，放行并传递异常给业务
      else {
        next()
      }
    }
  }
})

// export const dynamicRoutes = [
//   {
//     path: '/workspace',
//     component: Layout,
//     name: 'workspace',
//     meta: { title: 'common.route.workspace', permissionId: '000010000' },
//     icon: '#icon-workspace',
//     children: [
//       { path: '/workspace/main', component: () => import('@/views/Workspace/Main.vue'), meta: { title: 'common.route.workspace', permission: '0000010001' } },
//       { path: '/workspace/upload', component: () => import('@/views/Workspace/Upload.vue'), meta: { title: 'common.route.upload', permission: '0000010002' } }
//     ]
//   },
//   {
//     path: '/account',
//     component: Layout,
//     name: 'account',
//     meta: { title: 'common.route.account', permissionId: '000010000' },
//     icon: '#icon-Account',
//     children: [
//       { path: '/account/accountlist', component: () => import('@/views/Account/AccountList.vue'), meta: { title: 'common.route.accountlist', permission: '0000010001' } },
//       { path: '/account/permission', component: () => import('@/views/Account/Permission.vue'), meta: { title: 'common.route.permission', permission: '0000010001' } }
//     ]
//   },
//   {
//     path: '/voucher',
//     component: Layout,
//     name: 'voucher',
//     meta: { title: 'common.route.voucher', permissionId: '100' },
//     icon: '#icon-voucher',
//     children: [
//       {
//         path: '/voucher/voucherlist',
//         name: 'voucherlist',
//         meta: { title: 'common.route.voucherlist', permission: '000010001' },
//         children: [
//           { path: '/voucher/voucheradd', component: () => import('@/views/Voucher/VoucherList.vue'), meta: { title: 'common.route.voucherlist', permission: '000010001' } },
//           { path: '/voucher/verification', component: () => import('@/views/Voucher/Verification.vue'), meta: { title: 'common.route.verification', permission: '0000100003' } }
//         ]
//       },
//       { path: '/voucher/templatelist', component: () => import('@/views/Voucher/TemplateList.vue'), meta: { title: 'common.route.templatelist', permission: '000010002' } }
//     ]
//   },
//   {
//     path: '/my',
//     component: Layout,
//     name: 'my',
//     meta: { title: 'common.route.my', permissionId: '000010000' },
//     icon: '#icon-my',
//     children: [
//       { path: '/my/profile', component: () => import('@/views/My/Profile.vue'), meta: { title: 'common.route.profile', permission: '40001' } },
//       { path: '/my/authentication', component: () => import('@/views/My/Authentication.vue'), meta: { title: 'common.route.authentication', permission: '40002' } }
//     ]
//   }
// ]

// console.log(dynamicRoutes)
