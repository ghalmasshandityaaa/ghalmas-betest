import mongoose, { type CallbackError, Schema } from 'mongoose';

import scrypt from '~/shared/lib/scrypt';

export const UserEntitySchema = new Schema({
  userName: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  identityNumber: {
    type: String,
    required: true,
    unique: true,
  },
  emailAddress: {
    type: String,
    lowercase: true,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
    required: true,
  },
});

UserEntitySchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await scrypt.hash(this.password);
    return next();
  } catch (e) {
    return next(e as CallbackError);
  }
});

export const User = mongoose.model('User', UserEntitySchema);
