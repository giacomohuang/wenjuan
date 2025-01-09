const database = 'mpadmin'
use(database)

const id = '10-11'
db.roles.find({ path: new RegExp(`^${id}(-\\d+)*$`) })

// 正则表达式，输入10-11，匹配10-11，10-11-15，10-11-15-16，但不能匹配10-111
