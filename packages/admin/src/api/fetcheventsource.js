import CryptoJS from 'crypto-js'
import helper from '../js/helper'
import { nanoid } from 'nanoid'

class FetchEventSource {
  constructor() {
    this.abortController = new AbortController() || null
  }
  startFetchEvent(url, body, onMessage, onEnd, onError) {
    const accesstoken = localStorage.getItem('accessToken')
    const params = body ? body : {}
    const nonce = nanoid()
    const timestamp = Date.now()
    const sortedParams = JSON.stringify(helper.sortJSON(params)) + nonce + timestamp
    const cipher = CryptoJS.HmacSHA256(sortedParams, import.meta.env.VITE_SIGN_KEY)
    const cipherText = CryptoJS.enc.Hex.stringify(cipher)

    const fetchOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        Authorization: 'Bearer ' + accesstoken,
        refreshtoken: localStorage.getItem('refreshToken'),
        sign: cipherText,
        nonce: nonce,
        timestamp: timestamp
      }
    }
    fetch(url, fetchOptions)
      .then(async (response) => {
        const reader = response.body.getReader()
        while (true) {
          const { value } = await reader.read()
          const decoder = new TextDecoder('utf-8')
          let data = decoder.decode(value)
          onMessage(data)
          if (data.includes('DONE]')) {
            reader.releaseLock() // 释放读取器锁
            response.body.cancel()
            onEnd()
            break
          }
        }
      })
      .catch((err) => {
        console.log(err)
        onError({ code: 201, message: '服务器异常' })
      })
  }
}

export default FetchEventSource
