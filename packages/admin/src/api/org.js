import fetch from './fetch'

export const org = {
  list() {
    return fetch({
      url: '/org/list',
      method: 'post'
    })
  },
  get(id) {
    return fetch({
      data: { _id: id },
      url: '/org/get',
      method: 'post'
    })
  },
  update(item) {
    return fetch({
      data: JSON.stringify(item),
      url: '/org/update',
      method: 'post'
    })
  },
  rename(id, name, fullname, path) {
    return fetch({
      data: { id: id, name: name, fullname: fullname, path: path },
      url: '/org/rename',
      method: 'post'
    })
  },
  reorder(items) {
    return fetch({
      data: JSON.stringify(items),
      url: '/org/reorder',
      method: 'post'
    })
  },
  add(item) {
    return fetch({
      data: JSON.stringify(item),
      url: '/org/add',
      method: 'post'
    })
  },
  remove(path) {
    return fetch({
      data: { path: path },
      url: '/org/remove',
      method: 'post'
    })
  }
}
export default org
