import crypto from 'crypto';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) return res.status(400).send({ error: 'Missing email' });
    if (!password) return res.status(400).send({ error: 'Missing password' });

    const emailExists = await dbClient.users.findOne({ email });
    if (emailExists) return res.status(400).send({ error: 'Already exist' });

    const sha1Password = crypto.createHash('sha1').update(password).digest('hex');
    const newUser = await dbClient.users.insertOne({
      email,
      password: sha1Password,
    });

    return res.status(201).send({
      id: newUser.insertedId,
      email,
    });
  }
}

export default UsersController;
