const Task = require('../models/Task');
const Notification = require('../models/Notification');

// @desc    Assign a new task
// @route   POST /api/tasks
// @access  Private (Admin only)
exports.assignTask = async (req, res) => {
  try {
    const { title, description, assignedTo } = req.body;

    const task = await Task.create({
      title,
      description,
      assignedTo,
      status: 'Pending'
    });

    // Notify the assigned user
    const notification = await Notification.create({
      recipient: assignedTo,
      message: `You have been assigned a new task: ${title}`,
      type: 'task',
      link: '/tasks'
    });

    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    const userSocketId = userSockets.get(assignedTo.toString());
    
    if (userSocketId) {
      io.to(userSocketId).emit('newNotification', notification);
    }

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    let query;

    // Admin can see all tasks, employees see only their own
    if (req.user.role === 'admin') {
      if (req.query.assignedTo) {
         query = { assignedTo: req.query.assignedTo };
      } else {
         query = {};
      }
    } else {
      query = { assignedTo: req.user.id };
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
       return res.status(400).json({ success: false, message: 'Invalid status update' });
    }

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Allow admin to update any task, or the assigned user to update their own task
    if (task.assignedTo.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
    }

    task.status = status;
    await task.save();

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
