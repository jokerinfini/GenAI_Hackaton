@echo off
echo Starting MRV-in-a-Box Services...
echo.

echo Starting API Service...
start "API Service" cmd /k "cd api && npm run dev"

echo Starting Dashboard...
start "Dashboard" cmd /k "cd dashboard && npm run dev"

echo Starting Calculation Service...
start "Calculation Service" cmd /k "cd calc && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo All services are starting...
echo.
echo Access your application at:
echo - Main Dashboard: http://localhost:3000
echo - VM0042 Dashboard: http://localhost:3000/vm0042
echo - API: http://localhost:3001
echo - Calculation Service: http://localhost:8000
echo.
pause
