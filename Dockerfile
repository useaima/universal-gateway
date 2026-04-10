# Stage 1: Build & Dependencies
FROM mcr.microsoft.com/playwright/python:v1.40.0-jammy as builder

WORKDIR /app
COPY pyproject.toml .
RUN pip install --no-cache-dir .

# Stage 2: Final Runtime
FROM mcr.microsoft.com/playwright/python:v1.40.0-jammy

# Install GUI support for 'Real Commerce' visuals
RUN apt-get update && apt-get install -y \
    xvfb \
    x11vnc \
    novnc \
    websockify \
    net-tools \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY src/ /app/src/
COPY .env /app/.env

# Pre-fetch Camoufox browser binaries
RUN python -m camoufox fetch

# Setup VNC Environment
ENV DISPLAY=:99
ENV SCREEN_WIDTH=1280
ENV SCREEN_HEIGHT=1024
ENV SCREEN_DEPTH=24

# Expose VNC (5900) and noVNC (6080)
EXPOSE 5900 6080 8080

CMD ["sh", "-c", "Xvfb :99 -screen 0 ${SCREEN_WIDTH}x${SCREEN_HEIGHT}x${SCREEN_DEPTH} & x11vnc -display :99 -nopw -forever & /usr/share/novnc/utils/launch.sh --vnc localhost:5900 --listen 6080 & python src/gateway/server.py"]
