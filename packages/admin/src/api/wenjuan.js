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
  }
}
export default wenjuan
