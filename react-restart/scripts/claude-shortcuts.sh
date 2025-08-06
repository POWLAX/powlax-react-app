#!/bin/bash

# Claude Agent Alert Shortcuts
# Source this file: source ./scripts/claude-shortcuts.sh

# Quick alert functions for Claude agents
alert_approval() {
    local agent="${1:-Claude}"
    local message="${2:-Needs approval to proceed}"
    ./scripts/claude-alert.sh "approval" "$agent" "$message"
}

alert_complete() {
    local agent="${1:-Claude}"
    local message="${2:-Task completed successfully}"
    ./scripts/claude-alert.sh "complete" "$agent" "$message"
}

alert_error() {
    local agent="${1:-Claude}"
    local message="${2:-Error encountered, need assistance}"
    ./scripts/claude-alert.sh "error" "$agent" "$message"
}

alert_info() {
    local agent="${1:-Claude}"
    local message="${2:-Status update}"
    ./scripts/claude-alert.sh "info" "$agent" "$message"
}

# Agent-specific shortcuts
admin_alert() {
    alert_approval "Admin Content Manager" "$1"
}

practice_alert() {
    alert_approval "Practice Planner Enhancer" "$1"
}

academy_alert() {
    alert_approval "Skills Academy Builder" "$1"
}

# Simple ding command
ding() {
    printf "\a"
    afplay /System/Library/Sounds/Glass.aiff 2>/dev/null &
}

# Urgent attention getter
urgent() {
    for i in {1..5}; do
        printf "\a"
        sleep 0.2
    done
    echo -e "\033[1;31m🚨🚨🚨 URGENT: Claude needs immediate attention! 🚨🚨🚨\033[0m"
}

echo "🔔 Claude alert shortcuts loaded!"
echo "Available commands:"
echo "  alert_approval 'Agent Name' 'Message'"  
echo "  alert_complete 'Agent Name' 'Message'"
echo "  alert_error 'Agent Name' 'Message'"
echo "  admin_alert 'Message'"
echo "  practice_alert 'Message'" 
echo "  academy_alert 'Message'"
echo "  ding  # Quick terminal bell"
echo "  urgent  # Multiple dings + visual alert"