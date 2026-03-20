const express = require('express');
const {
  markAttendance,
  getAttendanceHistory
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(markAttendance)
  .get(getAttendanceHistory);

module.exports = router;
