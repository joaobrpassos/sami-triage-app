# Use Python 3.12
FROM python:3.12-slim

WORKDIR /app

# Copia requirements e instala
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código
COPY . .

EXPOSE 5000

CMD ["python", "app.py"]

