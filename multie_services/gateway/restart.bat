@echo off
echo ========================================
echo Restarting Gateway Service
echo ========================================
echo.

echo Stopping any running Gateway instances...
taskkill /F /IM java.exe /FI "WINDOWTITLE eq *gateway*" 2>nul

echo.
echo Starting Gateway Service on port 8888...
echo.

start "Gateway Service" cmd /k "mvnw.cmd spring-boot:run"

echo.
echo ========================================
echo Gateway Service is starting...
echo Check the new window for logs
echo Gateway will be available at: http://localhost:8888
echo ========================================
pause
