// filepath: backend/controllers/resultController.js
const Result = require('../models/Result');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const { validationResult } = require('express-validator');

// @desc    Submit exam answers (Student only)
// @route   POST /api/results/submit
// @access  Private (Student)
exports.submitResult = async (req, res) => {
  try {
    // Support both _id and id
    const studentId = req.user._id || req.user.id;

    console.log("Submit called by student:", studentId);
    console.log("Request body:", req.body);

    const { examId, answers } = req.body;

    if (!examId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        message: "examId and answers array are required",
      });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Get all questions WITH correct answers (server side only)
    const questions = await Question.find({ examId });

    if (questions.length === 0) {
      return res.status(400).json({
        message: "This exam has no questions yet",
      });
    }

    // Score calculation
    let score = 0;
    const processedAnswers = answers.map(ans => {
      const q = questions.find(
        q => q._id.toString() === ans.questionId?.toString()
      );
      const correct = q ? q.correctAnswer === ans.selectedAnswer : false;
      if (correct) score++;
      return {
        questionId:     ans.questionId,
        selectedAnswer: ans.selectedAnswer,
        isCorrect:      correct,
      };
    });

    // Save to MongoDB
    const result = await Result.create({
      studentId,
      examId,
      score,
      totalQuestions: questions.length,
      answers:        processedAnswers,
      submittedAt:    new Date(),
    });

    console.log("Result saved successfully:", result._id);

    return res.status(201).json({
      message: "Exam submitted successfully",
      score,
      totalQuestions: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      resultId: result._id,
    });

  } catch (err) {
    console.error("submitResult error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc    Get student's own results (Student only)
// @route   GET /api/results/my
// @access  Private (Student)
exports.getMyResults = async (req, res) => {
  try {
    const studentId = req.user._id || req.user.id;
    const results = await Result.find({ studentId })
      .populate("examId", "title description duration")
      .sort({ submittedAt: -1 });
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc    Get all results (Admin only)
// @route   GET /api/results
// @access  Private (Admin)
exports.getAllResults = async (req, res) => {
  try {
    const results = await Result.find({})
      .populate("examId",    "title description duration")
      .populate("studentId", "name email")
      .sort({ submittedAt: -1 });
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc    Get result by ID
// @route   GET /api/results/:resultId
// @access  Private
const getResultById = async (req, res) => {
  try {
    const { resultId } = req.params;

    const result = await Result.findById(resultId)
      .populate('studentId', 'name email')
      .populate({
        path: 'examId',
        select: 'title duration',
        populate: {
          path: 'questions',
          select: 'questionText options correctAnswer'
        }
      });

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Check if user is admin or the student who took the exam
    if (req.user.role !== 'admin' && result.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this result' });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitResult: exports.submitResult,
  getMyResults: exports.getMyResults,
  getAllResults: exports.getAllResults,
  getResultById
};