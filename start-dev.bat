@echo off
echo ========================================================
echo   Starting Enquiry Website MERN Stack (Backend + Frontend)
echo ========================================================
echo.
start "Enquiry Website Backend (Port 5001)" cmd /k "cd Backend && npm start"
timeout /t 2 /nobreak >nul
start "Enquiry Website Frontend (Port 5173)" cmd /k "cd Frontend && npm run dev"
echo Both Backend and Frontend are starting in separate windows.
echo Frontend: http://localhost:5173
echo Admin Login: http://localhost:5173/admin/login
echo Backend API: http://localhost:5001/api
echo.

