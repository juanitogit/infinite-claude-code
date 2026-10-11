@echo off
chcp 65001 >nul
title Infinite Claude Code - Instalador
cls
echo ==============================================================================
echo   Iniciando instalador de Infinite Claude Code...
echo ==============================================================================
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1"
if %errorlevel% neq 0 (
    echo.
    echo [!] Hubo un problema al ejecutar el instalador.
    pause
)
