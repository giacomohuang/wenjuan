import { fakerZH_CN as faker } from '@faker-js/faker'
import Account from '../models/account.js'

const genAccounts = async (num) => {
  let accounts = []
  for (let i = 0; i < num; i++) {
    accounts.push({
      accountname: faker.internet.userName(),
      realname: faker.internet.displayName(),
      password: faker.internet.password(),
      orgId: faker.database.mongodbObjectId(),
      entityId: faker.database.mongodbObjectId(),
      avatar: faker.image.avatar(),
      areacode: '86',
      phone: faker.phone.number(),
      email: faker.internet.email(),
      type: faker.number.int({ min: 0, max: 3 }),
      totpSecret: faker.internet.password(),
      enable2FA: faker.datatype.boolean(),
      initPwd: faker.datatype.boolean(),
      status: 1,
      OperatorId: faker.database.mongodbObjectId(),
      OperateTime: faker.date.recent()
    })
  }
  await Account.insertMany(accounts)
}

export { genAccounts }
