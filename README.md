# 🧠 LearnInSlices - Adaptive Microlearning Platform

[![Python](https://img.shields.io/badge/Python-3.13+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-In%20Development-yellow.svg)]()

An open-source, AI-driven microlearning platform that adapts to your learning patterns using spaced repetition, peer collaboration, and gamification.

## ✨ Features

- 🎯 **AI-Generated Micro-Cards**: Snackable content, videos, quizzes, and drills
- 🧠 **Spaced Repetition Engine**: Adaptive review scheduling using Leitner/SM2 algorithms
- 📊 **Progress Dashboard**: XP tracking, streaks, badges, and leaderboards
- 👥 **Peer Study Rooms**: Real-time collaboration and Q&A
- 🔍 **OER Integration**: Free educational resource recommendations
- 📈 **Self-Hosted Analytics**: Privacy-first engagement tracking

## 🏗️ Architecture

```
LearnInSlices/
├── backend/           # FastAPI + PostgreSQL + Celery
├── frontend/          # React 18 + TailwindCSS + Vite
├── ml/               # HuggingFace models & embeddings
├── docker-compose.yml # One-command deployment
└── README.md         # You are here!
```

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/Shreya-Shindee/LearnInSlices.git
cd LearnInSlices

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Run Stage 1 tests
python test_stage1.py

# Run interactive demo
cd ..
python demo.py
```

## 🎮 Live Demo

Experience Stage 1 functionality with our interactive demo:

```bash
python demo.py
```

The demo showcases:
- 🧠 **Spaced Repetition Algorithms** (SM2 & Leitner)
- 📚 **Microlearning Content Creation**
- 🎯 **Adaptive Scheduling** with confidence adjustments
- 🏆 **Gamification System** with XP and streaks
- 📈 **Performance Analytics** and retention tracking

## 🛠️ Development Stages

- [x] **Stage 1**: Core backend models & spaced repetition ✅
- [ ] **Stage 2**: OER crawler & micro-card generator
- [ ] **Stage 3**: API endpoints & authentication
- [ ] **Stage 4**: Frontend dashboard & review interface
- [ ] **Stage 5**: Peer tutoring & real-time features
- [ ] **Stage 6**: Gamification & analytics
- [ ] **Stage 7**: Docker deployment
- [ ] **Stage 8**: Documentation & demo

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

*Building the future of personalized learning, one micro-slice at a time!* 🎓
