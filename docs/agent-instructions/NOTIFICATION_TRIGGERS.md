# 🔔 **Notification Trigger Points**
## **When You Will Hear Notifications**

*Created: 2025-01-16*  
*Status: ACTIVE*

---

## 🎯 **CRITICAL NOTIFICATION POINTS**

### **1. CONTRACT APPROVAL NEEDED** 🔔
```bash
scripts/simple-notify.sh "READY" "Contract needs your approval"
```
**You'll hear:** "Ready for your input"
**When:** New contract created, waiting for YES/NO

### **2. TASK COMPLETED SUCCESSFULLY** ✅
```bash
scripts/simple-notify.sh "SUCCESS" "All requirements met - Quality score: 95"
```
**You'll hear:** "Task completed successfully"
**When:** All quality gates pass, work is ready

### **3. TASK FAILED** ❌
```bash
scripts/simple-notify.sh "FAILED" "Quality gates failed - needs attention"
```
**You'll hear:** "Task failed. Your attention needed"
**When:** After 3 iterations still failing, or critical error

### **4. ITERATION IN PROGRESS** 🔄
```bash
scripts/simple-notify.sh "ITERATION" "Auto-fixing issues"
```
**You'll hear:** "Iteration complete. Checking quality"
**When:** Quality issues found, auto-iterating

### **5. USER INPUT NEEDED** 📝
```bash
scripts/simple-notify.sh "READY" "Waiting for your response"
```
**You'll hear:** "Ready for your input"
**When:** System needs clarification or decision

---

## 📋 **NOTIFICATION FLOW**

```mermaid
graph TD
    A[Task Starts] --> B{New Contract?}
    B -->|Yes| C[🔔 "Ready for your input"]
    B -->|No| D[Use Existing Contract]
    D --> E[Deploy Agents]
    C --> F{User Approves?}
    F -->|Yes| E
    F -->|No| G[🔔 "Contract needs revision"]
    E --> H[Work Executes]
    H --> I{Quality Check}
    I -->|Pass| J[🔔 "Task completed successfully"]
    I -->|Fail| K{Iterations < 3?}
    K -->|Yes| L[🔔 "Iteration complete"]
    L --> H
    K -->|No| M[🔔 "Task failed. Attention needed"]
```

---

## 🎧 **NOTIFICATION TYPES**

### **Voice Announcements**
| Status | Message | When |
|--------|---------|------|
| SUCCESS | "Task completed successfully" | Work done, quality passed |
| FAILED | "Task failed. Your attention needed" | Can't fix automatically |
| READY | "Ready for your input" | Needs approval/decision |
| ITERATION | "Iteration complete. Checking quality" | Auto-fixing issues |

### **Visual Banner**
Always shows in terminal:
```
==============================================
🔔 🔔 🔔  POWLAX NOTIFICATION  🔔 🔔 🔔
==============================================
STATUS: [STATUS]
MESSAGE: [DETAILS]
TIME: [TIMESTAMP]
==============================================
```

### **System Sound**
- Glass.aiff plays with notifications (macOS)
- Provides additional audio cue

---

## 🔧 **TESTING NOTIFICATIONS**

### **Test Contract Approval Alert**
```bash
cd /path/to/project && ./scripts/simple-notify.sh "READY" "Contract needs approval - TEST"
```

### **Test Success Alert**
```bash
cd /path/to/project && ./scripts/simple-notify.sh "SUCCESS" "Task completed - TEST"
```

### **Test Failure Alert**
```bash
cd /path/to/project && ./scripts/simple-notify.sh "FAILED" "Task failed - TEST"
```

---

## ⚙️ **CONFIGURATION**

### **Enable/Disable**
In `/config/yolo-mode.config.yaml`:
```yaml
notifications:
  enabled: true  # Set to false to disable
  methods:
    - terminal_bell
    - desktop_notify
    - status_file
    - console_banner
```

### **Custom Messages**
Agents can trigger custom notifications:
```typescript
await notifyUser("READY", "Custom message here");
```

---

## 🚨 **TROUBLESHOOTING**

### **Not Hearing Notifications?**

1. **Check Volume:** System volume must be on
2. **Check Terminal:** Must be in project directory
3. **Check Permissions:** Script must be executable
   ```bash
   chmod +x scripts/simple-notify.sh
   ```
4. **Test Directly:**
   ```bash
   ./scripts/simple-notify.sh "SUCCESS" "Test"
   ```

### **Getting Too Many Notifications?**

Adjust in workflow:
- Reduce iteration notifications
- Disable progress updates
- Only keep critical alerts

---

## ✅ **GUARANTEED NOTIFICATIONS**

**You WILL be notified when:**
1. ✅ Contract needs approval
2. ✅ Task completes successfully
3. ✅ Task fails and needs help
4. ✅ System needs your input
5. ✅ Quality iterations happening

**You WON'T be bothered for:**
- Routine progress updates
- Successful iterations
- Background operations
- Auto-fixed issues

---

## 📍 **IMPLEMENTATION STATUS**

**ACTIVE AND WORKING** - The notification system is fully operational and will alert you at all critical decision points.