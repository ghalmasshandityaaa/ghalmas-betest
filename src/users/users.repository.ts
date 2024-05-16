import { User } from './users.model';
import { UserSchema } from './users.schema';

interface IUsersRepository {
  getById(userId: string): Promise<any>;
  getByAccountNumber(accountNumber: string): Promise<any>;
  getByIdentityNumber(identityNumber: string): Promise<any>;
}

class UsersRepository implements IUsersRepository {
  /**
   * Retrieves a user by their ID from the database and parses the user schema.
   *
   * @param {string} userId - The ID of the user to retrieve.
   * @return {Promise<any>} Promise resolving with the user object.
   */
  async getById(userId: string): Promise<any> {
    const user = await User.findById(userId);
    if (!user) return null;

    UserSchema.parse(user);

    return user;
  }

  /**
   * Retrieves a user by their account number from the database and parses the user schema.
   *
   * @param {string} accountNumber - The account number of the user to retrieve.
   * @return {Promise<any>} Promise resolving with the user object.
   */
  async getByAccountNumber(accountNumber: string): Promise<any> {
    const user = await User.findOne({ accountNumber });
    if (!user) return null;

    UserSchema.parse(user);

    return user;
  }

  /**
   * Retrieves a user by their identity number from the database and parses the user schema.
   *
   * @param {string} identityNumber - The identity number of the user to retrieve.
   * @return {Promise<any>} Promise resolving with the user object.
   */
  async getByIdentityNumber(identityNumber: string): Promise<any> {
    const user = await User.findOne({ identityNumber });
    if (!user) return null;

    UserSchema.parse(user);

    return user;
  }
}

export default new UsersRepository();
