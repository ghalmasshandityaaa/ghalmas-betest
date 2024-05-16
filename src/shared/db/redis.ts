import { connectToRedis } from '../utils/db';

interface IRedisClient {
  set(key: string, value: string, options?: { EX: number }): Promise<void>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<void>;
}

class RedisClient implements IRedisClient {
  private _client: Awaited<ReturnType<typeof connectToRedis>> | null = null;

  async connect(): Promise<void> {
    if (this._client) {
      throw new Error('Redis already initialized');
    }
    this._client = await connectToRedis();
  }

  get client() {
    if (!this._client) {
      throw new Error('Redis not initialized');
    }
    return this._client;
  }

  async set(key: string, value: string, options?: { EX: number }): Promise<void> {
    this.client.set(key, value, options);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    this.client.del(key);
  }
}

export default new RedisClient();
export { type IRedisClient, RedisClient };
