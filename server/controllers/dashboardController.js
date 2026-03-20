const Employee = require('../models/Employee');
const Leave = require('../models/Leave');
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/admin
// @access  Private (Admin only)
exports.getAdminDashboard = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
    const totalLeaves = await Leave.countDocuments();
    const pendingTasks = await Task.countDocuments({ status: 'Pending' });

    // Employee by department
    const employeesDept = await Employee.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);
    const departmentData = employeesDept.map(d => ({ name: d._id, value: d.count }));

    // Leaves by status
    const leavesStats = await Leave.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const leaveData = leavesStats.map(l => ({ name: l._id, value: l.count }));

    // Attendance stats
    const attendanceStats = await Attendance.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const attendanceData = attendanceStats.map(a => ({ name: a._id, value: a.count }));

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        pendingLeaves,
        totalLeaves,
        pendingTasks,
        chartData: {
          departmentData,
          leaveData,
          attendanceData
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get employee dashboard stats
// @route   GET /api/dashboard/employee
// @access  Private
exports.getEmployeeDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Attendance summary
    const daysPresent = await Attendance.countDocuments({ userId, status: 'Present' });
    const daysAbsent = await Attendance.countDocuments({ userId, status: 'Absent' });

    // Validate today's presence
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingAttendance = await Attendance.findOne({ userId, date: today });
    const isAttendanceMarkedToday = !!existingAttendance;

    // Task summary
    const pendingTasks = await Task.countDocuments({ assignedTo: userId, status: 'Pending' });
    const completedTasks = await Task.countDocuments({ assignedTo: userId, status: 'Completed' });

    // Leave summary
    const approvedLeaves = await Leave.countDocuments({ userId, status: 'Approved' });
    const pendingLeaves = await Leave.countDocuments({ userId, status: 'Pending' });

    res.status(200).json({
      success: true,
      data: {
        attendance: { daysPresent, daysAbsent, isAttendanceMarkedToday },
        tasks: { pendingTasks, completedTasks },
        leaves: { approvedLeaves, pendingLeaves }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
