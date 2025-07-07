import { Schema, model, HookNextFunction } from 'mongoose'
import bcrypt from 'bcryptjs'

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, "can't be blank"],
    unique: true,
    index: true,
    match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
  },
  email: {
    type: String,
    required: [true, "can't be blank"],
    unique: true,
    index: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'is invalid']
  },
  password: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: 'https://static.productionready.io/images/smiley-cyrus.jpg'
  },
}, { timestamp: true })

UserSchema.pre('save', async function(next: HookNextFunction) {
  if (!this.isModified('password')) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    // const salt = await bcrypt.hash(this.password, salt)

    this.password = await bcrypt.hash(this.password, salt)

    return next()
  } catch (err) {
    return next(err as Error)
  }
})

UserSchema.methods.comparePassword =
  async function(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password)
}

const User = model('User', UserSchema)

export default User
