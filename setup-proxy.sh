#!/bin/bash

echo "Setting up proxy for blizzardberry.com..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (use sudo)"
    exit 1
fi

# Add to hosts file
if ! grep -q "blizzardberry.com" /etc/hosts; then
    echo "127.0.0.1 blizzardberry.com" >> /etc/hosts
    echo "Added blizzardberry.com to /etc/hosts"
else
    echo "blizzardberry.com already in /etc/hosts"
fi

# Install Caddy if not present
if ! command -v caddy &> /dev/null; then
    echo "Installing Caddy..."
    brew install caddy
fi

echo "Setup complete!"
echo "Now run: sudo caddy run --config Caddyfile"
echo "And in another terminal: pnpm dev"
