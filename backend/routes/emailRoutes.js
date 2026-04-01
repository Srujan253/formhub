import express from 'express';
import { sendInvites } from '../controllers/emailController.js';

const router = express.Router();

router.post('/invite', sendInvites);

export default router;
