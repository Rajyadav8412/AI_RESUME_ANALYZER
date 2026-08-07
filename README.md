# 🚀 ResumeIQ – AI Powered Resume Analyzer

ResumeIQ is a full-stack AI-powered web application that analyzes resumes, calculates ATS compatibility scores, identifies strengths and weaknesses, and provides actionable recommendations using Google's Gemini AI.

Designed for students and job seekers to improve their resumes before applying for internships and full-time roles.

---

## ✨ Features

- 🔐 Secure JWT Authentication
- 📄 PDF Resume Upload
- 🧠 AI Resume Analysis using Gemini
- 📊 ATS Score Calculation
- 💼 Resume Information Extraction
- 📚 Resume Analysis History
- 🔄 Compare Multiple Resume Versions
- 🎯 Role-specific Resume Analysis
- ⚡ Fast React + Vite Frontend
- 🌙 Modern Responsive UI

---

## 🛠 Tech Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS

### Backend

- Django
- Django REST Framework
- Simple JWT

### AI

- Google Gemini API

### Database

- SQLite (Development)
- PostgreSQL (Production)

### Deployment

- Vercel (Frontend)
- Render (Backend)

---

## 📂 Project Structure

```
AI_RESUME_ANALYZER/

│

├── backend/

│ ├── accounts/

│ ├── resumes/

│ ├── analysis/

│ ├── config/

│

├── frontend/

│ ├── src/

│ ├── components/

│ ├── pages/

│ ├── services/

│

└── README.md
```

---

## 🔥 Core Features

### Authentication

- User Registration
- Login
- JWT Authentication

### Resume Processing

- Upload Resume
- Extract Resume Text
- Parse Resume Information

### AI Analysis

- ATS Score
- Resume Summary
- Strengths
- Weaknesses
- Missing Skills
- AI Recommendations

### Resume Comparison

- Compare ATS Scores
- Compare Skills Added
- Compare Skills Removed

---

## 📷 Screenshots

### Login Page

<img width="1902" height="867" alt="Screenshot 2026-08-07 231752" src="https://github.com/user-attachments/assets/66cd54ea-3b41-408d-bd50-1f4cef9e7f50" />


### Dashboard

<img width="1917" height="851" alt="Screenshot 2026-08-07 232019" src="https://github.com/user-attachments/assets/0dac339f-33a4-4464-831f-5d3c65bf58fa" />


### Upload Resume

<img width="1893" height="862" alt="Screenshot 2026-08-07 232037" src="https://github.com/user-attachments/assets/61aabe88-e994-42cf-b347-824cc6de9be2" />


### AI Resume Analysis

<img width="1917" height="857" alt="Screenshot 2026-08-07 232254" src="https://github.com/user-attachments/assets/026155f0-e94a-4bde-8525-cb895f33f8bb" />


### Resume Comparison

<img width="1917" height="867" alt="Screenshot 2026-08-07 232410" src="https://github.com/user-attachments/assets/bb865beb-c9f4-4626-808c-c360109e4c4e" />


### Settings

<img width="1503" height="845" alt="Screenshot 2026-08-07 232430" src="https://github.com/user-attachments/assets/b936d482-6aba-43bb-bc2f-221c414d66cf" />


---

## ⚙ Installation

### Clone Repository

```bash
git clone https://github.com/Rajyadav8412/AI_RESUME_ANALYZER.git
```

Move into project

```bash
cd AI_RESUME_ANALYZER
```

Backend

```bash
pip install -r requirements.txt
```

```bash
python manage.py migrate
```

```bash
python manage.py runserver
```

Frontend

```bash
npm install
```

```bash
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file and add

```
SECRET_KEY=your_secret_key

DEBUG=True

GEMINI_API_KEY=your_gemini_api_key

DATABASE_URL=your_database_url
```

---

## 🚀 Future Improvements

- Resume Builder
- Cover Letter Generator
- Job Recommendation System
- Interview Preparation
- LinkedIn Profile Analyzer
- Skill Gap Analysis

---

## 👨‍💻 Author

**Raj Yadav**

GitHub

https://github.com/Rajyadav8412

---

## ⭐ Support

If you like this project, don't forget to ⭐ the repository.
