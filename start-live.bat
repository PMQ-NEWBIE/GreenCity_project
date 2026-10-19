@echo off
title Green City - Local Live Server
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [LOI] Chua cai Node.js. Tai tai https://nodejs.org roi chay lai file nay.
  pause
  exit /b 1
)

if not exist "node_modules\next\package.json" (
  echo Dang cai thu vien lan dau, vui long doi...
  call npm install
  if errorlevel 1 (
    echo [LOI] Cai thu vien that bai.
    pause
    exit /b 1
  )
)

echo Dang khoi dong Green City Dev Server tai http://localhost:3000 ...
rem Doi server san sang roi moi mo trinh duyet
start "" /b powershell -NoProfile -Command "while ($true) { try { (New-Object Net.Sockets.TcpClient('localhost', 3000)).Close(); break } catch { Start-Sleep -Milliseconds 500 } }; Start-Process 'http://localhost:3000'"

call npm run dev
pause
