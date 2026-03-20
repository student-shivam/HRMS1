const express = require('express');
const {
  assignTask,
  getTasks,
  updateTaskStatus
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(authorize('admin'), assignTask)
  .get(getTasks);

// Let employees update their own task status
router.route('/:id/status')
  .put(updateTaskStatus);

module.exports = router;
