const Employee = require('../models/Employee');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Add new employee
// @route   POST /api/employees
// @access  Private
exports.addEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);

    res.status(201).json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
exports.getEmployees = async (req, res) => {
  try {
    const { keyword, department, page = 1, limit = 10 } = req.query;

    let query = {};

    // Search
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Filter
    if (department) {
      query.department = department;
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    
    const total = await Employee.countDocuments(query);
    const employees = await Employee.find(query).skip(startIndex).limit(limitNum);

    res.status(200).json({
      success: true,
      count: employees.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      },
      data: employees
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private
exports.updateEmployee = async (req, res) => {
  try {
    let employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: `No employee found with the id of ${req.params.id}` });
    }

    employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: `No employee found with the id of ${req.params.id}` });
    }

    await employee.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Upload document for employee
// @route   POST /api/employees/:id/documents
// @access  Private (Admin)
exports.uploadDocument = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a valid document format (PDF/JPG/PNG)' });
    }

    const { name } = req.body;
    
    const newDoc = {
      name: name || 'Document',
      url: `/uploads/documents/${req.file.filename}`,
      type: req.file.mimetype
    };

    employee.documents.push(newDoc);
    await employee.save();

    // Create Notification for the specific User matching the Employee's email
    const userLinking = await User.findOne({ email: employee.email });
    if (userLinking) {
      const notification = await Notification.create({
        recipient: userLinking._id,
        message: `A new document (${newDoc.name}) was uploaded to your profile by HR.`,
        type: 'document',
        link: '/employee/documents'
      });
      
      const io = req.app.get('io');
      const userSockets = req.app.get('userSockets');
      const userSocketId = userSockets.get(userLinking._id.toString());
      if (userSocketId) {
        io.to(userSocketId).emit('newNotification', notification);
      }
    }

    res.status(200).json({
      success: true,
      data: employee.documents
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in employee's documents
// @route   GET /api/employees/my/documents
// @access  Private
exports.getMyDocuments = async (req, res) => {
  try {
    // Find employee record by email from logged in user
    const employee = await Employee.findOne({ email: req.user.email });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee record not found for this account' });
    }

    res.status(200).json({
      success: true,
      data: employee.documents
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in employee's profile/salary details
// @route   GET /api/employees/my/profile
// @access  Private
exports.getMyProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ email: req.user.email });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee record not found for this account' });
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
