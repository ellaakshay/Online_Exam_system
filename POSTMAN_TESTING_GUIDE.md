# Online Examination System - Postman Testing Guide

## Environment Setup

Create a new Postman environment with these variables:

| Variable | Initial Value | Description |
|----------|---------------|-------------|
| `base_url` | `http://localhost:5000` | API base URL |
| `token` | `` | JWT token (empty initially) |
| `admin_token` | `` | Admin JWT token |
| `student_token` | `` | Student JWT token |

---

## Test Cases

### 1. Register as Admin

**Request:**
- **Method:** POST
- **URL:** `{{base_url}}/api/auth/register`
- **Headers:** `Content-Type: application/json`

**JSON Body:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

**Action:** Copy the `token` value and save it to `admin_token` environment variable.

---

### 2. Register as Student

**Request:**
- **Method:** POST
- **URL:** `{{base_url}}/api/auth/register`
- **Headers:** `Content-Type: application/json`

**JSON Body:**
```json
{
  "name": "John Student",
  "email": "student@example.com",
  "password": "student123",
  "role": "student"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Student",
    "email": "student@example.com",
    "role": "student",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

**Action:** Copy the `token` value and save it to `student_token` environment variable.

---

### 3. Login as Admin

**Request:**
- **Method:** POST
- **URL:** `{{base_url}}/api/auth/login`
- **Headers:** `Content-Type: application/json`

**JSON Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

---

### 4. Login as Student

**Request:**
- **Method:** POST
- **URL:** `{{base_url}}/api/auth/login`
- **Headers:** `Content-Type: application/json`

**JSON Body:**
```json
{
  "email": "student@example.com",
  "password": "student123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Student",
    "email": "student@example.com",
    "role": "student",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

---

### 5. Admin: Create Exam

**Request:**
- **Method:** POST
- **URL:** `{{base_url}}/api/exams`
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer {{admin_token}}`

**JSON Body:**
```json
{
  "title": "JavaScript Fundamentals",
  "description": "Test your basic JavaScript knowledge",
  "duration": 30,
  "scheduledAt": "2026-04-20T10:00:00Z"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "title": "JavaScript Fundamentals",
    "description": "Test your basic JavaScript knowledge",
    "duration": 30,
    "scheduledAt": "2026-04-20T10:00:00.000Z",
    "createdBy": "...",
    "questions": [],
    "_id": "...",
    "createdAt": "..."
  },
  "message": "Exam created successfully"
}
```

**Action:** Copy the `_id` value - this is your `examId` for the next tests.

---

### 6. Admin: Add Questions to Exam

**Request:**
- **Method:** POST
- **URL:** `{{base_url}}/api/exams/{examId}/questions`
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer {{admin_token}}`

**JSON Body:**
```json
{
  "questions": [
    {
      "questionText": "What is the correct way to declare a variable in JavaScript?",
      "options": ["var x = 5", "variable x = 5", "int x = 5", "x := 5"],
      "correctAnswer": "A"
    },
    {
      "questionText": "Which method is used to add an element to the end of an array?",
      "options": ["push()", "pop()", "shift()", "unshift()"],
      "correctAnswer": "A"
    },
    {
      "questionText": "What does === operator do in JavaScript?",
      "options": ["Assigns value", "Compares value only", "Compares value and type", "Checks equality loosely"],
      "correctAnswer": "C"
    },
    {
      "questionText": "Which is NOT a JavaScript data type?",
      "options": ["Number", "Boolean", "Float", "String"],
      "correctAnswer": "C"
    },
    {
      "questionText": "How do you write a single-line comment in JavaScript?",
      "options": ["<!-- comment -->", "// comment", "/* comment */", "# comment"],
      "correctAnswer": "B"
    }
  ]
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": [
    {
      "examId": "...",
      "questionText": "What is the correct way to declare a variable in JavaScript?",
      "options": ["var x = 5", "variable x = 5", "int x = 5", "x := 5"],
      "correctAnswer": "A",
      "_id": "...",
      "createdAt": "..."
    }
    // ... more questions
  ],
  "message": "5 questions added successfully"
}
```

---

### 7. Student: View Available Exams

**Request:**
- **Method:** GET
- **URL:** `{{base_url}}/api/exams/available`
- **Headers:** `Authorization: Bearer {{student_token}}`

