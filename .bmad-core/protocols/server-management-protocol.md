# 🖥️ Server Management Protocol

## **CRITICAL RULE: NEVER START SERVERS WITHOUT CHECKING**

All POWLAX agents MUST follow this protocol before starting any development server.

## **The Problem This Solves**

**User Workflow Issue:**
1. User starts development server on port 3000
2. Agent gets activated and automatically runs `npm run dev`
3. Next.js detects port conflict → switches to port 3001, 3002, etc.
4. User debugs issues on port 3000 while agent works on port 3002
5. **Result: Confusion, wasted time, debugging wrong server**

## **MANDATORY SERVER CHECK SEQUENCE**

### **STEP 1: Check for Running Servers**
```bash
# Check what's running on common ports
lsof -i :3000 :3001 :3002 :3003
```

### **STEP 2: Identify Active Development Server**
```bash
# Check for Next.js processes specifically
ps aux | grep -E "(next|npm.*dev)" | grep -v grep
```

### **STEP 3: Test Server Connectivity**
```bash
# Test if server is responding
curl -s http://localhost:3000/ | head -5
```

### **STEP 4: Report Status to User**
**If server found:** 
- ✅ "I found your development server running on port [PORT]"
- ✅ "I'll use your existing server instead of starting a new one"

**If no server found:**
- ❓ "No development server detected. Should I start one for you?"
- ⚠️ **WAIT for user confirmation before starting**

## **AGENT IMPLEMENTATION REQUIREMENTS**

### **Master Controller**
- **ALWAYS** check server status in activation sequence
- **NEVER** start servers without explicit user permission
- **DOCUMENT** server status in session logs

### **All Sub-Agents (Frontend, Backend, Practice Specialist, etc.)**
- **MANDATORY** server check before any development work
- **ASK PERMISSION** before starting new servers
- **REPORT** which port they're using

### **Development Agent**
- **CHECK FIRST** - never assume server needs to be started
- **USE EXISTING** server when available
- **COORDINATE** with user on port usage

## **Standard Server Check Commands**

### **Quick Status Check**
```bash
# One-liner to check common development ports
lsof -i :3000 :3001 :3002 | grep -v "^COMMAND" | wc -l && echo "servers detected"
```

### **Detailed Server Report**
```bash
# Show what's running where
echo "=== Active Development Servers ==="
lsof -i :3000 :3001 :3002 :3003 2>/dev/null | grep -E "(node|npm)"
echo "=== Next.js Processes ==="
ps aux | grep -E "(next|npm.*dev)" | grep -v grep
```

### **Test Server Response**
```bash
# Check if server is responding
for port in 3000 3001 3002; do
  if curl -s http://localhost:$port/ >/dev/null 2>&1; then
    echo "✅ Server responding on port $port"
  else
    echo "❌ No response on port $port"
  fi
done
```

## **Communication Templates**

### **When Server Found**
```
✅ **Development server detected on port [PORT]**

I found your existing server running. I'll use this instead of starting a new one.
- Server: http://localhost:[PORT]
- Status: Responding correctly
- Next steps: [Continue with development work]
```

### **When No Server Found**
```
🔍 **No development server detected**

I don't see any Next.js development servers running. Would you like me to:
1. Start a new development server (`npm run dev`)
2. Wait for you to start one manually
3. Continue without a server (for non-runtime tasks)

Please let me know how you'd like to proceed.
```

### **When Multiple Servers Found**
```
⚠️ **Multiple servers detected**

I found development servers on multiple ports:
- Port 3000: [status]
- Port 3001: [status]
- Port 3002: [status]

Which server should I use for development work? This will help avoid conflicts.
```

## **Emergency Server Cleanup**

### **Kill All Development Servers**
```bash
# Find and kill all Next.js development servers
pkill -f "next dev"
pkill -f "npm.*dev"
```

### **Clean Restart Protocol**
```bash
# Clean restart sequence
1. pkill -f "next dev"
2. rm -rf .next
3. npm run dev
4. Wait for "Ready in [X]ms" message
5. Test with curl http://localhost:3000/
```

## **Integration with Session Management**

### **Master Controller Session Log**
```markdown
## Server Status Check
- **Ports Checked:** 3000, 3001, 3002
- **Active Servers:** [list or "none detected"]
- **Selected Server:** http://localhost:[PORT]
- **Action Taken:** [used existing/started new/waited for user]
```

## **Success Criteria**

✅ **Zero duplicate servers** started by agents  
✅ **Clear communication** about server status  
✅ **User control** over server management  
✅ **Consistent port usage** across development session  
✅ **No more debugging wrong servers**  

## **🚨 CRITICAL: NEVER CLOSE WORKING SERVERS**

### **ABSOLUTE RULE: PRESERVE RUNNING SERVERS**

**When you start or find a working development server, NEVER close it when finishing your task!**

#### **✅ DO:**
- Leave servers running for continued development
- Mention server status in completion messages
- Document server URL for user reference
- Let user manage server lifecycle

#### **❌ NEVER DO:**
- Use `Ctrl+C`, `kill`, or stop commands on working servers
- Run commands that would terminate active development servers
- Close servers "to clean up" when finishing tasks
- Assume the user wants the server stopped

### **Task Completion Communication**

**When finishing work with server running:**
```
✅ **Task completed successfully**

The development server is still running on http://localhost:3000 for your continued use.
- Status: Active and responding
- Next: You can continue development or stop the server when ready
```

**When server was already running:**
```
✅ **Work completed using your existing server**

Your development server on http://localhost:3000 remains active.
- No new servers were started
- Server status: Stable and responding
```

---

**Remember: When in doubt, ASK THE USER. Never assume you should start OR stop a server.**
