import createHttpError from 'http-errors';

import redis from '~/shared/db/redis';

import { User } from './users.model';
import { UserSchema } from './users.schema';

interface IUsersService {
  getById(userId: string): Promise<any>;
}

class UsersService implements IUsersService {
  /**
   * Retrieves a user by their ID, checking the Redis cache first before querying the database.
   *
   * @param {string} userId - The ID of the user to retrieve.
   * @return {Promise<any>} Promise resolving with the user object.
   */
  async getById(userId: string): Promise<any> {
    // Attempt to retrieve the user from Redis cache
    const userInMemory = await redis.client.get(`user:${userId}`);

    // If user is found in cache, parse and return it
    if (userInMemory) {
      const _user = JSON.parse(userInMemory);
      _user.createdAt = new Date(_user.createdAt);
      _user.updatedAt = new Date(_user.updatedAt);

      return _user;
    }

    // If user is not in cache, query the database
    const user = await User.findById(userId);
    if (!user) {
      // If user is not found in the database, throw a NotFound error
      throw new createHttpError.NotFound('User not found');
    }

    // Validate the retrieved user against the schema
    UserSchema.parse(user);

    // Cache the retrieved user in Redis
    await redis.client.set(`user:${user._id}`, JSON.stringify(user));

    // Return the user object
    return user;
  }
}

export default new UsersService();
