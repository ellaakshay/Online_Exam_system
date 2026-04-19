// filepath: backend/controllers/examController.js
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const { validationResult } = require('express-validator');

// @desc    Create new exam (Admin only)
// @route   POST /api/exams
// @access  Private (Admin)
const createExam = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, duration, scheduledAt } = req.body;

    const exam = await Exam.create({
      title,
      description,
      duration,
      scheduledAt,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: exam,
      message: 'Exam created successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add questions to exam (Admin only)
// @route   POST /api/exams/:examId/questions
// @access  Private (Admin)
exports.addQuestion = async (req, res) => {
  try {
    const { examId } = req.params;
    const { questions } = req.body;

    // Check if exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Validate questions array
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Questions array is required' });
    }

    // Create questions
    const createdQuestions = await Question.insertMany(
      questions.map(q => ({
        examId: examId,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer
      }))
    );

    // Add question IDs to exam
    exam.questions.push(...createdQuestions.map(q => q._id));
    await exam.save();

    res.status(201).json({
      success: true,
      data: createdQuestions,
      message: `${createdQuestions.length} questions added successfully`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all exams (Admin only)
// @route   GET /api/exams
// @access  Private (Admin)
const getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate('createdBy', 'name email')
      .populate('questions')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: exams.length,
      data: exams
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get available exams (Student only)
// @route   GET /api/exams/available
// @access  Private (Student)
exports.getAvailableExams = async (req, res) => {
  try {
    // Get ALL exams — no date filter whatsoever
    const exams = await Exam.find({}).sort({ createdAt: -1 });

    // For each exam, get its questions count
    const examsWithQuestions = await Promise.all(
      exams.map(async (exam) => {
        const questions = await Question.find(
          { examId: exam._id },
          { questionText: 1, options: 1, examId: 1 }
        );
        return {
          _id: exam._id,
          title: exam.title,
          description: exam.description,
          duration: exam.duration,
          scheduledAt: exam.scheduledAt,
          createdAt: exam.createdAt,
          questionCount: questions.length,
        };
      })
    );

    res.status(200).json(examsWithQuestions);
  } catch (error) {
    console.error("getAvailableExams error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get exam by ID with questions (Student only - without correct answers)
// @route   GET /api/exams/:examId
// @access  Private (Student)
exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Get questions WITHOUT correctAnswer field
    const questions = await Question.find(
      { examId: req.params.examId },
      { questionText: 1, options: 1, examId: 1 }
    );

    res.status(200).json({
      _id: exam._id,
      title: exam.title,
      description: exam.description,
      duration: exam.duration,
      scheduledAt: exam.scheduledAt,
      questions: questions,
    });
  } catch (error) {
    console.error("getExamById error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete exam (Admin only)
// @route   DELETE /api/exams/:examId
// @access  Private (Admin)
const deleteExam = async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Delete all questions associated with the exam
    await Question.deleteMany({ examId: examId });

    // Delete the exam
    await exam.deleteOne();

    res.json({
      success: true,
      message: 'Exam deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createExam,
  getAllExams,
  getAvailableExams: exports.getAvailableExams,
  getExamById: exports.getExamById,
  deleteExam,
  addQuestion: exports.addQuestion
};