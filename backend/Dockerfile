FROM python:3.11-slim

WORKDIR /workspace

# System dependencies required by image/PDF processing libraries
RUN apt-get update && apt-get install -y \
    libxcb1 \
    libglib2.0-0 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*
    
# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy dependency files first for Docker layer caching
COPY pyproject.toml uv.lock ./

# Install dependencies into the container environment
RUN uv sync --frozen --no-dev

# Copy application source
COPY app ./app
# COPY alembic.ini .
# COPY migrations ./migrations

# Use the virtual environment created by uv
ENV PATH="/workspace/.venv/bin:$PATH"
ENV PYTHONPATH=/workspace