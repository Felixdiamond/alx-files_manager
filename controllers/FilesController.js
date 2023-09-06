import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';

const postUpload = async (req, res) => {
  try {
    // Retrieve the user based on the token
    const userCollection = dbClient.getUserCollection();
    const user = await userCollection.findOne({ token: req.headers['x-token'] });
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate the request body
    const {
      name, type, parentId, isPublic, data,
    } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }
    if (parentId) {
      const parentFile = await dbClient.File.findById(parentId);
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    // Create a new file
    const file = new dbClient.File({
      userId: user._id,
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId || 0,
    });

    // Store the file locally if it's not a folder
    if (type !== 'folder') {
      const folderPath = process.env.FOLDER_PATH || path.join(__dirname, '..', '/tmp/files_manager');
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }
      const localPath = path.join(folderPath, uuidv4());
      fs.writeFileSync(localPath, Buffer.from(data, 'base64'));
      file.localPath = localPath;
    }

    // Save the file in the database and return it
    await file.save();
    res.status(201).json(file);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export { postUpload };
