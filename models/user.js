'use strict'

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  local: {
    firstname: { type: String },
    username: { type: String, unique: true },
    password: { type: String },
    created: { type: Date, default: Date.Now },
    words: { type: Object, default: null },
    lastWord: { type: Object, default: null },
    grade: { type: Number, default: 1 },
    experience: { type: Number, default: 0 }
  },
  google: {
    firstname: { type: String, default: null },
    googleId: { type: String, default: null },
    password: { type: String, default: null }
  }
})

userSchema.set('toObject', {
  transform: function(doc, ret) {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    delete ret.local.password
  }
})

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.local.password)
}

userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10)
}

const User = mongoose.model('User', userSchema)

module.exports = User
