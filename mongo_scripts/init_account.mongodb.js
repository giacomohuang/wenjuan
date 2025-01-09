const { fakerZH_CN: faker } = require('@faker-js/faker')
const crypto = require('crypto')
const { getUniquePingyinForName, getUniquePingyinForCommon, getAllComPingyinForStr } = require('../utils/pinyin.cjs')
const accounts = []

const defaultAccount = {
  accountname: 'admin',
  realname: '超级管理员',
  alias: 'super admin',
  pinyin: 'chaojiguanliyuan,CJGLY',
  password: '3deca356cdc09f5bcc1966f2e10f315d07dce7adb4f3b1a453878fef771dc960', // 使用bcrypt加密密码
  orgId: null,
  orgFullName: null,
  entityId: null,
  avatar: faker.image.avatar(),
  areacode: '021',
  phone: '13814569876',
  email: 'giacomohuang@gmail.com',
  type: 1,
  totpSecret: 'FJJXAKDPJBIGIPZIGBUDA5ZGJ5SUIVLB',
  enable2FA: false,
  initPwd: true,
  status: 1,
  OperatorId: null,
  OperateTime: faker.date.past()
}

accounts.push(defaultAccount)

// 生成1000条测试数据
const generateTestData = (count) => {
  for (let i = 0; i < count; i++) {
    const realname = faker.person.fullName()
    const py = getUniquePingyinForName(realname)
    const account = {
      accountname: faker.internet.userName() + faker.string.alphanumeric(3),
      realname: realname,
      pinyin: py.fristPy + ',' + py.fullPy,
      password: crypto.createHmac('sha256', 'ABCDEFG@12345686').update('Udkri47%4f8').digest('hex'), // 使用bcrypt加密密码
      orgId: null,
      orgFullName: null,
      entityId: faker.string.uuid(),
      avatar: faker.image.avatar(),
      areacode: '86',
      phone: faker.phone.number(),
      email: faker.internet.email(),
      type: 1,
      totpSecret: null,
      enable2FA: false,
      initPwd: true,
      status: faker.number.int({ min: 0, max: 1 }),
      OperatorId: null,
      OperateTime: faker.date.past()
    }
    accounts.push(account)
  }
  return accounts
}

generateTestData(1000)

const database = 'mpadmin'
use(database)

db.accounts.deleteMany({})
db.accounts.insertMany(accounts)
console.log(accounts.length)
