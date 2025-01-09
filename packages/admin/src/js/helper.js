const helper = {
  getQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
    var r = window.location.search.substring(1).match(reg)
    if (r != null) {
      return decodeURIComponent(r[2])
    }
    return null
  },
  deepCopyJson(obj) {
    return JSON.parse(JSON.stringify(obj))
  },

  sortJSON(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys)
    }

    const sortedObj = {}
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        sortedObj[key] = this.sortJSON(obj[key])
      })

    return sortedObj
  },

  decodeToken(type = 'access') {
    let token, tokenArray, result

    if (type === 'refresh') {
      token = localStorage.getItem('refreshToken')
    } else {
      token = localStorage.getItem('accessToken')
    }
    if (!token) return
    tokenArray = token.split('.')
    if (tokenArray.length != 3) {
      throw Error('invalid token')
    }
    // console.log(tokenAr)
    return JSON.parse(atob(tokenArray[1]))
  },

  getToken(data) {
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    // console.log('==get token==')
    // console.log('accessToken:', localStorage.getItem('accessToken'))
    // console.log('refreshToken:', localStorage.getItem('refreshToken'))
    return {
      accessToken,
      refreshToken
    }
  },

  setToken(data) {
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    // console.log('！！！！==set token===！！！！')
    // console.log('accessToken:', localStorage.getItem('accessToken'))
    // console.log('refreshToken:', localStorage.getItem('refreshToken'))
  },

  removeToken() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },

  // 混淆敏感信息
  obfuscate(type, value) {
    switch (type) {
      case 'email':
        return value.replace(/^(.)(.*)(?=@)/, (_, firstChar, middlePart) => firstChar + '*'.repeat(middlePart.length) + middlePart.slice(-1))
      case 'phone':
        return value.replace(/^(\d{3})(\d{6})(\d*)/, (_, firstThree, middleSix, last) => firstThree + '*'.repeat(6) + last)
      default:
        return value
    }
  }
}
export default helper
