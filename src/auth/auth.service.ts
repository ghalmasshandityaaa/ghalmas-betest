import createHttpError from 'http-errors';
import { v4 as uuidv4 } from 'uuid';

import env from '~/env';
import redis from '~/shared/db/redis';
import { computeResult } from '~/shared/lib/result';
import { compare } from '~/shared/lib/scrypt';
import { User } from '~/users/users.model';

import type { SignInSchema, SignUpSchema } from './auth.schema';
import { JwtUtils } from './utils/jwt';

class AuthService {
  async signIn(params: SignInSchema) {
    const { emailAddress, password } = params;
    const user = await User.findOne({ emailAddress });

    if (!user) {
      throw new createHttpError.NotFound('User not found');
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      throw new createHttpError.Unauthorized('Invalid password');
    }

    const sessionId = uuidv4();
    const accessToken = JwtUtils.signToken('access', {
      userId: user.id,
      sessionId,
    });
    const refreshToken = JwtUtils.signToken('refresh', {
      userId: user.id,
      sessionId,
    });

    await Promise.all([
      redis.client.set(`${user.id}:${sessionId}`, refreshToken, {
        EX: env.REFRESH_TOKEN_TTL,
      }),
      redis.client.set(`user:${user.id}`, JSON.stringify(user)),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async signUp(params: SignUpSchema) {
    const { emailAddress, userName } = params;
    const [emailExist, usernameExist] = await Promise.all([
      User.findOne({ emailAddress }),
      User.findOne({ userName }),
    ]);

    if (emailExist || usernameExist) {
      throw new createHttpError.BadRequest('User already exists');
    }

    await User.create({ ...params });
  }

  async refresh(refreshToken?: string) {
    if (!refreshToken) throw new createHttpError.BadRequest('Missing refresh token');

    const decoded = computeResult(() => JwtUtils.verifyToken('refresh', refreshToken));

    if (!decoded.ok) {
      throw new createHttpError.Unauthorized('Invalid refresh token');
    }

    const userId = decoded.value.sub;
    const sessionId = decoded.value.jti;

    const issuedRefreshToken = await redis.client.get(`${userId}:${sessionId}`);
    if (issuedRefreshToken !== refreshToken) {
      await redis.client.del(`${userId}:${sessionId}`);
      throw new createHttpError.Unauthorized('Invalid refresh token');
    }

    const newAccessToken = JwtUtils.signToken('access', { userId, sessionId });
    const newRefreshToken = JwtUtils.signToken('refresh', {
      userId,
      sessionId,
    });

    await redis.client.set(`${userId}:${sessionId}`, newRefreshToken, {
      EX: env.REFRESH_TOKEN_TTL,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async signOut(refreshToken?: string) {
    if (!refreshToken) throw new createHttpError.BadRequest('Missing refresh token');

    const decoded = computeResult(() => JwtUtils.verifyToken('refresh', refreshToken));

    if (!decoded.ok) throw new createHttpError.Unauthorized('Invalid refresh token');

    const userId = decoded.value.sub;
    const sessionId = decoded.value.jti;

    await redis.client.del(`${userId}:${sessionId}`);
  }
}

export default new AuthService();
