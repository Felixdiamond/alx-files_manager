import { MongoClient } from 'mongodb';

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || 'files_manager';

class DBClient {
  constructor() {
    this.client = new MongoClient(`mongodb://${host}:${port}`, {
      useUnifiedTopology: true,
    });
    this.client.connect();
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const db = this.client.db(database);
    const usersCollection = db.collection('users');
    const nbUsers = await usersCollection.countDocuments();
    return nbUsers;
  }

  async nbFiles() {
    const db = this.client.db(database);
    const filesCollection = db.collection('files');
    const nbFiles = await filesCollection.countDocuments();
    return nbFiles;
  }

  get users() {
    const db = this.client.db(database);
    return db.collection('users');
  }
}

const dbClient = new DBClient();
export default dbClient;

