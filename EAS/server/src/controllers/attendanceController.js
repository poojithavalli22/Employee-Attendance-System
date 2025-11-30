const { Attendance, User } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

const checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = moment().startOf('day').toDate();
    const existingAttendance = await Attendance.findOne({
      where: {
        userId,
        date: {
          [Op.gte]: today,
          [Op.lt]: moment(today).add(1, 'day').toDate(),
        },
      },
    });
    if (existingAttendance && existingAttendance.checkInTime) {
      return res.status(400).json({ message: 'Already checked in today' });
    }
    const checkInTime = moment().format('HH:mm:ss');
    const t = moment(checkInTime, 'HH:mm:ss');
    const nine = moment('09:00:00', 'HH:mm:ss');
    const one = moment('13:00:00', 'HH:mm:ss');
    const status = t.isBefore(nine) ? 'present' : t.isBefore(one) ? 'late' : 'half-day';
    const attendance = await Attendance.create({
      userId,
      date: today,
      checkInTime,
      status,
    });
    res.status(200).json({
      message: 'Checked in successfully',
      attendance: {
        id: attendance.id,
        checkInTime: attendance.checkInTime,
        status: attendance.status,
      },
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = moment().startOf('day').toDate();
    const attendance = await Attendance.findOne({
      where: {
        userId,
        date: {
          [Op.gte]: today,
          [Op.lt]: moment(today).add(1, 'day').toDate(),
        },
      },
    });
    if (!attendance) {
      return res.status(404).json({ message: 'No check-in found for today' });
    }
    if (attendance.checkOutTime) {
      return res.status(400).json({ message: 'Already checked out today' });
    }
    const checkOutTime = moment().format('HH:mm:ss');
    const checkInMoment = moment(attendance.checkInTime, 'HH:mm:ss');
    const checkOutMoment = moment(checkOutTime, 'HH:mm:ss');
    let totalHours = checkOutMoment.diff(checkInMoment, 'hours', true);
    if (totalHours < 0) {
      totalHours = 0;
    }
    attendance.checkOutTime = checkOutTime;
    attendance.totalHours = totalHours.toFixed(2);
    await attendance.save();
    res.status(200).json({
      message: 'Checked out successfully',
      attendance: {
        id: attendance.id,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        totalHours: attendance.totalHours,
      },
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getMyHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;
    let whereClause = { userId };
    if (month && year) {
      const startDate = moment(`${year}-${month}`, 'YYYY-MM').startOf('month').toDate();
      const endDate = moment(`${year}-${month}`, 'YYYY-MM').endOf('month').toDate();
      whereClause.date = {
        [Op.between]: [startDate, endDate],
      };
    }
    const attendance = await Attendance.findAll({
      where: whereClause,
      order: [['date', 'DESC']],
    });
    res.status(200).json({
      attendance,
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getMySummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;
    const currentDate = moment();
    const targetMonth = month ? parseInt(month) : currentDate.month() + 1;
    const targetYear = year ? parseInt(year) : currentDate.year();
    const startDate = moment(`${targetYear}-${targetMonth}`, 'YYYY-MM').startOf('month').toDate();
    const endDate = moment(`${targetYear}-${targetMonth}`, 'YYYY-MM').endOf('month').toDate();
    const attendance = await Attendance.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
    });
    const summary = {
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      totalHours: 0,
    };
    attendance.forEach((record) => {
      if (record.status === 'present') summary.present++;
      else if (record.status === 'absent') summary.absent++;
      else if (record.status === 'late') summary.late++;
      else if (record.status === 'half-day') summary.halfDay++;
      if (record.totalHours) summary.totalHours += parseFloat(record.totalHours);
    });
    res.status(200).json({
      month: targetMonth,
      year: targetYear,
      summary,
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getTodayStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = moment().startOf('day').toDate();
    const attendance = await Attendance.findOne({
      where: {
        userId,
        date: {
          [Op.gte]: today,
          [Op.lt]: moment(today).add(1, 'day').toDate(),
        },
      },
    });
    res.status(200).json({
      today: {
        hasCheckedIn: attendance && attendance.checkInTime ? true : false,
        hasCheckedOut: attendance && attendance.checkOutTime ? true : false,
        checkInTime: attendance?.checkInTime || null,
        checkOutTime: attendance?.checkOutTime || null,
        status: attendance?.status || null,
      },
    });
  } catch (error) {
    console.error('Get today status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyHistory,
  getMySummary,
  getTodayStatus,
};
