const ClientEncryption = require('mongodb').ClientEncryption
const crypto = require('crypto')
const mongoose = require('mongoose')
const fs = require('fs')
const uri = 'mongodb://localhost:27017/mpadmin'
const keyVaultDatabaseName = 'encryption'
const keyVaultCollectionName = '__keyVault'
const keyVaultNamespace = `${keyVaultDatabaseName}.${keyVaultCollectionName}`
const encryptedDatabaseName = 'mpadmin'
const encryptedCollectionName = 'accounts'
const kmsProviderName = 'local'
const VerificationContoller = require('./controllers/verificaiton')
//
VerificationContoller.sendEmail()
// try {
//   fs.writeFileSync('customer-master-key.txt', crypto.randomBytes(96))
// } catch (err) {
//   console.error(err)
// }
const key = fs.readFileSync('./customer-master-key.txt')
const kmsProviders = { local: { key } }

const conn = mongoose.connect(uri).then(() => {
  console.log('MongoDB is connected!')
})

// const keyVaultSchema = new mongoose.Schema({
//   _id: {
//     type: mongoose.Schema.Types.ObjectId,
//     auto: true
//   },
//   keyAltNames: {
//     type: [String],
//     default: []
//   },
//   keyMaterial: {
//     type: Buffer,
//     required: true
//   }
// })

async function run() {
  // // 打印密钥的十六进制表示（仅作示例，真实环境中不应打印或明文存储密钥）

  const conn = await mongoose.createConnection(uri).asPromise()

  const clientEnc = new ClientEncryption(conn.client, {
    keyVaultNamespace: keyVaultNamespace,
    kmsProviders: kmsProviders
  })
  const dek1 = await clientEnc.createDataKey(kmsProviderName, {
    keyAltNames: ['dataKey1']
  })
  const dek12 = await clientEnc.createDataKey(kmsProviderName, {
    keyAltNames: ['dataKey2']
  })

  const encryptedFieldsMap = {
    [`${encryptedDatabaseName}.${encryptedCollectionName}`]: {
      fields: [
        {
          keyId: dek1,
          path: 'phone',
          bsonType: 'string',
          queries: { queryType: 'equality' }
        }
      ]
    }
  }
  const extraOptions = { cryptSharedLibPath: '/usr/local/mongo_crypt/lib/mongo_crypt_v1.dylib' }
  const encClient = new MongoClient(uri, {
    autoEncryption: {
      keyVaultNamespace,
      kmsProviders,
      extraOptions,
      encryptedFieldsMap
    }
  })
  await encClient.connect()
}

const encryption = new ClientEncryption(unencryptedClient, {
  keyVaultNamespace,
  kmsProviders
})

// const KeyVault = mongoose.model('KeyVault', keyVaultSchema)
// KeyVault.createIndexes(
//   { keyAltNames: 1 },
//   {
//     unique: true,
//     partialFilterExpression: {
//       keyAltNames: {
//         $exists: true
//       }
//     }
//   }
// )

// const clientEncryption = new ClientEncryption(mongoose.connection.client, {
//   keyVaultNamespace,
//   kmsProviders
// })
// clientEncryption.createDataKey('local', {
//   masterKey: {
//     keyAltName: 'my-key'
//   }
// }).then(dataKeyId => {
//   console.log(dataKeyId)
// })
run()
