# 🧠 Lumina – Multimodal AI Digital Therapeutics Platform

<div align="center">

### AI-Powered Mental Health & Digital Therapeutics Platform

# 📖 Overview

Mental health disorders often remain unnoticed due to the lack of continuous emotional assessment and immediate support. Traditional therapy solutions usually require scheduled consultations and may not provide instant emotional assistance.

**Lumina** is an AI-powered Digital Therapeutics Platform designed to bridge this gap by combining **Computer Vision**, **Natural Language Processing**, and **Large Language Models (LLMs)**.

The platform continuously analyzes users' facial expressions through webcam input, predicts emotional states in real time, and provides AI-assisted conversations, therapeutic guidance, and personalized wellness recommendations.

Unlike traditional chatbots, Lumina understands both **visual emotions** and **textual conversations**, enabling more empathetic and context-aware interactions.

---

# ✨ Key Features

## 😊 Real-Time Emotion Detection

- Live webcam emotion analysis
- Facial landmark detection using MediaPipe
- Face detection using OpenCV
- Multi-class emotion classification
- Real-time emotion visualization

Supported emotions include:

- Happy
- Sad
- Angry
- Fear
- Surprise
- Neutral
- Disgust

---

## 🤖 AI Mental Health Counselor

The integrated AI counselor provides:

- Context-aware conversations
- Emotional support
- Stress management suggestions
- Anxiety reduction techniques
- Personalized wellness recommendations
- Motivational interactions

---

## 🧠 Personalized Therapy Recommendations

Based on detected emotions, the platform dynamically recommends:

- Meditation
- Breathing exercises
- Mindfulness sessions
- Relaxation techniques
- Positive affirmations
- Self-care activities

---

## 👤 User Management

- Secure user registration
- Login authentication
- Profile management
- Personalized dashboard
- Session history

---

## 📊 Emotion Analytics

Users can monitor:

- Recent emotional states
- Mood trends
- Emotion history
- Therapy sessions

---

## 🔐 Secure REST APIs

Backend APIs include:

- Authentication
- User Profile
- Emotion Detection
- AI Chat
- Therapy Recommendations

Built using Django REST Framework.

---

# 🏗 System Architecture

```
                User
                  │
                  ▼
        React Frontend (TypeScript)
                  │
         Axios REST API Calls
                  │
                  ▼
        Django REST Framework
                  │
     ┌────────────┼─────────────┐
     │            │             │
     ▼            ▼             ▼
 Authentication Emotion AI  Therapy Engine
     │            │             │
     ▼            ▼             ▼
SQLite      MediaPipe/OpenCV   LLM APIs
                  │
                  ▼
          Emotion Prediction
                  │
                  ▼
      AI-Based Therapeutic Response
```

---

# 🧠 AI Pipeline

### Step 1

User opens the application.

↓

### Step 2

Webcam captures facial images.

↓

### Step 3

OpenCV detects the face.

↓

### Step 4

MediaPipe extracts facial landmarks.

↓

### Step 5

The emotion classification model predicts the user's emotional state.

↓

### Step 6

Detected emotion is sent to the backend.

↓

### Step 7

The AI Counselor generates context-aware therapeutic responses using NLP and LLM APIs.

↓

### Step 8

Personalized recommendations are displayed to the user.

---

# 🛠 Technology Stack

## Frontend

- React
- TypeScript
- Tailwind CSS
- HTML5
- CSS3
- Axios

---

## Backend

- Django
- Django REST Framework
- Python

---

## Artificial Intelligence

- OpenCV
- MediaPipe
- Transformers
- Natural Language Processing
- Large Language Models (LLMs)

---

## Database

- SQLite

---

## APIs

- REST API
- AI Model APIs

---

## Development Tools

- Git
- GitHub
- VS Code
- Postman

---

# 📁 Project Structure

```
Lumina
│
├── Frontend
│   ├── src
│   ├── public
│   ├── assets
│   └── package.json
│
├── backend
│   ├── chatbot
│   ├── users
│   ├── therapy
│   ├── emotions
│   ├── manage.py
│   └── requirements.txt
│
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/SUMITHRA91/Lumina.git
cd Lumina
```

---

## Backend

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

Backend:

```
http://127.0.0.1:8000
```

---

## Frontend

```bash
cd Frontend

npm install

npm run dev
```

Frontend:

```
http://localhost:5173
```

---

# 🔍 Core Functionalities

✅ User Authentication

✅ Emotion Detection

✅ AI Counseling

✅ Therapy Recommendations

✅ Mood Tracking

✅ REST APIs

✅ Responsive UI

✅ Real-Time Camera Processing

---

# 🔮 Future Enhancements

- Voice Emotion Recognition
- Speech-to-Text Therapy
- AI Mood Forecasting
- Therapist Dashboard
- Wearable Device Integration
- Cloud Deployment (AWS/Azure)
- Mobile Application
- Multi-language Support
- AI Progress Reports

---

# 📈 Project Highlights

✔ Full-Stack AI Web Application

✔ Real-Time Computer Vision

✔ Facial Landmark Detection

✔ AI-Powered Therapy

✔ RESTful Backend APIs

✔ React + Django Architecture

✔ Modular Codebase

✔ Scalable Design

---

# 👩‍💻 Developed By

## **Sumithra C**

**Information Science & Engineering**

PES College of Engineering, Mandya

📧 Email: *your-email@example.com*

🔗 GitHub: https://github.com/SUMITHRA91

🔗 LinkedIn: *Add your LinkedIn URL*

---

# ⭐ If you found this project useful, don't forget to Star the repository!
