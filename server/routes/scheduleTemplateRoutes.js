import express from 'express';
import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate
} from '../controllers/scheduleTemplateController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// GET all templates
router.get('/', authMiddleware, getAllTemplates);

// GET single template by ID
router.get('/:id', authMiddleware, getTemplateById);

// POST create new template (admin only)
router.post('/', authMiddleware, roleMiddleware(['admin']), createTemplate);

// PUT update template (admin only)
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateTemplate);

// DELETE template (admin only, soft delete)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteTemplate);

// POST duplicate template (admin only)
router.post('/:id/duplicate', authMiddleware, roleMiddleware(['admin']), duplicateTemplate);

export default router;

