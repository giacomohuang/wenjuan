import mongoose from 'mongoose'

const spaceMembersSchema = new mongoose.Schema({
  memberId: {
    type: Array
  },
  role: {
    type: String
  }
})

const spaceSchema = new mongoose.Schema({
  name: {
    type: String
  },
  members: {
    type: spaceMembersSchema
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('Space', spaceSchema, 'space')
