#!/bin/bash

# 🔔 POWLAX Task Completion Notification System
# Alerts user when Master Controller or sub-agents complete tasks

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Arguments
TASK_TYPE="$1"      # Type of completion (SUCCESS/PARTIAL/FAILED)
AGENT_NAME="$2"     # Which agent completed
TASK_DESC="$3"      # Brief task description
QUALITY_SCORE="$4"  # Quality score (0-100)
CONTRACT_ID="$5"    # Contract ID

# Function to play terminal bell
play_bell() {
    # Terminal bell character
    echo -e "\a"
    # Multiple bells for urgency
    if [ "$TASK_TYPE" = "FAILED" ]; then
        sleep 0.5 && echo -e "\a"
        sleep 0.5 && echo -e "\a"
    fi
}

# Function to show desktop notification (macOS)
show_desktop_notification_mac() {
    osascript -e "display notification \"$TASK_DESC\" with title \"POWLAX: $TASK_TYPE\" subtitle \"Agent: $AGENT_NAME\" sound name \"Glass\""
}

# Function to show desktop notification (Linux)
show_desktop_notification_linux() {
    notify-send "POWLAX: $TASK_TYPE" "$AGENT_NAME completed: $TASK_DESC" -u critical -i terminal
}

# Function to display large banner
display_banner() {
    clear
    echo ""
    echo ""
    
    if [ "$TASK_TYPE" = "SUCCESS" ]; then
        echo -e "${GREEN}"
        echo "════════════════════════════════════════════════════════════════════"
        echo "   ✅  TASK COMPLETED SUCCESSFULLY  ✅"
        echo "════════════════════════════════════════════════════════════════════"
    elif [ "$TASK_TYPE" = "PARTIAL" ]; then
        echo -e "${YELLOW}"
        echo "════════════════════════════════════════════════════════════════════"
        echo "   ⚠️   TASK PARTIALLY COMPLETED  ⚠️"
        echo "════════════════════════════════════════════════════════════════════"
    else
        echo -e "${RED}"
        echo "════════════════════════════════════════════════════════════════════"
        echo "   ❌  TASK FAILED - ATTENTION NEEDED  ❌"
        echo "════════════════════════════════════════════════════════════════════"
    fi
    
    echo -e "${NC}"
    echo -e "${CYAN}Agent:${NC} $AGENT_NAME"
    echo -e "${CYAN}Task:${NC} $TASK_DESC"
    echo -e "${CYAN}Quality Score:${NC} $QUALITY_SCORE/100"
    echo -e "${CYAN}Contract:${NC} $CONTRACT_ID"
    echo -e "${CYAN}Time:${NC} $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    if [ "$TASK_TYPE" = "SUCCESS" ]; then
        echo -e "${GREEN}════════════════════════════════════════════════════════════════════${NC}"
    elif [ "$TASK_TYPE" = "PARTIAL" ]; then
        echo -e "${YELLOW}════════════════════════════════════════════════════════════════════${NC}"
    else
        echo -e "${RED}════════════════════════════════════════════════════════════════════${NC}"
    fi
    
    echo ""
    echo ""
}

# Function to update status file
update_status_file() {
    STATUS_FILE="/tmp/powlax-status.txt"
    echo "[$TASK_TYPE] $(date '+%Y-%m-%d %H:%M:%S')" > "$STATUS_FILE"
    echo "Agent: $AGENT_NAME" >> "$STATUS_FILE"
    echo "Task: $TASK_DESC" >> "$STATUS_FILE"
    echo "Quality: $QUALITY_SCORE/100" >> "$STATUS_FILE"
    echo "Contract: $CONTRACT_ID" >> "$STATUS_FILE"
}

# Function to speak notification (macOS)
speak_notification_mac() {
    if [ "$TASK_TYPE" = "SUCCESS" ]; then
        say "Task completed successfully. Quality score: $QUALITY_SCORE"
    elif [ "$TASK_TYPE" = "PARTIAL" ]; then
        say "Task partially completed. Review needed. Quality score: $QUALITY_SCORE"
    else
        say "Task failed. Your attention is required immediately."
    fi
}

# Main notification flow
main() {
    # Play bell sound
    play_bell
    
    # Display banner
    display_banner
    
    # Update status file
    update_status_file
    
    # Detect OS and show appropriate notification
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        show_desktop_notification_mac
        speak_notification_mac
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        show_desktop_notification_linux
    fi
    
    # Log to audit file
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $TASK_TYPE | $AGENT_NAME | $TASK_DESC | Score: $QUALITY_SCORE | Contract: $CONTRACT_ID" >> /tmp/powlax-audit.log
}

# Execute main function
main

# Return appropriate exit code
if [ "$TASK_TYPE" = "SUCCESS" ]; then
    exit 0
elif [ "$TASK_TYPE" = "PARTIAL" ]; then
    exit 1
else
    exit 2
fi