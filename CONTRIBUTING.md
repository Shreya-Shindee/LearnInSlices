# Contributing to LearnInSlices

Thank you for your interest in contributing to LearnInSlices! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/LearnInSlices.git
   cd LearnInSlices
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🏗️ Development Setup

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python test_stage1.py  # Run tests
```

### Database Setup
```bash
# Start PostgreSQL with Docker
docker run --name learninslices-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=learninslices -p 5432:5432 -d postgres:15
```

## 📝 Code Style

- **Python**: Follow PEP 8, use type hints
- **Documentation**: Comprehensive docstrings for all functions/classes
- **Testing**: Write tests for new features
- **Commits**: Use conventional commit format

### Example Commit Messages
```
feat: add spaced repetition SM2 algorithm
fix: resolve database connection issue
docs: update API documentation
test: add unit tests for review model
```

## 🧪 Testing

Run tests before submitting:
```bash
# Backend tests
cd backend
python test_stage1.py

# Full test suite (when available)
pytest tests/ -v
```

## 📋 Pull Request Process

1. **Update tests** for your changes
2. **Update documentation** if needed
3. **Ensure all tests pass**
4. **Submit pull request** with:
   - Clear description of changes
   - Link to related issues
   - Screenshots (if UI changes)

## 🎯 Development Stages

Current development follows these stages:
- ✅ **Stage 1**: Core models & spaced repetition
- 🚧 **Stage 2**: OER crawler & content generation
- 📅 **Stage 3**: API endpoints & authentication
- 📅 **Stage 4**: Frontend dashboard
- 📅 **Stage 5**: Real-time features
- 📅 **Stage 6**: Gamification & analytics
- 📅 **Stage 7**: Docker deployment
- 📅 **Stage 8**: Documentation & demo

## 🐛 Reporting Issues

- Use GitHub Issues with appropriate labels
- Include steps to reproduce
- Provide system information
- Add screenshots if applicable

## 💡 Feature Requests

- Open an issue with `enhancement` label
- Describe the feature and use case
- Discuss implementation approach

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0 Guide](https://docs.sqlalchemy.org/en/20/)
- [Spaced Repetition Research](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)

## 🤝 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow open source best practices

---

Happy coding! 🎓✨
