import express from 'express';
import { 
  createScheduledWork,
  getScheduledWork,
  updateScheduledWork,
  deleteScheduledWork,
  generateAutomaticTimesheet,
  getTodayScheduledWork,
  bulkGenerateTimesheets
} from '../controllers/scheduledWorkController.js';
import { generateAutomaticTimesheets as autoGenerateAll } from '../utils/autoTimesheetGenerator.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes are protected by auth middleware
router.use(authMiddleware);

// Employee routes
router.post('/', createScheduledWork);
router.get('/', getScheduledWork);
router.get('/today', getTodayScheduledWork);
router.put('/:id', updateScheduledWork);
router.delete('/:id', deleteScheduledWork);
router.post('/generate-timesheet', generateAutomaticTimesheet);

// Admin routes (for bulk operations)
router.post('/bulk-generate', roleMiddleware(['admin']), bulkGenerateTimesheets);
router.post('/admin/auto-generate-all', roleMiddleware(['admin']), async (req, res) => {
  try {
    const results = await autoGenerateAll();
    res.json({
      success: true,
      message: 'Automatic timesheet generation completed',
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in automatic timesheet generation',
      error: error.message
    });
  }
});

// Admin route to get all scheduled work
router.get('/admin/all', roleMiddleware(['admin']), async (req, res) => {
  try {
    const scheduledWork = await ScheduledWork.find({})
      .populate('employee', 'name employeeId profilePic department position')
      .sort({ date: -1, startTime: 1 });

    res.json({
      success: true,
      data: scheduledWork
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching scheduled work',
      error: error.message
    });
  }
});

export default router; 