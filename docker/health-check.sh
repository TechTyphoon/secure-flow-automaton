#!/bin/sh
# Health check script for SecureFlow Automaton

# Check if nginx is running
if ! pgrep nginx > /dev/null; then
    echo "Nginx is not running"
    exit 1
fi

# Check if the application is responding
if ! curl -f http://localhost:8080 > /dev/null 2>&1; then
    echo "Application is not responding"
    exit 1
fi

# Check if static files are being served
if ! curl -f http://localhost:8080/favicon.ico > /dev/null 2>&1; then
    echo "Static files are not being served"
    exit 1
fi

echo "Health check passed"
exit 0
