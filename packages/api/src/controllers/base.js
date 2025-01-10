import Counter from '../models/counter.js'

class BaseController {
  constructor() {}
  static async getNextId(name) {
    const query = { _id: name }
    const update = { $inc: { seq: 1 } }
    const options = { new: true, upsert: true }
    const doc = await Counter.findOneAndUpdate(query, update, options)
    return doc.seq
  }
  static success(res) {
    res.json({
      code: 200,
      msg: 'success',
      data: res
    })
  }

  static fail(res, err) {
    console.error(err)
    res.json({
      code: 500,
      msg: err
    })
  }
}

export default BaseController
