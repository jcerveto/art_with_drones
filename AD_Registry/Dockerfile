FROM python:3.9-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy source code
COPY main.py app/main.py
COPY src/ app/src/

EXPOSE 6000
EXPOSE 6001

CMD ["python", "app/main.py"]
