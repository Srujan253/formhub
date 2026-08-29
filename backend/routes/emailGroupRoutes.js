import express from 'express';
import { getGroups, createGroup, updateGroup, deleteGroup } from '../controllers/emailGroupController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/email-groups', protect, getGroups);
router.post('/email-groups', protect, createGroup);
router.put('/email-groups/:id', protect, updateGroup);
router.delete('/email-groups/:id', protect, deleteGroup);

export default router;
