@echo off
echo ========================================
echo Testing CORS Configuration
echo ========================================
echo.

echo Testing Gateway availability...
curl -s http://localhost:8888/actuator/health
echo.
echo.

echo Testing CORS for port 5174...
curl -X OPTIONS http://localhost:8888/api/stations ^
  -H "Origin: http://localhost:5174" ^
  -H "Access-Control-Request-Method: GET" ^
  -v
echo.
echo.

echo Testing actual GET request...
curl http://localhost:8888/api/stations ^
  -H "Origin: http://localhost:5174" ^
  -v
echo.
echo.

echo ========================================
echo Test Complete
echo ========================================
echo.
echo Check the output above for:
echo 1. Access-Control-Allow-Origin: http://localhost:5174
echo 2. Access-Control-Allow-Credentials: true
echo 3. HTTP 200 OK status
echo.
pause
