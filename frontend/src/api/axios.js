// filepath: frontend/src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
});

// Attach token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ONLY logout on 401 for GET requests or auth routes
// NEVER logout on POST /results/submit
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    // Only redirect to login if:
    // 1. Status is 401 AND
    // 2. It is NOT a submit request AND
    // 3. It is NOT a results request
    if (
      status === 401 &&
      !url.includes("/results/submit") &&
      !url.includes("/results/my") &&
      !url.includes("/auth/login")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default API;

// Auth APIs
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Exam APIs
export const createExam = (data) => API.post('/exams', data);
export const getAllExams = () => API.get('/exams');
export const getAvailableExams = () => API.get('/exams/available');
export const getExamById = (id) => API.get(`/exams/${id}`);
export const addQuestions = (examId, data) => API.post(`/exams/${examId}/questions`, data);
export const deleteExam = (id) => API.delete(`/exams/${id}`);

// Result APIs
export const submitResult = (data) => API.post('/results/submit', data);
export const getMyResults = () => API.get('/results/my');
export const getAllResults = () => API.get('/results');