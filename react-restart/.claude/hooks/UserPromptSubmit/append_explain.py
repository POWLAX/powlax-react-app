#!/usr/bin/env python3
"""
POWLAX Log Explanation Hook - Appends log analysis instruction when prompt ends with -e
Integrates 7 Tips methodology: Systematic error analysis without ego
"""

import json
import sys

def main() -> None:
    try:
        data = json.load(sys.stdin)
        prompt = data.get("prompt", "")
        if prompt.rstrip().endswith("-e"):
            print(
                "\nAbove are the relevant logs - your job is to:\n"
                " think harder about what these logs say\n"
                " and give me a simpler & short explanation\n"
                " DO NOT JUMP TO CONCLUSIONS!! DO NOT MAKE ASSUMPTIONS! QUIET YOUR EGO!\n"
                " AND ASSUME YOU KNOW NOTHING.\n"
                "then, after you've explained the logs to me, suggest what the next step might be & why\n"
                "answer in short"
            )
        sys.exit(0)
    except Exception as e:  # pragma: no cover
        print(f"append_explain error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()