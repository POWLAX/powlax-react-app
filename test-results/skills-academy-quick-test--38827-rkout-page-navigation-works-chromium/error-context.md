# Page snapshot

```yaml
- dialog "Unhandled Runtime Error":
  - navigation:
    - button "previous" [disabled]:
      - img "previous"
    - button "next" [disabled]:
      - img "next"
    - text: 1 of 1 error Next.js (14.2.5) is outdated
    - link "(learn more)":
      - /url: https://nextjs.org/docs/messages/version-staleness
  - button "Close"
  - heading "Unhandled Runtime Error" [level=1]
  - paragraph: "ChunkLoadError: Loading chunk app/(authenticated)/skills-academy/page failed. (error: http://localhost:3000/_next/static/chunks/app/(authenticated)/skills-academy/page.js)"
  - heading "Call Stack" [level=2]
  - group:
    - img
    - img
    - text: Next.js
  - heading "<unknown>" [level=3]
  - text: file:///Users/patrickchapla/Development/POWLAX%20React%20App/React%20Code/powlax-react-app/.next/static/chunks/webpack.js (155:40)
  - heading "Array.reduce" [level=3]
  - text: <anonymous>
  - group:
    - img
    - img
    - text: Next.js
  - heading "fn.e" [level=3]
  - text: file:///Users/patrickchapla/Development/POWLAX%20React%20App/React%20Code/powlax-react-app/.next/static/chunks/webpack.js (391:50)
  - group:
    - img
    - img
    - text: React
```