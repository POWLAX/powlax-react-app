#!/bin/bash

# Simple POWLAX Notification
# Uses voice announcements which work reliably

STATUS="$1"
MESSAGE="$2"

# Large visual banner (always shows)
echo ""
echo "=============================================="
echo "🔔 🔔 🔔  POWLAX NOTIFICATION  🔔 🔔 🔔"
echo "=============================================="
echo "STATUS: $STATUS"
echo "MESSAGE: $MESSAGE"
echo "TIME: $(date '+%H:%M:%S')"
echo "=============================================="
echo ""

# macOS voice announcement (THIS WORKS!)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # Play system sound
    afplay /System/Library/Sounds/Glass.aiff 2>/dev/null &
    
    # Voice announcement based on status
    if [ "$STATUS" = "SUCCESS" ]; then
        say "Task completed successfully"
    elif [ "$STATUS" = "FAILED" ]; then
        say "Task failed. Your attention needed"
    elif [ "$STATUS" = "READY" ]; then
        say "Ready for your input"
    elif [ "$STATUS" = "ITERATION" ]; then
        say "Iteration complete. Checking quality"
    else
        say "POWLAX notification"
    fi
fi

# Linux notifications
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    notify-send "POWLAX: $STATUS" "$MESSAGE" -u critical
fi