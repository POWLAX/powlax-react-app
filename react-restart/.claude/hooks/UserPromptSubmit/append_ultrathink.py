#!/usr/bin/env python3
"""
POWLAX Ultra Think Hook - Appends ultra think instruction when prompt ends with -u
Integrates 7 Tips methodology: Use maximum reasoning effort for complex problems
"""

import json
import sys

def main() -> None:
    try:
        # Read JSON payload from stdin
        input_data = json.load(sys.stdin)
        prompt: str = input_data.get("prompt", "")
        
        # Only append if the prompt ends with the -u flag
        if prompt.rstrip().endswith("-u"):
            print(
                "\nUse the maximum amount of ultra think. Take all the time you need. "
                "It's much better if you do too much research and thinking than not enough."
            )
    except Exception as e:  # pragma: no cover - simple hook, log and exit
        print(f"append_ultrathink hook error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()