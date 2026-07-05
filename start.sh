#!/bin/bash
# start.sh - Easy start script for Cnidaria Frames

echo "Starting Cnidaria Frames server..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3 to run this server."
    exit 1
fi

# Start the server
cd "$(dirname "$0")"
echo "Server starting on http://localhost:9090"
echo "Press Ctrl+C to stop the server"
python3 server.py