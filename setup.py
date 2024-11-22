# setup.py
from setuptools import setup, find_packages

setup(
    name="ai_teaching_assistant",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "python-multipart",
        "python-dotenv",
        "pydantic-settings"
    ],
)