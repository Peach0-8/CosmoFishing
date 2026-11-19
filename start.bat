@echo off
cd /d "%~dp0"
echo Starting CosmoFishing local server on http://127.0.0.1:8090 ...
echo Press Ctrl+C to stop the server.
start "" "http://127.0.0.1:8090"
python -m http.server 8090 --bind 127.0.0.1
