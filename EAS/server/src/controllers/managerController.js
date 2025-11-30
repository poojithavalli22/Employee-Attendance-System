const { Attendance, User } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const fs = require('fs');

const getAllEmployeesAttendance = async (req, res) => {
  try {
    const { startDate, endDate, status, employeeId } = req.query;
    let whereClause = {};
    if (startDate && endDate) {
      const start = moment(startDate).startOf('day').toDate();
      const end = moment(endDate).endOf('day').toDate();
      whereClause.date = { [Op.between]: [start, end] };
    }
    if (status) {
      whereClause.status = status;
    }
    if (employeeId) {
      const user = await User.findOne({ where: { employeeId } });
      if (user) {
        whereClause.userId = user.id;
      }
    }
    const attendance = await Attendance.findAll({
      where: whereClause,
      include: [{ model: User, attributes: ['id', 'name', 'email', 'employeeId', 'department'] }],
      order: [['date', 'DESC']],
    });
    res.status(200).json({ attendance });
  } catch (error) {
    console.error('Get all employees attendance error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getEmployeeAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    let whereClause = { userId: id };
    if (startDate && endDate) {
      const start = moment(startDate).startOf('day').toDate();
      const end = moment(endDate).endOf('day').toDate();
      whereClause.date = { [Op.between]: [start, end] };
    }
    const attendance = await Attendance.findAll({
      where: whereClause,
      order: [['date', 'DESC']],
    });
    res.status(200).json({
      employee: {
        id: user.id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        department: user.department,
      },
      attendance,
    });
  } catch (error) {
    console.error('Get employee attendance error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getTeamSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = moment();
    const targetMonth = month ? parseInt(month) : currentDate.month() + 1;
    const targetYear = year ? parseInt(year) : currentDate.year();
    const startDate = moment(`${targetYear}-${targetMonth}`, 'YYYY-MM').startOf('month').toDate();
    const endDate = moment(`${targetYear}-${targetMonth}`, 'YYYY-MM').endOf('month').toDate();
    const employees = await User.findAll({
      where: { role: 'employee' },
      attributes: ['id', 'name', 'employeeId', 'department'],
    });
    const summary = [];
    for (const employee of employees) {
      const attendance = await Attendance.findAll({
        where: {
          userId: employee.id,
          date: { [Op.between]: [startDate, endDate] },
        },
      });
      const stats = { present: 0, absent: 0, late: 0, halfDay: 0, totalHours: 0 };
      attendance.forEach((record) => {
        if (record.status === 'present') stats.present++;
        else if (record.status === 'absent') stats.absent++;
        else if (record.status === 'late') stats.late++;
        else if (record.status === 'half-day') stats.halfDay++;
        if (record.totalHours) stats.totalHours += parseFloat(record.totalHours);
      });
      summary.push({
        employee: {
          id: employee.id,
          name: employee.name,
          employeeId: employee.employeeId,
          department: employee.department,
        },
        stats,
      });
    }
    res.status(200).json({ month: targetMonth, year: targetYear, summary });
  } catch (error) {
    console.error('Get team summary error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getTodayStatus = async (req, res) => {
  try {
    const today = moment().startOf('day').toDate();
    const attendance = await Attendance.findAll({
      where: {
        date: { [Op.gte]: today, [Op.lt]: moment(today).add(1, 'day').toDate() },
      },
      include: [{ model: User, attributes: ['id', 'name', 'email', 'employeeId', 'department'] }],
    });
    const present = attendance.filter((a) => a.status === 'present' || a.status === 'late');
    const absent = attendance.filter((a) => a.status === 'absent');
    const late = attendance.filter((a) => a.status === 'late');
    res.status(200).json({
      today: {
        totalPresent: present.length,
        totalAbsent: absent.length,
        lateArrivals: late.length,
        presentDetails: present,
        absentDetails: absent,
        lateDetails: late,
      },
    });
  } catch (error) {
    console.error('Get today status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const exportAttendanceCSV = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    let whereClause = {};
    if (startDate && endDate) {
      const start = moment(startDate).startOf('day').toDate();
      const end = moment(endDate).endOf('day').toDate();
      whereClause.date = { [Op.between]: [start, end] };
    }
    if (employeeId) {
      const user = await User.findOne({ where: { employeeId } });
      if (user) {
        whereClause.userId = user.id;
      }
    }
    const attendance = await Attendance.findAll({
      where: whereClause,
      include: [{ model: User, attributes: ['name', 'email', 'employeeId', 'department'] }],
      order: [['date', 'DESC']],
    });
    const csvData = attendance.map((a) => ({
      EmployeeID: a.User.employeeId,
      Name: a.User.name,
      Email: a.User.email,
      Department: a.User.department || 'N/A',
      Date: moment(a.date).format('YYYY-MM-DD'),
      CheckInTime: a.checkInTime || 'N/A',
      CheckOutTime: a.checkOutTime || 'N/A',
      Status: a.status,
      TotalHours: a.totalHours || 'N/A',
    }));
    const fileName = `attendance_${moment().format('YYYY-MM-DD_HH-mm-ss')}.csv`;
    const filePath = path.join(__dirname, '../../uploads', fileName);
    if (!fs.existsSync(path.join(__dirname, '../../uploads'))) {
      fs.mkdirSync(path.join(__dirname, '../../uploads'), { recursive: true });
    }
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'EmployeeID', title: 'Employee ID' },
        { id: 'Name', title: 'Name' },
        { id: 'Email', title: 'Email' },
        { id: 'Department', title: 'Department' },
        { id: 'Date', title: 'Date' },
        { id: 'CheckInTime', title: 'Check In Time' },
        { id: 'CheckOutTime', title: 'Check Out Time' },
        { id: 'Status', title: 'Status' },
        { id: 'TotalHours', title: 'Total Hours' },
      ],
    });
    await csvWriter.writeRecords(csvData);
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      fs.unlink(filePath, (err) => {
        if (err) console.error('File deletion error:', err);
      });
    });
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllEmployeesAttendance,
  getEmployeeAttendance,
  getTeamSummary,
  getTodayStatus,
  exportAttendanceCSV,
};
