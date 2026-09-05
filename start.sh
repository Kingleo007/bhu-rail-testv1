#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "      🇮🇳 Starting Bhu-Rail: Land DPI Prototype           "
echo "=========================================================="

# 1. Start Backend in background
echo "-> Launching FastAPI Land DPI Rail on port 8000..."
./backend/.venv/bin/uvicorn app.main:app --app-dir backend --reload --port 8000 &
BACKEND_PID=$!

# Trap signals to cleanly kill backend on exit
trap "kill $BACKEND_PID 2>/dev/null || true" EXIT

# 2. Start Frontend
echo "-> Launching Next.js DPI Console on port 3000..."
npm --prefix frontend run dev
