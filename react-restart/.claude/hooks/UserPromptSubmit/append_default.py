#!/usr/bin/env python3
"""
POWLAX Default Quality Hook - Appends concise digest instruction when prompt ends with -d
Integrates 7 Tips methodology: Think harder, keep responses focused and actionable
"""

import json
import sys

def main() -> None:
    try:
        data = json.load(sys.stdin)
        prompt = data.get("prompt", "")
        if prompt.rstrip().endswith("-d"):
            print("\nthink harder. answer in short. keep it simple.")
        sys.exit(0)
    except Exception as e:  # pragma: no cover - simple hook, log and exit
        print(f"append_digest error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()