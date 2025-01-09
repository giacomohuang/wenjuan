import fetch from './fetch'

const permission = {
  resource: {
    get(id, locale = null) {
      return fetch({
        data: { id, locale },
        url: '/permission/resource/get',
        method: 'post'
      })
    },

    list(pid, isOneLevel) {
      return fetch({
        data: { pid: pid, isOneLevel },
        url: '/permission/resource/list',
        method: 'post'
      })
    },
    add(item) {
      return fetch({
        data: item,
        url: '/permission/resource/add',
        method: 'post'
      })
    },
    update(item) {
      return fetch({
        data: item,
        url: '/permission/resource/update',
        method: 'post'
      })
    },
    remove(path) {
      console.log('remove api', path)
      return fetch({
        data: { path: path },
        url: '/permission/resource/remove',
        method: 'post'
      })
    },
    reorder(ids) {
      return fetch({
        data: JSON.stringify(ids),
        url: '/permission/resource/reorder',
        method: 'post'
      })
    },
    getMenu() {
      return fetch({
        url: '/permission/resource/getMenu',
        method: 'post'
      })
    }
  },
  role: {
    get(id) {
      return fetch({
        data: { id: id },
        url: '/permission/role/get',
        method: 'post'
      })
    },
    list(pid) {
      return fetch({
        data: { pid: pid },
        url: '/permission/role/list',
        method: 'post'
      })
    },
    add(item) {
      console.log('add api', item)
      return fetch({
        data: JSON.stringify(item),
        url: '/permission/role/add',
        method: 'post'
      })
    },
    update(item) {
      console.log('update api', item)
      return fetch({
        data: JSON.stringify(item),
        url: '/permission/role/update',
        method: 'post'
      })
    },
    remove(path) {
      return fetch({
        data: { path: path },
        url: '/permission/role/remove',
        method: 'post'
      })
    },
    reorder(ids) {
      return fetch({
        data: JSON.stringify(ids),
        url: '/permission/role/reorder',
        method: 'post'
      })
    }
  }
}
export default permission
