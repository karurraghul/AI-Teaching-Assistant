#!/bin/bash
# run.sh
PORT=10000
uvicorn api.main:app --host 0.0.0.0 --port $PORT --reload