import express from 'express';
import {
  submitResponse,
  submitPublicResponse,
  getFormResponses,
  getResponseCount,
} from '../controllers/responseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes — require JWT
router.post('/responses', protect, submitResponse);
router.get('/responses/:formId', protect, authorize('admin', 'manager', 'staff'), getFormResponses);

// Public routes — no auth
router.post('/responses/public', submitPublicResponse);
router.get('/responses/:formId/count', getResponseCount);

export default router;
