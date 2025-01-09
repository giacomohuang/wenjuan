const DEFAULT_LANGUAGE = 'zh-CN'

function i18nPlugin(schema) {
  const defaultLang = process.env.DEFAULT_LANGUAGE || DEFAULT_LANGUAGE
  const languages = process.env.LANGUAGES.split(',')
  const i18nFields = []

  // 遍历 schema 查找需要国际化的字段
  schema.eachPath((path, schemaType) => {
    if (schemaType.options.i18n) {
      i18nFields.push(path)
      // 将原字段转换为对象结构
      const field = {}
      languages.forEach((lang) => {
        field[lang] = schemaType.options.type
      })
      schema.remove(path)
      schema.add({
        [path]: field
      })
    }
  })

  // 扩展 Query 方法支持 i18n 查询
  schema.query.i18n = function (language) {
    const lang = language || defaultLang

    // 修改查询条件
    const conditions = this.getQuery()
    Object.keys(conditions).forEach((key) => {
      if (this.model.schema.path(`${key}.${lang}`)) {
        conditions[`${key}.${lang}`] = conditions[key]
      }
    })

    // 添加转换中间件
    this.transform((doc) => {
      const transformed = doc.map((item) => {
        const temp = item.toObject()
        i18nFields.forEach((field) => {
          if (temp[field] && temp[field][lang]) {
            temp[field] = temp[field][lang]
          } else if (temp[field] && temp[field][defaultLang]) {
            temp[field] = temp[field][defaultLang]
          } else {
            temp[field] = null
          }
        })
        return temp
      })
      console.log('transformed', transformed)
      return transformed
    })

    return this
  }
}

export default i18nPlugin
