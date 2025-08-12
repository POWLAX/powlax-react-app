# Page snapshot

```yaml
- alert
- dialog "Server Error":
  - navigation:
    - button "previous" [disabled]:
      - img "previous"
    - button "next" [disabled]:
      - img "next"
    - text: 1 of 1 error Next.js (14.2.5) is outdated
    - link "(learn more)":
      - /url: https://nextjs.org/docs/messages/version-staleness
  - heading "Server Error" [level=1]
  - paragraph: "Error: Cannot find module './vendor-chunks/date-fns.js' Require stack: - /Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app/.next/server/webpack-runtime.js - /Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app/.next/server/app/(authenticated)/teams/[teamId]/practiceplan/page.js - /Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app/node_modules/next/dist/server/require.js - /Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app/node_modules/next/dist/server/load-components.js - /Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app/node_modules/next/dist/build/utils.js - /Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app/node_modules/next/dist/server/dev/static-paths-worker.js - /Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app/node_modules/next/dist/compiled/jest-worker/processChild.js"
  - text: This error happened while generating the page. Any console logs will be displayed in the terminal window.
  - heading "Call Stack" [level=2]
  - group:
    - img
    - img
    - text: Next.js
  - heading "TracingChannel.traceSync" [level=3]
  - text: node:diagnostics_channel (322:14)
  - group:
    - img
    - img
    - text: Next.js
```