const Attendance = require('../models/Attendance');

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private
exports.markAttendance = async (req, res) => {
  try {
    const { status } = req.body;

    // Get today's date and set time to beginning of the day (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if attendance already marked for today
    const existingAttendance = await Attendance.findOne({
      userId: req.user.id,
      date: today
    });

    if (existingAttendance) {
      return res.status(400).json({ 
        success: false, 
        message: 'Attendance already marked for today' 
      });
    }

    const attendance = await Attendance.create({
      userId: req.user.id,
      date: today,
      status: status || 'Present'
    });

    res.status(201).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Attendance already marked for today' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance history
// @route   GET /api/attendance
// @access  Private
exports.getAttendanceHistory = async (req, res) => {
  try {
    let query;

    // Allow admins to view everyone's or a specific user's history
    if (req.user.role === 'admin') {
      if (req.query.userId) {
         query = { userId: req.query.userId };
      } else {
         query = {};
      }
    } else {
      // Normal employees can only view their own history
      query = { userId: req.user.id };
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email')
      .sort('-date');

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
