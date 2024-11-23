#!/bin/bash
# run.sh

# Use PORT from environment variable or default to 10000
export PORT="${PORT:-10000}"

echo "Starting server on 0.0.0.0:$PORT"

# Force bind to 0.0.0.0 and use environment PORT
exec uvicorn api.main:app --host 0.0.0.0 --port $PORT --reload