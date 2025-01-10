import mongoose from 'mongoose'

const iconSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  }
})

iconSchema.index({ name: 1 })
iconSchema.index({ path: 1 })

export default mongoose.model('Icon', iconSchema)
