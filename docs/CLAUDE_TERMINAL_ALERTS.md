# 🔔 Claude Terminal Alert System

## 🎯 **Quick Setup** (Run once in your terminal)

```bash
# In your project terminal, run:
source ./scripts/claude-shortcuts.sh
```

This loads all the alert functions Claude can use to get your attention!

## 🚨 **Alert Commands for Claude Agents**

### **When Claude Needs APPROVAL** (Triple ding + notification)
```bash
alert_approval "Agent Name" "What needs approval"

# Agent-specific shortcuts:
admin_alert "About to modify database schema - need approval?"
practice_alert "Ready to change core practice planner structure?"
academy_alert "Multiplier system implementation ready - approve approach?"
```

### **When Claude COMPLETES a Task** (Success ding + notification)
```bash
alert_complete "Agent Name" "What was completed"

# Examples:
alert_complete "Admin Content Manager" "All broken Lacrosse Lab URLs fixed!"
alert_complete "Practice Planner" "Strategy recommendations fully working!"
alert_complete "Academy Builder" "Workout builder interface complete!"
```

### **When Claude Has an ERROR** (Double ding + urgent notification)
```bash
alert_error "Agent Name" "What the error is"

# Examples:
alert_error "Admin Manager" "Database connection failed - need credentials"
alert_error "Practice Planner" "Cannot access strategy table - permissions issue"
alert_error "Academy Builder" "Missing environment variables for point calculation"
```

### **For INFO/Updates** (Single ding + notification)
```bash
alert_info "Agent Name" "Status update"

# Examples:
alert_info "Admin Manager" "Phase 1: 50% complete - editing interface built"
alert_info "Practice Planner" "Testing strategy-drill recommendations now"
alert_info "Academy Builder" "Building workout creation interface"
```

## 🎨 **What Each Alert Does**

### **🚨 APPROVAL Alert**
- **Sound**: Triple terminal bells + Glass sound
- **Visual**: Bright yellow terminal banner  
- **Desktop**: macOS notification with agent icon
- **Action**: Waits for you to press ENTER to acknowledge
- **Use**: Before major changes, architectural decisions

### **✅ COMPLETE Alert**  
- **Sound**: Single bell + Ping sound
- **Visual**: Bright green terminal banner
- **Desktop**: Success notification
- **Use**: Phase completions, major milestones

### **❌ ERROR Alert**
- **Sound**: Double bells + Basso error sound  
- **Visual**: Bright red terminal banner
- **Desktop**: Urgent notification  
- **Use**: Blocking issues, need immediate help

### **🔔 INFO Alert**
- **Sound**: Single bell + Pop sound
- **Visual**: Bright blue terminal banner
- **Desktop**: Standard notification
- **Use**: Progress updates, status reports

## 📋 **Instructions for Your Current Claude Agents**

Add this to each of your running Claude conversations:

### **🔧 Admin Content Management Agent**
```markdown
TERMINAL ALERT PROTOCOL:
- Before major changes: `admin_alert "What needs approval"`
- When phase complete: `alert_complete "Admin Content Manager" "What completed"`
- On blocking errors: `alert_error "Admin Manager" "What error"`
- For progress: `alert_info "Admin Manager" "Current status"`

Example usage:
```bash
admin_alert "About to modify core drill table structure - approve?"
alert_complete "Admin Content Manager" "All content editors working!"
```

### **📋 Practice Planner Enhancement Agent**  
```markdown
TERMINAL ALERT PROTOCOL:
- Before major changes: `practice_alert "What needs approval"`
- When features work: `alert_complete "Practice Planner" "What completed"`
- On blocking errors: `alert_error "Practice Planner" "What error"`
- For progress: `alert_info "Practice Planner" "Current status"`

Example usage:
```bash
practice_alert "Ready to modify core timeline component?"
alert_complete "Practice Planner" "4-3 Alpha Clear → 4 Corner 1v1s working!"
```

### **🎓 Skills Academy Workout Builder Agent**
```markdown
TERMINAL ALERT PROTOCOL:
- Before major changes: `academy_alert "What needs approval"`
- When features work: `alert_complete "Academy Builder" "What completed"`  
- On blocking errors: `alert_error "Academy Builder" "What error"`
- For progress: `alert_info "Academy Builder" "Current status"`

Example usage:
```bash
academy_alert "Multiplier calculation approach ready - approve logic?"
alert_complete "Academy Builder" "Workout builder interface fully functional!"
```

## 🔍 **Testing the System**

Try these commands in your terminal to hear/see each alert type:

```bash
# Test approval alert (will wait for ENTER)
alert_approval "Test Agent" "This is a test approval request"

# Test completion alert  
alert_complete "Test Agent" "This is a test completion"

# Test error alert
alert_error "Test Agent" "This is a test error"

# Test info alert
alert_info "Test Agent" "This is a test info update"

# Quick ding
ding

# Urgent attention (5 dings)
urgent
```

## 🎯 **Agent Alert Guidelines**

### **DO Alert For:**
- ✅ Major architectural decisions
- ✅ Phase/milestone completions  
- ✅ Blocking errors needing input
- ✅ Ready for user testing
- ✅ Database schema changes
- ✅ Security-related modifications

### **DON'T Alert For:**
- ❌ Minor code changes
- ❌ Routine file creation  
- ❌ Standard debugging
- ❌ Expected progress updates
- ❌ Simple variable changes

### **Alert Frequency:**
- **Approval**: Only when genuinely needed
- **Complete**: Major milestones only (not every small task)
- **Error**: Immediate blocking issues
- **Info**: Every 30-60 minutes for long tasks

## 📊 **Alert Log Tracking**

All alerts are logged to `./logs/claude-alerts.log`:

```bash
# View recent alerts
tail -f ./logs/claude-alerts.log

# View all alerts from today
grep "$(date +%Y-%m-%d)" ./logs/claude-alerts.log
```

## 🚀 **Ready to Use!**

Your Claude agents can now:
1. **Ring your terminal** when they need attention
2. **Show desktop notifications** for important updates  
3. **Use color-coded visual alerts** in the terminal
4. **Wait for acknowledgment** on approval requests
5. **Log all alerts** for tracking

The system is loaded and ready! Tell your Claude agents to start using these alert commands. 🎯