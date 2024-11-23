# server.py
import os
import uvicorn
import socket
from api.main import app

if __name__ == "__main__":
    port = int(os.getenv("PORT", 10000))
    print(f"Starting server on 0.0.0.0:{port}")
    
    # Force IPv4
    socket.setdefault("IPv4", True)
    
    config = uvicorn.Config(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info",
        loop="asyncio",
        ws="websockets",
        proxy_headers=True,
        forwarded_allow_ips="*"
    )
    
    server = uvicorn.Server(config)
    server.run()