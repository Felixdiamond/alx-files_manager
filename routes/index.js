import express from 'express';
import AppController from '../controllers/AppController';
import AuthController from '../controllers/AuthController';
import { postUpload } from '../controllers/FilesController';
import UsersController from '../controllers/UsersController';

const router = express.Router();

router.get('/status', (req, res) => AppController.getStatus(req, res));
router.get('/stats', (req, res) => AppController.getStats(req, res));
router.post('/users', (req, res) => UsersController.postNew(req, res));
router.get('/connect', (req, res) => AuthController.getConnect(req, res));
router.get('/disconnect', (req, res) => AuthController.getDisconnect(req, res));
router.get('/users/me', (req, res) => UsersController.getMe(req, res));
router.post('/files', (req, res) => postUpload(req, res));

export default router;
