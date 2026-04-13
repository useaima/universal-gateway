#!/bin/bash
# --- Universal Transaction Gateway (UTG) ---
# One-Click DigitalOcean Deployer
# Created for Alvins' "M-Pesa for Agents" vision.

echo "🚀 Starting DigitalOcean Deployment..."

# 1. Update and Install Docker
echo "[1/4] Installing Docker & Docker-Compose..."
sudo apt-get update
sudo apt-get install -y docker.io docker-compose

# 2. Clone/Update the Gateway
echo "[2/4] Pulling latest Universal Gateway code..."
# In a real scenario, this would be: git clone https://github.com/Alvins-mukabane/universal-gateway
# For this demo, we assume the code is already in the current dir.

# 3. Environment Check
if [ ! -f .env ]; then
    echo "[!!!] WARNING: .env file missing. Creating template..."
    cp .env.template .env
    echo "Please edit the .env file with your API keys and run this script again."
    exit 1
fi

# 4. Start Production Stack
echo "[3/4] Starting the GaaS Stack..."
sudo docker-compose -f docker-compose.prod.yml up -d

echo "[4/4] Verifying Service..."
sudo docker ps | grep utg-gateway

echo "\n--- DEPLOYMENT SUCCESS ---"
echo "Your Universal Gateway is now running as a background service."
echo "Access logs: docker-compose logs -f gateway"
echo "Protocol Discovery: http://<DROPLET_IP>/ .well-known/agent.json"
