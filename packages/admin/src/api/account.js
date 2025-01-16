import fetch from './fetch'
import baseUrl from './baseUrl'

const account = {
  getPermissions(uid) {
    return fetch({
      baseURL: baseUrl.account,
      method: 'get',
      params: { uid: uid },
      url: '/account/getpermissions'
    })
  },
  refreshToken(refreshToken) {
    // console.log(refreshToken)
    return fetch({
      baseURL: baseUrl.account,
      method: 'post',
      data: { refreshToken },
      url: '/account/refreshtoken'
    })
  },
  signin(params) {
    return fetch({
      baseURL: baseUrl.account,
      method: 'post',
      data: params,
      url: '/account/signin'
    })
  },
  signin2FA(params) {
    return fetch({
      baseURL: baseUrl.account,
      method: 'post',
      data: params,
      url: '/account/signin2FA'
    })
  },
  signout() {
    return fetch({
      baseURL: baseUrl.account,
      method: 'post',
      url: '/account/signout'
    })
  },
  verifyToken(token) {
    return fetch({
      baseURL: baseUrl.account,
      method: 'post',
      data: token,
      url: '/account/verifytoken'
    })
  },
  generateTotpSecret(params) {
    return fetch({
      baseURL: baseUrl.account,
      method: 'post',
      data: params,
      url: '/account/generatetotpsecret'
    })
  },
  verifyTotp(token) {
    return fetch({
      baseURL: baseUrl.account,
      method: 'post',
      data: token,
      url: '/account/verifytotp'
    })
  },
  updatePassword(oldPassword, newPassword) {
    return fetch({
      baseURL: baseUrl.account,
      method: 'post',
      data: { oldPassword, newPassword },
      url: '/account/updatepassword'
    })
  },

  initPassword(oldPassword, newPassword, accountid) {
    return fetch({
      baseURL: baseUrl.account,
      method: 'post',
      data: { accountid, oldPassword, newPassword },
      url: '/account/initpassword'
    })
  },
  updateEmail(verifycode, email) {
    return fetch({
      baseURL: baseUrl.account,
      method: 'post',
      data: { verifycode, email },
      url: '/account/updateemail'
    })
  },
  updatePhone(verifycode, areacode, phone) {
    return fetch({
      baseURL: baseUrl.default,
      method: 'post',
      data: { verifycode, areacode, phone },
      url: '/account/updatephone'
    })
  },
  updateTotpSecret(totpSecret) {
    return fetch({
      baseURL: baseUrl.account,
      method: 'post',
      data: totpSecret,
      url: '/account/updatetotpsecret'
    })
  },
  update2FA(enable2FA) {
    return fetch({
      baseURL: baseUrl.account,
      method: 'post',
      data: enable2FA,
      url: '/account/update2fa'
    })
  },
  getAuthInfo() {
    return fetch({
      baseURL: baseUrl.default,
      method: 'post',
      url: '/account/getauthinfo'
    })
  },
  hello() {
    return fetch({
      baseURL: baseUrl.account,
      method: 'get',
      url: '/account/hello'
    })
  },
  hello1(num) {
    return fetch({
      baseURL: baseUrl.account,
      method: 'post',
      data: { num },
      url: '/account/hello1'
    })
  },
  list(page, limit, keywords, status, enable2FA) {
    return fetch({
      baseURL: baseUrl.account,
      method: 'post',
      data: { page, limit, keywords, status, enable2FA },
      url: '/account/list'
    })
  },
  get(id) {
    return fetch({
      baseURL: baseUrl.account,
      method: 'post',
      data: { id },
      url: '/account/get'
    })
  },
  searchByName(keyword, page, limit) {
    return fetch({
      baseURL: baseUrl.account,
      method: 'post',
      data: { keyword, page, limit },
      url: '/account/searchbyname'
    })
  },
  save(data) {
    return fetch({
      baseURL: baseUrl.account,
      method: 'post',
      data,
      url: '/account/save'
    })
  }
}
export default account
