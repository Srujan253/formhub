import express from 'express';
import {
  createForm,
  getForm,
  getFormByToken,
  updateForm,
  getAllForms,
  deleteForm,
} from '../controllers/formController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route — must be before /:id to avoid conflicts
router.get('/forms/public/:token', getFormByToken);

// Protected routes — require JWT
router.post('/forms', protect, createForm);
router.get('/forms', protect, getAllForms);
router.get('/forms/:id', protect, getForm);
router.put('/forms/:id', protect, updateForm);
router.delete('/forms/:id', protect, deleteForm);

export default router;
