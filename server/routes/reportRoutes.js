const express = require('express');
const { getAnalytics, downloadCSV, downloadPDF } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // Only admins can see corporate reports

router.get('/analytics', getAnalytics);
router.get('/download/csv', downloadCSV);
router.get('/download/pdf', downloadPDF);

module.exports = router;
