# LearnInSlices Deployment and Testing Script for Windows
param(
    [string]$Environment = "development",
    [switch]$RunTests = $false
)

# Configuration
Write-Host "🚀 LearnInSlices Deployment and Testing Script" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "📋 Environment: $Environment" -ForegroundColor Blue

# Helper functions
function Log-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Log-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Log-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Log-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Check prerequisites
function Check-Prerequisites {
    Log-Info "Checking prerequisites..."
    
    # Check Python
    try {
        $pythonVersion = python --version 2>&1
        Log-Success "Python is available: $pythonVersion"
    }
    catch {
        Log-Error "Python is not installed or not in PATH"
        exit 1
    }
    
    # Check Node.js
    try {
        $nodeVersion = node --version 2>&1
        Log-Success "Node.js is available: $nodeVersion"
    }
    catch {
        Log-Warning "Node.js is not installed (required for frontend)"
    }
    
    # Check Git
    try {
        git --version | Out-Null
        Log-Success "Git is available"
    }
    catch {
        Log-Warning "Git is not installed"
    }
}

# Setup environment
function Setup-Environment {
    Log-Info "Setting up environment for $Environment..."
    
    $envFile = "backend\.env"
    
    if ($Environment -eq "production") {
        Copy-Item "backend\.env.production" $envFile -Force
        Log-Success "Production environment configured"
    }
    elseif ($Environment -eq "staging") {
        Copy-Item "backend\.env.production" $envFile -Force
        # Modify for staging
        (Get-Content $envFile) -replace 'DEBUG=False', 'DEBUG=True' | Set-Content $envFile
        Log-Success "Staging environment configured"
    }
    else {
        Copy-Item "backend\.env.development" $envFile -Force
        Log-Success "Development environment configured"
    }
}

# Build application
function Build-Application {
    Log-Info "Building application..."
    
    if ($Environment -eq "development") {
        # Development build
        Log-Info "Setting up development environment..."
        
        # Setup backend
        Set-Location "backend"
        
        if (!(Test-Path "venv")) {
            python -m venv venv
            Log-Success "Virtual environment created"
        }
        
        # Activate virtual environment and install dependencies
        & "venv\Scripts\Activate.ps1"
        pip install -r requirements.txt
        Log-Success "Backend dependencies installed"
        
        Set-Location ".."
        
        # Setup frontend
        Set-Location "frontend"
        npm install
        Log-Success "Frontend dependencies installed"
        Set-Location ".."
    }
    else {
        # Production build with Docker
        Log-Info "Building Docker images..."
        docker-compose build
        Log-Success "Docker images built"
    }
}

# Run tests
function Run-Tests {
    if (-not $RunTests) {
        Log-Info "Skipping tests (use -RunTests to enable)"
        return
    }
    
    Log-Info "Running tests..."
    
    # Backend tests
    Log-Info "Running backend tests..."
    Set-Location "backend"
    
    if ($Environment -eq "development") {
        & "venv\Scripts\Activate.ps1"
    }
    
    # Install test dependencies
    pip install pytest pytest-asyncio pytest-cov
    
    # Run tests
    try {
        pytest tests/ -v --cov=app
        Log-Success "Backend tests passed"
    }
    catch {
        Log-Error "Backend tests failed"
        Set-Location ".."
        exit 1
    }
    
    Set-Location ".."
    
    # Frontend tests
    Log-Info "Running frontend tests..."
    Set-Location "frontend"
    try {
        npm run test:unit
        Log-Success "Frontend tests passed"
    }
    catch {
        Log-Warning "Frontend tests failed or not configured"
    }
    Set-Location ".."
}

