@echo off
cd /d "%~dp0"
rem Lanceur LOCAL (non versionné) : la cle Gemini reste hors du depot public.
set GOOGLE_API_KEY=AQ.Ab8RN6KX5MHDfDVTNqlCD1ZCQa5VENq_sr0vHUB0QxTira6eqg
set GEMINI_MODEL=gemini-3.5-flash
set PORT=3101
set HOST=127.0.0.1
set SEED_DEMO=1
echo ERP Advanced Security Systems - http://127.0.0.1:3101
node server.js
