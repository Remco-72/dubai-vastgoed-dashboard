@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Installeer eerst Node.js 24 LTS vanaf https://nodejs.org en open dit bestand opnieuw.
  pause
  exit /b 1
)
if not exist node_modules\next\package.json (
  call npm ci --no-audit --no-fund
  if errorlevel 1 (
    echo Installeren mislukt. Controleer je internetverbinding.
    pause
    exit /b 1
  )
)
call npm run preview
pause
