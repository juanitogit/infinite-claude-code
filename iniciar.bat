@echo off
chcp 65001 >nul
title Infinite Claude Code - Iniciar Demonio
cls
node "%~dp0bin\infinite-claude.js" start
echo.
pause
