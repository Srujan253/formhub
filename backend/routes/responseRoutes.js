import express from 'express';
import {
  submitResponse,
  submitPublicResponse,
  getFormResponses,
  getResponseCount,
} from '../controllers/responseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes — require JWT
router.post('/responses', protect, submitResponse);
router.get('/responses/:formId', protect, getFormResponses);

// Public routes — no auth
router.post('/responses/public', submitPublicResponse);
router.get('/responses/:formId/count', getResponseCount);

export default router;
