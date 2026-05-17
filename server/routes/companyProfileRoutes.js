const express = require('express');
const { getCompanyProfile, updateCompanyProfile } = require('../controllers/companyProfileController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getCompanyProfile);
router.put('/', authorize('admin'), updateCompanyProfile);

module.exports = router;
