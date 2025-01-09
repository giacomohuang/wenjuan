import fetch from './fetch'
import baseUrl from './baseUrl'
const verification = {
  sendCodeBySMS(areacode, phone, accountid) {
    return fetch({
      baseURL: baseUrl.default,
      url: '/verification/sendcodebysms',
      method: 'post',
      data: { areacode, phone, accountid }
    })
  },
  sendCodeByEmail(email, accountid) {
    return fetch({
      baseURL: baseUrl.default,
      url: '/verification/sendcodebyemail',
      method: 'post',
      data: { email, accountid }
    })
  }
}
export default verification
