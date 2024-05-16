import createHttpError from 'http-errors';

import redis from '~/shared/db/redis';

import { User } from './users.model';
import { UserSchema } from './users.schema';

class UsersService {
  async getById(userId: string) {
    const userInMemory = await redis.client.get(`user:${userId}`);

    if (userInMemory) {
      const _user = JSON.parse(userInMemory);
      _user.createdAt = new Date(_user.createdAt);
      _user.updatedAt = new Date(_user.updatedAt);

      return _user;
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new createHttpError.NotFound('User not found');
    }

    UserSchema.parse(user);

    await redis.client.set(`user:${user._id}`, JSON.stringify(user));

    return user;
  }
}

export default new UsersService();
