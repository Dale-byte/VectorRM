@echo off
cd /d "%~dp0"

echo Killing existing processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo Starting backend...
start "" /b cmd /c "cd /d "%~dp0backend" && npm run dev >nul 2>&1"

timeout /t 3 /nobreak >nul

echo Starting frontend...
start "" /b cmd /c "cd /d "%~dp0frontend" && npx vite --port 5173 >nul 2>&1"

timeout /t 5 /nobreak >nul

start http://localhost:5173

echo.
echo VectorRM is running...
echo Login: test@test.com / Test!
echo.

exit
