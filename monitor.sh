
#!/bin/bash

# Continuous monitoring script
while true; do
    echo "🔍 $(date): Checking project status..."
    
    # Pull latest changes
    git pull origin main
    
    # Run tests
    if npm test; then
        echo "✅ Tests passing"
    else
        echo "❌ Tests failing - investigation needed"
    fi
    
    # Wait 5 minutes before next check
    sleep 300
done
