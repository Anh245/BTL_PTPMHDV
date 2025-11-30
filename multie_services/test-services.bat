@echo off
echo ========================================
echo Testing Backend Services
echo ========================================
echo.

echo [1/4] Testing Gateway Health...
curl -s http://localhost:8888/actuator/health
if %errorlevel% neq 0 (
    echo ❌ Gateway is NOT running!
) else (
    echo ✅ Gateway is running
)
echo.
echo.

echo [2/4] Testing Stations API...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:8888/api/stations
curl -s http://localhost:8888/api/stations | findstr /C:"id" >nul
if %errorlevel% neq 0 (
    echo ❌ Stations API returned empty or error
) else (
    echo ✅ Stations API has data
)
echo.
echo.

echo [3/4] Testing Trains API...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:8888/api/trains
curl -s http://localhost:8888/api/trains | findstr /C:"id" >nul
if %errorlevel% neq 0 (
    echo ❌ Trains API returned empty or error
) else (
    echo ✅ Trains API has data
)
echo.
echo.

echo [4/4] Testing Schedules API...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:8888/api/schedules
curl -s http://localhost:8888/api/schedules | findstr /C:"id" >nul
if %errorlevel% neq 0 (
    echo ❌ Schedules API returned empty or error
) else (
    echo ✅ Schedules API has data
)
echo.
echo.

echo ========================================
echo Test Summary
echo ========================================
echo.
echo If all tests passed (✅), frontend-client should work!
echo If any test failed (❌), check:
echo   1. Is the service running?
echo   2. Does the database have data?
echo   3. Check service logs for errors
echo.
echo Next step: Open http://localhost:5174 and test
echo.
pause
