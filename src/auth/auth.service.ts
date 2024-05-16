import createHttpError from 'http-errors';
import { v4 as uuidv4 } from 'uuid';

import env from '~/env';
import redis from '~/shared/db/redis';
import { computeResult } from '~/shared/lib/result';
import scrypt from '~/shared/lib/scrypt';
import { User } from '~/users/users.model';

import type { SignInSchema, SignUpSchema } from './auth.schema';
import { JwtUtils } from './utils/jwt';

interface IAuthService {
  signIn(params: SignInSchema): Promise<{ accessToken: string; refreshToken: string }>;
  signUp(params: SignUpSchema): Promise<void>;
  refresh(refreshToken: string): Promise<{ accessToken: string }>;
  signOut(refreshToken: string): Promise<void>;
}

class AuthService implements IAuthService {
  /**
   * Sign in a user by validating credentials and issuing JWT tokens.
   *
   * @param {SignInSchema} params - Object containing emailAddress and password for user sign-in.
   * @return {Promise<{accessToken: string, refreshToken: string}>} Object with access token and refresh token.
   */
  async signIn(params: SignInSchema): Promise<{ accessToken: string; refreshToken: string }> {
    const { emailAddress, password } = params;

    // Find the user by email address
    const user = await User.findOne({ emailAddress });

    // If user not found, throw a not found error
    if (!user) {
      throw new createHttpError.NotFound('User not found');
    }

    // Validate the provided password against the stored hash
    const isPasswordValid = await scrypt.compare(password, user.password);

    // If password is invalid, throw an unauthorized error
    if (!isPasswordValid) {
      throw new createHttpError.Unauthorized('Invalid password');
    }

    // Generate a unique session ID
    const sessionId = uuidv4();

    // Generate JWT access and refresh tokens
    const accessToken = JwtUtils.signToken('access', {
      userId: user.id,
      sessionId,
    });
    const refreshToken = JwtUtils.signToken('refresh', {
      userId: user.id,
      sessionId,
    });

    // Store the refresh token and user information in Redis
    await Promise.all([
      redis.client.set(`${user.id}:${sessionId}`, refreshToken, {
        EX: env.REFRESH_TOKEN_TTL,
      }),
      redis.client.set(`user:${user.id}`, JSON.stringify(user)),
    ]);

    // Return the generated tokens
    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Sign up a new user and store their details in the database.
   *
   * @param {SignUpSchema} params - Object containing emailAddress and userName for user sign-up.
   * @return {Promise<void>} Promise indicating the success of the sign-up operation.
   */
  async signUp(params: SignUpSchema): Promise<void> {
    const { emailAddress, userName } = params;

    // Check if the email or username already exists
    const [emailExist, usernameExist] = await Promise.all([
      User.findOne({ emailAddress }),
      User.findOne({ userName }),
    ]);

    // If either email or username already exists, throw a bad request error
    if (emailExist || usernameExist) {
      throw new createHttpError.BadRequest('User already exists');
    }

    // Create a new user with the provided details
    await User.create({ ...params });
  }

  /**
   * Refresh the JWT tokens using the provided refresh token.
   *
   * @param {string} refreshToken - Refresh token string.
   * @return {Promise<{ accessToken: string, refreshToken: string }>} Promise returning new access and refresh tokens.
   */
  async refresh(refreshToken?: string): Promise<{ accessToken: string; refreshToken: string }> {
    // If no refresh token is provided, throw a bad request error
    if (!refreshToken) throw new createHttpError.BadRequest('Missing refresh token');

    // Verify the provided refresh token
    const decoded = computeResult(() => JwtUtils.verifyToken('refresh', refreshToken));

    // If token verification fails, throw an unauthorized error
    if (!decoded.ok) {
      throw new createHttpError.Unauthorized('Invalid refresh token');
    }

    const userId = decoded.value.sub;
    const sessionId = decoded.value.jti;

    // Retrieve the stored refresh token from Redis
    const issuedRefreshToken = await redis.client.get(`${userId}:${sessionId}`);
    if (issuedRefreshToken !== refreshToken) {
      // If tokens do not match, delete the session and throw an unauthorized error
      await redis.client.del(`${userId}:${sessionId}`);
      throw new createHttpError.Unauthorized('Invalid refresh token');
    }

    // Generate new JWT access and refresh tokens
    const newAccessToken = JwtUtils.signToken('access', { userId, sessionId });
    const newRefreshToken = JwtUtils.signToken('refresh', {
      userId,
      sessionId,
    });

    // Store the new refresh token in Redis
    await redis.client.set(`${userId}:${sessionId}`, newRefreshToken, {
      EX: env.REFRESH_TOKEN_TTL,
    });

    // Return the new tokens
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Sign out a user by deleting the session from Redis based on the provided refresh token.
   *
   * @param {string} refreshToken - Refresh token to identify the session.
   * @return {Promise<void>} Promise indicating the success of the sign-out operation.
   */
  async signOut(refreshToken?: string): Promise<void> {
    // If no refresh token is provided, throw a bad request error
    if (!refreshToken) throw new createHttpError.BadRequest('Missing refresh token');

    // Verify the provided refresh token
    const decoded = computeResult(() => JwtUtils.verifyToken('refresh', refreshToken));

    // If token verification fails, throw an unauthorized error
    if (!decoded.ok) throw new createHttpError.Unauthorized('Invalid refresh token');

    const userId = decoded.value.sub;
    const sessionId = decoded.value.jti;

    // Delete the session from Redis
    await redis.client.del(`${userId}:${sessionId}`);
  }
}

export default new AuthService();
