#!/usr/bin/env python3
"""
POWLAX Commit Reminder Hook - Reminds to commit every 15 minutes
Integrates 7 Tips methodology: Commit often with AI-generated messages
"""

import json
import sys
import subprocess
from datetime import datetime

def main() -> None:
    try:
        # Check if we're in a git repository
        result = subprocess.run(['git', 'rev-parse', '--git-dir'], 
                              capture_output=True, text=True)
        if result.returncode != 0:
            return
        
        # Check if 15 minutes have passed since last commit
        result = subprocess.run(['git', 'log', '--oneline', '-1', '--format=%ct'], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            last_commit_time = int(result.stdout.strip())
            current_time = int(datetime.now().timestamp())
            minutes_elapsed = (current_time - last_commit_time) // 60
            
            if minutes_elapsed >= 15:
                print(f"\n⏰ COMMIT REMINDER: {minutes_elapsed} minutes since last commit")
                print("💡 Consider committing your changes:")
                print("   git add . && git commit -m \"AI: [let Claude generate message]\"")
                
    except Exception as e:
        # Don't fail the main operation if reminder fails
        pass

if __name__ == "__main__":
    main()