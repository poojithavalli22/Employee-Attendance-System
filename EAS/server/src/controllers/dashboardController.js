const { Attendance, User } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

const getEmployeeDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = moment().startOf('day').toDate();
    const currentMonth = moment().startOf('month').toDate();
    const currentMonthEnd = moment().endOf('month').toDate();
    const todayAttendance = await Attendance.findOne({
      where: {
        userId,
        date: { [Op.gte]: today, [Op.lt]: moment(today).add(1, 'day').toDate() },
      },
    });
    const thisMonthAttendance = await Attendance.findAll({
      where: {
        userId,
        date: { [Op.between]: [currentMonth, currentMonthEnd] },
      },
    });
    const monthStats = { present: 0, absent: 0, late: 0, halfDay: 0, totalHours: 0 };
    thisMonthAttendance.forEach((record) => {
      if (record.status === 'present') monthStats.present++;
      else if (record.status === 'absent') monthStats.absent++;
      else if (record.status === 'late') monthStats.late++;
      else if (record.status === 'half-day') monthStats.halfDay++;
      if (record.totalHours) monthStats.totalHours += parseFloat(record.totalHours);
    });
    const last7Days = moment().subtract(7, 'days').startOf('day').toDate();
    const recentAttendance = await Attendance.findAll({
      where: {
        userId,
        date: { [Op.between]: [last7Days, today] },
      },
      order: [['date', 'DESC']],
    });
    const user = await User.findByPk(userId);
    res.status(200).json({
      user: { name: user.name, employeeId: user.employeeId, department: user.department },
      todayStatus: {
        hasCheckedIn: todayAttendance && todayAttendance.checkInTime ? true : false,
        hasCheckedOut: todayAttendance && todayAttendance.checkOutTime ? true : false,
        status: todayAttendance?.status || null,
        checkInTime: todayAttendance?.checkInTime || null,
        checkOutTime: todayAttendance?.checkOutTime || null,
      },
      monthStats,
      recentAttendance,
    });
  } catch (error) {
    console.error('Employee dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getManagerDashboard = async (req, res) => {
  try {
    const managerId = req.user.id;
    const today = moment().startOf('day').toDate();
    const weekStart = moment().subtract(6, 'days').startOf('day').toDate();
    const totalEmployees = await User.count({ where: { role: 'employee' } });
    const todayAttendance = await Attendance.findAll({
      where: { date: { [Op.gte]: today, [Op.lt]: moment(today).add(1, 'day').toDate() } },
      include: [{ model: User, attributes: ['id', 'name', 'email', 'employeeId', 'department'] }],
    });
    const presentToday = todayAttendance.filter((a) => a.status === 'present' || a.status === 'late');
    const absentToday = todayAttendance.filter((a) => a.status === 'absent');
    const lateToday = todayAttendance.filter((a) => a.status === 'late');
    const managerTodayAttendance = await Attendance.findOne({
      where: { userId: managerId, date: { [Op.gte]: today, [Op.lt]: moment(today).add(1, 'day').toDate() } },
    });
    const weekAttendance = await Attendance.findAll({
      where: { date: { [Op.between]: [weekStart, today] } },
    });
    const weeklyTrend = {};
    for (let i = 6; i >= 0; i--) {
      const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
      const dateStart = moment(date).startOf('day').toDate();
      const dateEnd = moment(date).endOf('day').toDate();
      const dayAttendance = weekAttendance.filter((a) => a.date >= dateStart && a.date <= dateEnd);
      weeklyTrend[date] = {
        present: dayAttendance.filter((a) => a.status === 'present' || a.status === 'late').length,
        absent: dayAttendance.filter((a) => a.status === 'absent').length,
        halfDay: dayAttendance.filter((a) => a.status === 'half-day').length,
      };
    }
    const employees = await User.findAll({ where: { role: 'employee' }, attributes: ['id', 'department'] });
    const deptMap = {};
    for (const emp of employees) {
      if (!deptMap[emp.department]) {
        deptMap[emp.department] = [];
      }
      deptMap[emp.department].push(emp.id);
    }
    const departmentWiseAttendance = {};
    for (const [dept, userIds] of Object.entries(deptMap)) {
      const deptAttendance = todayAttendance.filter((a) => userIds.includes(a.userId));
      departmentWiseAttendance[dept] = {
        present: deptAttendance.filter((a) => a.status === 'present' || a.status === 'late').length,
        absent: deptAttendance.filter((a) => a.status === 'absent').length,
        total: userIds.length,
      };
    }
    const manager = await User.findByPk(managerId);
    res.status(200).json({
      manager: { name: manager.name, employeeId: manager.employeeId, department: manager.department },
      managerTodayStatus: {
        hasCheckedIn: managerTodayAttendance && managerTodayAttendance.checkInTime ? true : false,
        hasCheckedOut: managerTodayAttendance && managerTodayAttendance.checkOutTime ? true : false,
        status: managerTodayAttendance?.status || null,
        checkInTime: managerTodayAttendance?.checkInTime || null,
        checkOutTime: managerTodayAttendance?.checkOutTime || null,
      },
      teamStats: { totalEmployees, presentToday: presentToday.length, absentToday: absentToday.length, lateArrivals: lateToday.length },
      todayDetails: {
        present: presentToday.map((a) => ({ id: a.User.id, name: a.User.name, employeeId: a.User.employeeId, checkInTime: a.checkInTime })),
        absent: absentToday.map((a) => ({ id: a.User.id, name: a.User.name, employeeId: a.User.employeeId })),
        late: lateToday.map((a) => ({ id: a.User.id, name: a.User.name, employeeId: a.User.employeeId, checkInTime: a.checkInTime })),
      },
      weeklyTrend,
      departmentWiseAttendance,
    });
  } catch (error) {
    console.error('Manager dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getEmployeeDashboard, getManagerDashboard };
