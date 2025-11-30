@echo off
echo ========================================
echo Restarting Core Services for Frontend-Client
echo ========================================
echo.
echo This will restart:
echo - Gateway (8888)
echo - Stations Service (5003)
echo - Trains Service (5002)
echo - Schedules Service (5005)
echo.
pause

echo.
echo Stopping services...
taskkill /F /FI "WINDOWTITLE eq Gateway*" 2>nul
taskkill /F /FI "WINDOWTITLE eq Stations*" 2>nul
taskkill /F /FI "WINDOWTITLE eq Trains*" 2>nul
taskkill /F /FI "WINDOWTITLE eq Schedules*" 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting services...
echo.

echo [1/4] Starting Gateway Service (Port 8888)...
start "Gateway-8888" cmd /k "cd gateway && mvnw.cmd spring-boot:run"
timeout /t 5 /nobreak >nul

echo [2/4] Starting Stations Service (Port 5003)...
start "Stations-5003" cmd /k "cd stations-service && mvnw.cmd spring-boot:run"
timeout /t 3 /nobreak >nul

echo [3/4] Starting Trains Service (Port 5002)...
start "Trains-5002" cmd /k "cd trains-service && mvnw.cmd spring-boot:run"
timeout /t 3 /nobreak >nul

echo [4/4] Starting Schedules Service (Port 5005)...
start "Schedules-5005" cmd /k "cd schedules-service && mvnw.cmd spring-boot:run"

echo.
echo ========================================
echo Core Services Are Starting...
echo ========================================
echo.
echo Wait about 30-60 seconds for all services to be ready.
echo Then test frontend-client at: http://localhost:5174
echo.
echo To verify services are running:
echo   Gateway:   curl http://localhost:8888/actuator/health
echo   Stations:  curl http://localhost:8888/api/stations
echo   Trains:    curl http://localhost:8888/api/trains
echo   Schedules: curl http://localhost:8888/api/schedules
echo.
pause