**Expected Response (200):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "...",
      "title": "JavaScript Fundamentals",
      "description": "Test your basic JavaScript knowledge",
      "duration": 30,
      "scheduledAt": "2026-04-20T10:00:00.000Z",
      "createdAt": "...",
      "createdBy": {
        "_id": "...",
        "name": "Admin User"
      }
    }
  ]
}
```

---

### 8. Student: Get Exam Details (without correct answers)

**Request:**
- **Method:** GET
- **URL:** `{{base_url}}/api/exams/{examId}`
- **Headers:** `Authorization: Bearer {{student_token}}`

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "JavaScript Fundamentals",
    "description": "Test your basic JavaScript knowledge",
    "duration": 30,
    "scheduledAt": "...",
    "createdBy": { ... },
    "questions": [
      {
        "_id": "...",
        "questionText": "What is the correct way to declare a variable in JavaScript?",
        "options": ["var x = 5", "variable x = 5", "int x = 5", "x := 5"]
        // Note: correctAnswer is NOT included
      }
    ]
  }
}
```

---

### 9. Student: Submit Exam Answers

**Request:**
- **Method:** POST
- **URL:** `{{base_url}}/api/results/submit`
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer {{student_token}}`

**JSON Body:**
```json
{
  "examId": "{examId}",
  "answers": [
    {
      "questionId": "{questionId_1}",
      "selectedAnswer": "A"
    },
    {
      "questionId": "{questionId_2}",
      "selectedAnswer": "A"
    },
    {
      "questionId": "{questionId_3}",
      "selectedAnswer": "C"
    },
    {
      "questionId": "{questionId_4}",
      "selectedAnswer": "B"
    },
    {
      "questionId": "{questionId_5}",
      "selectedAnswer": "B"
    }
  ]
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "student": {
      "_id": "...",
      "name": "John Student",
      "email": "student@example.com"
    },
    "exam": {
      "_id": "...",
      "title": "JavaScript Fundamentals"
    },
    "score": 4,
    "totalQuestions": 5,
    "percentage": "80.00",
    "submittedAt": "2026-04-18T..."
  },
  "message": "Exam submitted successfully"
}
```

---

### 10. Student: View My Results

**Request:**
- **Method:** GET
- **URL:** `{{base_url}}/api/results/my`
- **Headers:** `Authorization: Bearer {{student_token}}`

**Expected Response (200):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "...",
      "exam": {
        "_id": "...",
        "title": "JavaScript Fundamentals",
        "duration": 30
      },
      "student": { ... },
      "score": 4,
      "totalQuestions": 5,
      "percentage": "80.00",
      "submittedAt": "2026-04-18T..."
    }
  ]
}
```

---

### 11. Admin: View All Results

**Request:**
- **Method:** GET
- **URL:** `{{base_url}}/api/results`
- **Headers:** `Authorization: Bearer {{admin_token}}`

**Expected Response (200):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "...",
      "student": {
        "_id": "...",
        "name": "John Student",
        "email": "student@example.com"
      },
      "exam": {
        "_id": "...",
        "title": "JavaScript Fundamentals",
        "duration": 30
      },
      "score": 4,
      "totalQuestions": 5,
      "percentage": "80.00",
      "submittedAt": "2026-04-18T..."
    }
  ]
}
```

---

### 12. Admin: Get All Exams

**Request:**
- **Method:** GET
- **URL:** `{{base_url}}/api/exams`
- **Headers:** `Authorization: Bearer {{admin_token}}`

**Expected Response (200):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "...",
      "title": "JavaScript Fundamentals",
      "description": "Test your basic JavaScript knowledge",
      "duration": 30,
      "scheduledAt": "...",
      "createdBy": { ... },
      "questions": [ ... ],
      "createdAt": "..."
    }
  ]
}
```

---

## Error Responses

### 401 - Unauthorized (No Token)
```json
{
  "message": "Not authorized, no token"
}
```

### 401 - Unauthorized (Invalid Token)
```json
{
  "message": "Not authorized, token failed"
}
```

### 403 - Forbidden (Wrong Role)
```json
{
  "message": "Access denied. Admin only."
}
```

### 400 - Bad Request (Validation Error)
```json
{
  "errors": [
    {
      "msg": "Password must be at least 6 characters",
      "param": "password",
      "location": "body"
    }
  ]
}
```

### 404 - Not Found
```json
{
  "message": "Exam not found"
}
```

---

## Quick Test Flow Summary

1. **Register Admin** → Save token to `admin_token`
2. **Register Student** → Save token to `student_token`
3. **Login Admin** (optional, token already saved)
4. **Login Student** (optional, token already saved)
5. **Create Exam** (admin) → Copy `examId`
6. **Add Questions** (admin) → Use `examId` from step 5
7. **View Available Exams** (student)
8. **Get Exam Details** (student) → Copy `questionId`s
9. **Submit Exam** (student) → Use `examId` and `questionId`s
10. **View My Results** (student)
11. **View All Results** (admin)