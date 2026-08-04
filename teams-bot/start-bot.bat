@echo off
if "%MICROSOFT_APP_ID%"=="" echo Set MICROSOFT_APP_ID before starting the bot & exit /b 1
if "%MICROSOFT_APP_PASSWORD%"=="" echo Set MICROSOFT_APP_PASSWORD before starting the bot & exit /b 1
if "%MICROSOFT_APP_TENANT_ID%"=="" echo Set MICROSOFT_APP_TENANT_ID before starting the bot & exit /b 1
if "%OPENCODE_URL%"=="" set OPENCODE_URL=http://127.0.0.1:4096
cd /d %~dp0
node bot.js
