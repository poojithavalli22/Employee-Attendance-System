const express = require('express');
const { getEmployeeDashboard, getManagerDashboard } = require('../controllers/dashboardController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const router = express.Router();
router.use(authMiddleware);
router.get('/employee', requireRole('employee', 'manager'), getEmployeeDashboard);
router.get('/manager', requireRole('manager'), getManagerDashboard);
module.exports = router;
