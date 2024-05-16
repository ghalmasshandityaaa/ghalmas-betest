import jwt from 'jsonwebtoken';

import env from '~/env';

import type { UserSession } from '../auth.schema';

const ISSUER = env.JWT_ISSUER ?? 'backend-app';
type TokenType = 'access' | 'refresh';

export class JwtUtils {
  private static getSecret(type: TokenType) {
    return type === 'access' ? env.ACCESS_TOKEN_SECRET : env.REFRESH_TOKEN_SECRET;
  }

  private static getTtl(type: TokenType) {
    return type === 'access' ? env.ACCESS_TOKEN_TTL : env.REFRESH_TOKEN_TTL;
  }

  static signToken(type: TokenType, { userId, sessionId }: UserSession) {
    return jwt.sign({}, this.getSecret(type), {
      subject: userId,
      jwtid: sessionId,
      issuer: ISSUER,
      expiresIn: String(this.getTtl(type)),
    });
  }

  static verifyToken(type: TokenType, token: string) {
    const decoded = jwt.verify(token, this.getSecret(type), {
      issuer: ISSUER,
    });

    if (!decoded || typeof decoded !== 'object') {
      throw new Error(`Invalid ${type} token`);
    }

    return decoded as { sub: string; jti: string };
  }
}
