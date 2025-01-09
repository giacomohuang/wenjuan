import axios from 'axios'
import baseUrl from './baseUrl'
import { router } from '../router/router'
import CryptoJS from 'crypto-js'
import { customAlphabet } from 'nanoid'
import helper from '../js/helper'
import API from '../api/API'

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10)
let isRefreshing = false
let requests = []

axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'
axios.defaults.withCredentials = true // 允许携带cookie
let fetch = axios.create({
  baseURL: baseUrl.default,
  timeout: 10000,
  withCredentials: true
})

// 服务器请求拦截器
fetch.interceptors.request.use(
  (config) => {
    // console.log(config)
    const accesstoken = localStorage.getItem('accessToken')
    // console.log('请求拦截')
    // console.log('refresh:', localStorage.getItem('refreshToken'))
    config.headers['locale'] = localStorage.getItem('locale')
    if (accesstoken) {
      config.headers['Authorization'] = 'Bearer ' + accesstoken
      config.headers['refreshtoken'] = localStorage.getItem('refreshToken')
    }
    const params = config.data || {}
    const nonce = nanoid()
    const timestamp = Date.now()
    const sortedParams = JSON.stringify(helper.sortJSON(params)) + nonce + timestamp
    const cipher = CryptoJS.HmacSHA256(sortedParams, import.meta.env.VITE_SIGN_KEY)
    const cipherText = CryptoJS.enc.Hex.stringify(cipher)
    config.headers['sign'] = cipherText
    config.headers['nonce'] = nonce
    config.headers['timestamp'] = timestamp
    // console.log('===请求拦截===')
    // console.log(cipherText, nonce, timestamp)
    return config
  },
  (err) => {
    console.log('network error')
    return Promise.reject(new Error(err))
  }
)

//服务器响应拦截器
fetch.interceptors.response.use(
  (response) => {
    // 如果header中携带refreshToken，更新本地存储
    // storeRefreshToken(response)

    return response.data
  },
  async (err) => {
    const { response } = err
    // console.log(response)
    if (!response) return Promise.reject({ status: 500, message: 'Internal Server Error' })
    // 如果header中携带refreshToken，更新本地存储
    switch (response.status) {
      // accesstoken过期
      case 409:
        try {
          // 使用isRefreshing解决并发问题
          if (!isRefreshing) {
            isRefreshing = true
            // console.log('响应拦截')
            // console.log('refresh token:', localStorage.getItem('refreshToken'))
            const { newAccessToken, newRefreshToken } = await API.account.refreshToken(localStorage.getItem('refreshToken'))
            helper.setToken({ accessToken: newAccessToken, refreshToken: newRefreshToken })
            // ----------------
            response.config.headers['Authorization'] = 'Bearer ' + newAccessToken
            response.config.headers['refreshtoken'] = newRefreshToken
            isRefreshing = false
            // 重新执行队列中的请求
            requests.forEach((cb) => cb())
            // 清空队列
            requests = []
            // 重新执行本次请求
            return new Promise((resolve) => {
              resolve(fetch(response.config))
            })
          }
          // 暂时将并发的请求挂起，暂存到requests中
          else {
            return new Promise((resolve) => {
              requests.push(() => resolve(fetch(response.config)))
            })
          }
        } catch (err) {
          console.log(err)
          isRefreshing = false
          router.push('/signin')
        }
        break
      // jwt/sign鉴权失败
      case 401:
        console.log(response)
        router.push('/signin')
        break
      // 一般业务错误
      case 500:
      default:
        console.log(response)
        return Promise.reject(response)
    }
  }
)

export default fetch
