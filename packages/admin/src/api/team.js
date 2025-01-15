import fetch from './fetch'
import baseUrl from './baseUrl'

const team = {
  // 获取团队列表
  list(params = {}) {
    console.log('list', params)
    return fetch({
      baseURL: baseUrl.default,
      url: 'team/list',
      method: 'post',
      data: params
    })
  },

  // 获取用户所属团队列表s
  listByAccountId(params = {}) {
    return fetch({
      baseURL: baseUrl.default,
      url: 'team/listByAccountId',
      method: 'post',
      data: params
    })
  },

  // 创建团队
  create(data) {
    return fetch({
      baseURL: baseUrl.default,
      url: 'team/create',
      method: 'post',
      data: JSON.stringify(data)
    })
  },

  // 更新团队信息
  update(data) {
    return fetch({
      baseURL: baseUrl.default,
      url: 'team/update',
      method: 'post',
      data: JSON.stringify(data)
    })
  },

  // 删除团队
  delete(id) {
    return fetch({
      baseURL: baseUrl.default,
      url: 'team/delete',
      method: 'post',
      data: { id }
    })
  },

  // 获取团队详情
  getTeamDetail(id) {
    return fetch({
      baseURL: baseUrl.default,
      url: `/api/teams/${id}`,
      method: 'get'
    })
  },

  // 添加团队成员
  addMember(data) {
    return fetch({
      baseURL: baseUrl.default,
      url: `/team/addmember`,
      method: 'post',
      data: JSON.stringify(data)
    })
  },

  // 移除团队成员
  removeMember(data) {
    return fetch({
      baseURL: baseUrl.default,
      url: `/team/removeMember`,
      method: 'post',
      data: JSON.stringify(data)
    })
  },

  // 获取团队成员列表
  memberList(data) {
    return fetch({
      baseURL: baseUrl.default,
      url: `/team/memberList`,
      method: 'post',
      data: JSON.stringify(data)
    })
  },
  updateMemberRole(params) {
    return fetch({
      baseURL: baseUrl.default,
      url: '/team/updateMemberRole',
      method: 'post',
      data: JSON.stringify(params)
    })
  }
}

export default team
