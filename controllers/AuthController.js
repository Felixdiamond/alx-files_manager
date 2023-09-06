import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send({ error: 'Unauthorized' });

    const buff = Buffer.from(authHeader.split(' ')[1], 'base64');
    const [email, password] = buff.toString('utf-8').split(':');

    if (!email || !password) return res.status(401).send({ error: 'Unauthorized' });

    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
    const user = await dbClient.users.findOne({ email, password: hashedPassword });
    if (!user) return res.status(401).send({ error: 'Unauthorized' });

    const token = uuidv4();
    await redisClient.set(`auth_${token}`, user._id.toString(), 60 * 60 * 24);

    return res.status(200).send({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).send({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).send({ error: 'Unauthorized' });

    await redisClient.del(`auth_${token}`);

    return res.status(204).send();
  }
}

export default AuthController;
