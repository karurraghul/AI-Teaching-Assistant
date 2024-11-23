#!/bin/bash
# run.sh

# Use PORT from environment variable or default to 10000
export PORT="${PORT:-10000}"

echo "Starting server on 0.0.0.0:$PORT"

# Use python to run the server directly
exec python server.py