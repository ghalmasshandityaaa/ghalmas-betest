import { connectToMongoDB } from '../utils/db';

// Define an interface for the MongoDB client
interface IMongoDBClient {
  connect(): Promise<void>;
  get client(): Awaited<ReturnType<typeof connectToMongoDB>>;
}

// Implement the interface in the MongoDBClient class
class MongoDBClient implements IMongoDBClient {
  private _client: Awaited<ReturnType<typeof connectToMongoDB>> | null = null;

  async connect(): Promise<void> {
    if (this._client) {
      throw new Error('MongoDB already initialized');
    }

    this._client = await connectToMongoDB();
  }

  get client() {
    if (!this._client) {
      throw new Error('MongoDB not initialized');
    }

    return this._client;
  }
}

export default new MongoDBClient();
export { type IMongoDBClient, MongoDBClient };
