import fetch from './fetch'
import baseUrl from './baseUrl'

const wenjuan = {
  list(page, limit, keywords, teamId, sort) {
    console.log('list')
    return fetch({
      baseURL: baseUrl.wenjuan,
      method: 'post',
      data: { page, limit, keywords, teamId, sort },
      url: '/wenjuan/list'
    })
  },
  get(id) {
    return fetch({
      baseURL: baseUrl.wenjuan,
      method: 'post',
      data: { id: id },
      url: '/wenjuan/get'
    })
  },
  update(data) {
    console.log('update API')
    return fetch({
      baseURL: baseUrl.wenjuan,
      method: 'post',
      data: JSON.stringify(data),
      url: '/wenjuan/update'
    })
  },
  remove(ids) {
    console.log('remove', ids)
    return fetch({
      baseURL: baseUrl.wenjuan,
      method: 'post',
      data: JSON.stringify(ids),
      url: '/wenjuan/remove'
    })
  },
  getVersion(id, version) {
    return fetch({
      baseURL: baseUrl.wenjuan,
      method: 'post',
      data: { id: id, version: version },
      url: '/wenjuan/getVersion'
    })
  },
  getVersionList(id, page, limit) {
    return fetch({
      baseURL: baseUrl.wenjuan,
      method: 'post',
      data: { id: id, page: page, limit: limit },
      url: '/wenjuan/getVersionList'
    })
  },
  cooperatorList(id) {
    return fetch({
      baseURL: baseUrl.wenjuan,
      method: 'post',
      data: { id: id },
      url: '/wenjuan/cooperatorList'
    })
  },
  addCooperator(id, accountId, role) {
    return fetch({
      baseURL: baseUrl.wenjuan,
      method: 'post',
      data: { id: id, accountId: accountId, role: role },
      url: '/wenjuan/addCooperator'
    })
  },
  removeCooperator(id, accountId) {
    return fetch({
      baseURL: baseUrl.wenjuan,
      method: 'post',
      data: { id: id, accountId: accountId },
      url: '/wenjuan/removeCooperator'
    })
  },
  updateCooperatorRole(id, accountId, role) {
    return fetch({
      baseURL: baseUrl.wenjuan,
      method: 'post',
      data: { id: id, accountId: accountId, role: role },
      url: '/wenjuan/updateCooperatorRole'
    })
  },
  // 获取问卷统计数据
  getStat(id, page = 1, limit = 10) {
    return fetch({
      baseURL: baseUrl.wenjuan,
      method: 'post',
      data: { id, page, limit },
      url: '/wenjuan/stat'
    })
  },
  // 提交问卷答案
  submit(id, data) {
    return fetch({
      baseURL: baseUrl.wenjuan,
      method: 'post',
      data,
      url: `/wenjuan/submit/${id}`
    })
  }
}
export default wenjuan
