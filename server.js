import express from 'express';
import AppController from './controllers/AppController';
import { dbClient, redisClient } from './utils';

const app = express();
const port = process.env.PORT || 5000;

app.get('/status', (req, res) => {
  res.status(200).send({
    redis: redisClient.isAlive(),
    db: dbClient.isAlive(),
  });
});

app.get('/stats', async (req, res) => {
  res.status(200).send({
    users: await dbClient.nbUsers(),
    files: await dbClient.nbFiles(),
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
