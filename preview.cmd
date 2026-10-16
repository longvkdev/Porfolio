@echo off
set "PORTFOLIO_PYTHON=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if exist "%PORTFOLIO_PYTHON%" (
  "%PORTFOLIO_PYTHON%" "%~dp0preview.py"
) else (
  py -3 "%~dp0preview.py"
)
