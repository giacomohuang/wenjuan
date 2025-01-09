import { defineStore } from 'pinia'

export const useStore = defineStore('store', {
  state: () => {
    return {
      theme: '',
      accountname: undefined,
      accountid: undefined,
      realname: undefined,
      locale: undefined
    }
  },
  actions: {
    changeTheme(value) {
      this.theme = value
    }
  }
})
