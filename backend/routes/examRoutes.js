// filepath: backend/routes/examRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");
const {
  createExam,
  addQuestion,
  getAllExams,
  getAvailableExams,
  getExamById,
} = require("../controllers/examController");

// STUDENT ROUTES — /available MUST come before /:examId
router.get("/available", protect, getAvailableExams);

// ADMIN ROUTES
router.post("/", protect, adminOnly, createExam);
router.get("/", protect, adminOnly, getAllExams);
router.post("/:examId/questions", protect, adminOnly, addQuestion);

// THIS MUST BE LAST — dynamic param route
router.get("/:examId", protect, getExamById);

module.exports = router;