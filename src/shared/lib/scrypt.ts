import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const SALT_LENGTH_BYTES = 32;
const HASH_LENGTH_BYTES = 64;
const HASH_ITERATIONS = 1024;
const JOIN_CHARACTER = '.';

interface IPasswordService {
  hash(password: string): Promise<string>;
  compare(plainPassword: string, hashedPassword: string): Promise<boolean>;
}

class ScryptPasswordService implements IPasswordService {
  private async _hash(password: string, salt: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      scrypt(password, salt, HASH_LENGTH_BYTES, { N: HASH_ITERATIONS }, (err, hash) => {
        if (err) {
          reject(err);
        } else {
          resolve(hash);
        }
      });
    });
  }

  public async hash(password: string): Promise<string> {
    const salt = randomBytes(SALT_LENGTH_BYTES).toString('hex');
    const hash = await this._hash(password, salt).then(x => x.toString('hex'));
    return `${hash}${JOIN_CHARACTER}${salt}`;
  }

  public async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    const [originalHash, originalSalt] = hashedPassword.split(JOIN_CHARACTER);

    if (!originalHash || !originalSalt) {
      throw Error('Invalid format for hashed password');
    }

    const originalHashBuffer = Buffer.from(originalHash, 'hex');
    const generatedHashBuffer = await this._hash(plainPassword, originalSalt);

    return timingSafeEqual(originalHashBuffer, generatedHashBuffer);
  }
}

// Usage
export default new ScryptPasswordService();
