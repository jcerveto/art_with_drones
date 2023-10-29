FROM python:3.9-alpine

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy source code
COPY .env app/.env
COPY src app/src


CMD ["python", "app/src/main.py"]

