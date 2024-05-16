import { connectToRedis } from '../utils/db';

// Import the Redis client type

interface IRedisClient {
  connect(): Promise<void>;
  get client(): any;

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

  get client(): any {
    if (!this._client) {
      throw new Error('Redis not initialized');
    }
    return this._client;
  }

  async set(key: string, value: string, options?: { EX: number }): Promise<void> {
    await this.client.set(key, value, options); // Ensure 'await' for async method
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key); // Ensure 'await' for async method
  }

  async del(key: string): Promise<void> {
    await this.client.del(key); // Ensure 'await' for async method
  }
}

export default new RedisClient();
export { type IRedisClient, RedisClient };
