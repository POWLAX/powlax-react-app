#!/bin/bash

# Claude Terminal Alert System
# Usage: ./scripts/claude-alert.sh "type" "agent" "message"
# Types: approval, complete, error, info

TYPE="${1:-info}"
AGENT="${2:-Claude}"
MESSAGE="${3:-Needs attention}"

# Sound alerts for different types
case "$TYPE" in
    "approval")
        # Multiple dings for approval requests
        for i in {1..3}; do
            printf "\a"  # Terminal bell
            sleep 0.3
        done
        afplay /System/Library/Sounds/Glass.aiff 2>/dev/null &
        EMOJI="🚨"
        COLOR="\033[1;33m"  # Bright yellow
        ;;
    "complete")
        afplay /System/Library/Sounds/Ping.aiff 2>/dev/null &
        EMOJI="✅"
        COLOR="\033[1;32m"  # Bright green
        ;;
    "error")
        for i in {1..2}; do
            printf "\a"
            sleep 0.2
        done
        afplay /System/Library/Sounds/Basso.aiff 2>/dev/null &
        EMOJI="❌"
        COLOR="\033[1;31m"  # Bright red
        ;;
    *)
        printf "\a"
        afplay /System/Library/Sounds/Pop.aiff 2>/dev/null &
        EMOJI="🔔"
        COLOR="\033[1;34m"  # Bright blue
        ;;
esac

# Agent color coding
case "$AGENT" in
    *"Admin"*)
        AGENT_COLOR="\033[1;46m"  # Cyan background
        AGENT_EMOJI="🔧"
        ;;
    *"Practice"*)
        AGENT_COLOR="\033[1;42m"  # Green background
        AGENT_EMOJI="📋"
        ;;
    *"Academy"*)
        AGENT_COLOR="\033[1;45m"  # Magenta background
        AGENT_EMOJI="🎓"
        ;;
    *)
        AGENT_COLOR="\033[1;44m"  # Blue background
        AGENT_EMOJI="🤖"
        ;;
esac

RESET="\033[0m"

# Terminal visual alert
echo
echo -e "${COLOR}════════════════════════════════════════════════════════════════${RESET}"
echo -e "${AGENT_COLOR} ${AGENT_EMOJI} ${AGENT} ${RESET} ${COLOR}${EMOJI} ${TYPE^^} ${RESET}"
echo -e "${COLOR}════════════════════════════════════════════════════════════════${RESET}"
echo -e "${COLOR}${MESSAGE}${RESET}"
echo -e "${COLOR}════════════════════════════════════════════════════════════════${RESET}"
echo

# macOS desktop notification
osascript -e "display notification \"$MESSAGE\" with title \"$AGENT_EMOJI $AGENT\" subtitle \"$EMOJI $TYPE\" sound name \"Glass\"" 2>/dev/null &

# Log to file for tracking
echo "$(date): $AGENT - $TYPE - $MESSAGE" >> ./logs/claude-alerts.log

# If approval type, wait for user response
if [ "$TYPE" = "approval" ]; then
    echo -e "${COLOR}Press ENTER to acknowledge this approval request...${RESET}"
    read -r
fi