// filepath: backend/routes/resultRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  submitResult,
  getMyResults,
  getAllResults,
  getResultById
} = require('../controllers/resultController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly, studentOnly } = require('../middleware/roleMiddleware');

// Validation middleware
const validateSubmit = [
  body('examId').notEmpty().withMessage('Exam ID is required'),
  body('answers').isArray({ min: 1 }).withMessage('Answers array is required'),
  body('answers.*.questionId').notEmpty().withMessage('Question ID is required'),
  body('answers.*.selectedAnswer').isIn(['A', 'B', 'C', 'D']).withMessage('Answer must be A, B, C, or D')
];

// Student routes
router.post('/submit', protect, studentOnly, validateSubmit, submitResult);
router.get('/my', protect, studentOnly, getMyResults);

// Admin routes
router.get('/', protect, adminOnly, getAllResults);
router.get('/:resultId', protect, getResultById);

module.exports = router;