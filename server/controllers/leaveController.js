const Leave = require('../models/Leave');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private
exports.applyLeave = async (req, res) => {
  try {
    const { fromDate, toDate, reason } = req.body;
    
    const leave = await Leave.create({
      userId: req.user.id,
      fromDate,
      toDate,
      reason,
      status: 'Pending'
    });

    // Notify Admins
    const admins = await User.find({ role: 'admin' });
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');

    for (const admin of admins) {
      const notification = await Notification.create({
        recipient: admin._id,
        message: `${req.user.name} applied for leave.`,
        type: 'leave',
        link: '/admin/leaves'
      });

      const adminSocketId = userSockets.get(admin._id.toString());
      if (adminSocketId) {
        io.to(adminSocketId).emit('newNotification', notification);
      }
    }

    res.status(201).json({
      success: true,
      data: leave
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get my leave status
// @route   GET /api/leaves/my
// @access  Private
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ userId: req.user.id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all leaves (for Admin)
// @route   GET /api/leaves
// @access  Private (Admin only)
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate('userId', 'name email').sort('-createdAt');

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update leave status (Approve/Reject)
// @route   PUT /api/leaves/:id/status
// @access  Private (Admin only)
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
       return res.status(400).json({ success: false, message: 'Invalid status update' });
    }

    let leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    leave.status = status;
    await leave.save();

    // Notify the user
    const notification = await Notification.create({
      recipient: leave.userId,
      message: `Your leave request was ${status.toLowerCase()}.`,
      type: 'leave',
      link: '/leaves'
    });

    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    const userSocketId = userSockets.get(leave.userId.toString());
    
    if (userSocketId) {
      io.to(userSocketId).emit('newNotification', notification);
    }

    res.status(200).json({
      success: true,
      data: leave
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
