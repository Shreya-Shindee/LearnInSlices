#!/bin/bash
# LearnInSlices Deployment and Testing Script

set -e

echo "🚀 LearnInSlices Deployment and Testing Script"
echo "=============================================="

# Configuration
ENVIRONMENT=${1:-development}
echo "📋 Environment: $ENVIRONMENT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    log_success "Docker is available"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    log_success "Docker Compose is available"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_warning "Node.js is not installed (required for local development)"
    else
        log_success "Node.js is available"
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        log_warning "Python 3 is not installed (required for local development)"
    else
        log_success "Python 3 is available"
    fi
}

# Environment setup
setup_environment() {
    log_info "Setting up environment for $ENVIRONMENT..."
    
    # Copy environment file
    if [ "$ENVIRONMENT" = "production" ]; then
        cp backend/.env.production backend/.env
        log_success "Production environment configured"
    elif [ "$ENVIRONMENT" = "staging" ]; then
        cp backend/.env.production backend/.env
        # Modify for staging
        sed -i 's/DEBUG=False/DEBUG=True/g' backend/.env
        log_success "Staging environment configured"
    else
        cp backend/.env.development backend/.env
        log_success "Development environment configured"
    fi
}

# Build application
build_application() {
    log_info "Building application..."
    
    if [ "$ENVIRONMENT" = "development" ]; then
        # Development build
        log_info "Starting development services..."
        docker-compose -f docker-compose.dev.yml up -d
        log_success "Development database and Redis started"
        
        # Install backend dependencies
        cd backend
        if [ ! -d "venv" ]; then
            python3 -m venv venv
            log_success "Virtual environment created"
        fi
        
        source venv/bin/activate
        pip install -r requirements.txt
        log_success "Backend dependencies installed"
        cd ..
        
        # Install frontend dependencies
        cd frontend
        npm install
        log_success "Frontend dependencies installed"
        cd ..
        
    else
        # Production build
        log_info "Building Docker images..."
        docker-compose build
        log_success "Docker images built"
    fi
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    # Backend tests
    log_info "Running backend tests..."
    cd backend
    if [ "$ENVIRONMENT" = "development" ]; then
        source venv/bin/activate
    fi
    
    # Install test dependencies
    pip install pytest pytest-asyncio pytest-cov
    
    # Run tests
    if pytest tests/ -v --cov=app; then
        log_success "Backend tests passed"
    else
        log_error "Backend tests failed"
        exit 1
    fi
    cd ..
    
    # Frontend tests
    log_info "Running frontend tests..."
    cd frontend
    if npm run test:unit; then
        log_success "Frontend tests passed"
    else
        log_warning "Frontend tests failed or not configured"
    fi
    cd ..
}

# Deploy application
deploy_application() {
    log_info "Deploying application..."
    
    if [ "$ENVIRONMENT" = "development" ]; then
        # Start development servers
        log_info "Starting development servers..."
        
        # Start backend
        cd backend
        source venv/bin/activate
        python demo_server.py &
        BACKEND_PID=$!
        log_success "Backend server started (PID: $BACKEND_PID)"
        cd ..
        
        # Start frontend
        cd frontend
        npm run dev &
        FRONTEND_PID=$!
        log_success "Frontend server started (PID: $FRONTEND_PID)"
        cd ..
        
        echo "🌐 Application URLs:"
        echo "   Frontend: http://localhost:5173"
        echo "   Backend:  http://127.0.0.1:8000"
        echo "   API Docs: http://127.0.0.1:8000/docs"
        
    else
        # Production deployment
        log_info "Starting production services..."
        docker-compose up -d
        log_success "Production services started"
        
        echo "🌐 Application URLs:"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend:  http://localhost:8000"
        echo "   API Docs: http://localhost:8000/docs"
    fi
}

# Health checks
run_health_checks() {
    log_info "Running health checks..."
    
    # Wait for services to start
    sleep 10
    
    # Check backend health
    if curl -f http://127.0.0.1:8000/health > /dev/null 2>&1; then
        log_success "Backend health check passed"
    else
        log_error "Backend health check failed"
        exit 1
    fi
    
    # Check frontend (for production)
    if [ "$ENVIRONMENT" != "development" ]; then
        if curl -f http://localhost:3000 > /dev/null 2>&1; then
            log_success "Frontend health check passed"
        else
            log_error "Frontend health check failed"
            exit 1
        fi
    fi
}

# Test AI features
test_ai_features() {
    log_info "Testing AI features..."
    
    # Test content generation
    if curl -f -X POST "http://127.0.0.1:8000/api/v1/ai/generate-content" \
        -H "Content-Type: application/json" \
        -d '{"topic": "test", "difficulty": "intermediate"}' > /dev/null 2>&1; then
        log_success "AI content generation test passed"
    else
        log_warning "AI content generation test failed"
    fi
    
    # Test recommendations
    if curl -f "http://127.0.0.1:8000/api/v1/recommendations/content/test-user?count=3" > /dev/null 2>&1; then
        log_success "AI recommendations test passed"
    else
        log_warning "AI recommendations test failed"
    fi
    
    # Test analytics
    if curl -f "http://127.0.0.1:8000/api/v1/analytics/progress/test-user" > /dev/null 2>&1; then
        log_success "Analytics test passed"
    else
        log_warning "Analytics test failed"
    fi
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    
    if [ "$ENVIRONMENT" = "development" ]; then
        # Kill development servers
        if [ ! -z "$BACKEND_PID" ]; then
            kill $BACKEND_PID 2>/dev/null || true
        fi
        if [ ! -z "$FRONTEND_PID" ]; then
            kill $FRONTEND_PID 2>/dev/null || true
        fi
        log_success "Development servers stopped"
    else
        # Stop Docker services
        docker-compose down
        log_success "Docker services stopped"
    fi
}

# Trap cleanup function
trap cleanup EXIT

# Main execution
main() {
    echo "🚀 Starting deployment process..."
    
    check_prerequisites
    setup_environment
    build_application
    
    # Only run tests in CI or when explicitly requested
    if [ "$RUN_TESTS" = "true" ]; then
        run_tests
    fi
    
    deploy_application
    run_health_checks
    test_ai_features
    
    log_success "Deployment completed successfully!"
    echo ""
    echo "🎉 LearnInSlices is now running!"
    echo ""
    echo "Next steps:"
    echo "1. Open the frontend application in your browser"
    echo "2. Navigate to 'Advanced Features' → 'AI Backend Integration'"
    echo "3. Test the AI features and recommendations"
    echo "4. Check the API documentation for detailed endpoint information"
    echo ""
    echo "Press Ctrl+C to stop the services"
    
    # Keep script running for development
    if [ "$ENVIRONMENT" = "development" ]; then
        wait
    fi
}

# Run main function
main "$@"
