import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getUsers, createStaffUser, verifyUser, updateUserRole, deleteUser } from '../controllers/adminController.js';

const router = express.Router();

router.get('/users', protect, authorize('admin', 'manager'), getUsers);
router.post('/staff', protect, authorize('admin', 'manager'), createStaffUser);
router.patch('/users/:id/verify', protect, authorize('admin'), verifyUser);
router.patch('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

export default router;