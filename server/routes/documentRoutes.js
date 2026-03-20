const express = require('express');
const { generateOfferLetter, downloadDocument } = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/generate-offer', authorize('admin'), generateOfferLetter);
router.get('/download/:employeeId/:documentId', downloadDocument);

module.exports = router;
