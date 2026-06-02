@echo off
title Учусь.РФ - Сервер
echo ========================================
echo   Запуск портала "Учусь.РФ"
echo ========================================
echo.
cd /d "%~dp0"
echo [1/2] Устанавливаю зависимости...
call npm install --silent
echo [2/2] Запускаю сервер...
echo.
echo Сайт будет доступен по адресу: http://localhost:3000
echo Нажмите Ctrl+C в этом окне, чтобы остановить сервер
echo.
node server.js
pause