# Deploy application
function Deploy-Application {
    Log-Info "Deploying application..."
    
    if ($Environment -eq "development") {
        # Start development servers
        Log-Info "Starting development servers..."
        
        # Start backend in background
        Start-Process PowerShell -ArgumentList @(
            "-NoExit",
            "-Command",
            "cd 'backend'; venv\Scripts\Activate.ps1; python demo_server.py"
        ) -WindowStyle Minimized
        
        Log-Success "Backend server started"
        
        # Start frontend in background
        Start-Process PowerShell -ArgumentList @(
            "-NoExit", 
            "-Command",
            "cd 'frontend'; npm run dev"
        ) -WindowStyle Minimized
        
        Log-Success "Frontend server started"
        
        Start-Sleep -Seconds 5
        
        Write-Host ""
        Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
        Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
        Write-Host "   Backend:  http://127.0.0.1:8000" -ForegroundColor White
        Write-Host "   API Docs: http://127.0.0.1:8000/docs" -ForegroundColor White
        Write-Host ""
    }
    else {
        # Production deployment
        Log-Info "Starting production services..."
        docker-compose up -d
        Log-Success "Production services started"
        
        Write-Host ""
        Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
        Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
        Write-Host "   Backend:  http://localhost:8000" -ForegroundColor White
        Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor White
        Write-Host ""
    }
}

# Health checks
function Run-HealthChecks {
    Log-Info "Running health checks..."
    
    # Wait for services to start
    Start-Sleep -Seconds 10
    
    # Check backend health
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/health" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Log-Success "Backend health check passed"
        }
        else {
            Log-Error "Backend health check failed"
            exit 1
        }
    }
    catch {
        Log-Error "Backend health check failed: $($_.Exception.Message)"
        exit 1
    }
}

# Test AI features
function Test-AIFeatures {
    Log-Info "Testing AI features..."
    
    # Test content generation
    try {
        $body = @{
            topic = "test"
            difficulty = "intermediate"
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/ai/generate-content" `
            -Method POST `
            -Body $body `
            -ContentType "application/json" `
            -UseBasicParsing `
            -TimeoutSec 10
        
        if ($response.StatusCode -eq 200) {
            Log-Success "AI content generation test passed"
        }
    }
    catch {
        Log-Warning "AI content generation test failed: $($_.Exception.Message)"
    }
    
    # Test recommendations
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/recommendations/content/test-user?count=3" `
            -UseBasicParsing `
            -TimeoutSec 10
        
        if ($response.StatusCode -eq 200) {
            Log-Success "AI recommendations test passed"
        }
    }
    catch {
        Log-Warning "AI recommendations test failed: $($_.Exception.Message)"
    }
    
    # Test analytics
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/analytics/progress/test-user" `
            -UseBasicParsing `
            -TimeoutSec 10
        
        if ($response.StatusCode -eq 200) {
            Log-Success "Analytics test passed"
        }
    }
    catch {
        Log-Warning "Analytics test failed: $($_.Exception.Message)"
    }
}

# Main execution
function Main {
    try {
        Write-Host "🚀 Starting deployment process..." -ForegroundColor Green
        
        Check-Prerequisites
        Setup-Environment
        Build-Application
        Run-Tests
        Deploy-Application
        Run-HealthChecks
        Test-AIFeatures
        
        Log-Success "Deployment completed successfully!"
        Write-Host ""
        Write-Host "🎉 LearnInSlices is now running!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Open the frontend application in your browser" -ForegroundColor White
        Write-Host "2. Navigate to 'Advanced Features' → 'AI Backend Integration'" -ForegroundColor White
        Write-Host "3. Test the AI features and recommendations" -ForegroundColor White
        Write-Host "4. Check the API documentation for detailed endpoint information" -ForegroundColor White
        Write-Host ""
        
        if ($Environment -eq "development") {
            Write-Host "Development servers are running in separate windows." -ForegroundColor Yellow
            Write-Host "Close those windows to stop the services." -ForegroundColor Yellow
        }
        else {
            Write-Host "Use 'docker-compose down' to stop the services." -ForegroundColor Yellow
        }
    }
    catch {
        Log-Error "Deployment failed: $($_.Exception.Message)"
        exit 1
    }
}

# Run main function
Main
