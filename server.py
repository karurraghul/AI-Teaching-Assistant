# server.py
import os
import uvicorn
from api.main import app

if __name__ == "__main__":
    port = int(os.getenv("PORT", 10000))
    print(f"Starting server on 0.0.0.0:{port}")
    uvicorn.run(
        app,  # Pass the app instance directly
        host="0.0.0.0",
        port=port,
        log_level="info"
    )