#!/bin/bash

# POWLAX Agent Alert System
# Usage: ./scripts/agent-alert.sh "Agent Name" "Message" "type"

AGENT_NAME="$1"
MESSAGE="$2"
TYPE="${3:-info}"

# Color codes for different agents
case "$AGENT_NAME" in
  "Admin"*)
    COLOR="🔧"
    SOUND="Glass"
    ;;
  "Practice"*)
    COLOR="📋"
    SOUND="Ping"
    ;;
  "Academy"*)
    COLOR="🎓"
    SOUND="Pop"
    ;;
  *)
    COLOR="🤖"
    SOUND="Default"
    ;;
esac

# Play sound
afplay /System/Library/Sounds/$SOUND.aiff &

# Show notification
osascript -e "display notification \"$MESSAGE\" with title \"$COLOR $AGENT_NAME\" sound name \"$SOUND\""

# Terminal alert with colors
case "$TYPE" in
  "complete")
    echo -e "\033[32m✅ $AGENT_NAME: $MESSAGE\033[0m"
    ;;
  "error")
    echo -e "\033[31m❌ $AGENT_NAME: $MESSAGE\033[0m"
    ;;
  "approval")
    echo -e "\033[33m⚠️ $AGENT_NAME: $MESSAGE\033[0m"
    ;;
  *)
    echo -e "\033[34m🔔 $AGENT_NAME: $MESSAGE\033[0m"
    ;;
esac