/* eslint-disable no-param-reassign */
import dbClient from '../utils/db';

export default class FilesController {
  static async postUpload(req, res) {
    const userId = req.user.id;
    const {
      name, type, parentId, isPublic, data,
    } = req.body;

    if (!name || !type || (!['folder', 'file', 'image'].includes(type)) || (!data && type !== 'folder')) {
      return res.status(400).json({ error: !name ? 'Missing name' : (!type || (!['folder', 'file', 'image'].includes(type))) ? 'Missing type' : 'Missing data' });
    }

    try {
      let flag = false;

      if (parentId) {
        const folder = await dbClient.filterFiles({ _id: parentId });

        if (!folder) {
          return res.status(400).json({ error: 'Parent not found' }).end();
        } else if (folder.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' }).end();
        }
      }

      if (!flag) {
        const insRes = await dbClient.newFile(userId, name, type, isPublic, parentId, data);
        const docs = insRes.ops[0];
        delete docs.localPath;
        docs.id = docs._id;
        delete docs._id;
        return res.status(201).json(docs).end();
      }
    } catch (err) {
      return res.status(400).json({ error: err.message }).end();
    }
  }
}
