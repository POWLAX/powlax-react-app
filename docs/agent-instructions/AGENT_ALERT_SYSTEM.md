# POWLAX Agent Alert & Color System

## 🔔 Alert System Setup

### **Trigger Alerts from Agents**
Agents should use this pattern to request approval or signal completion:

```markdown
🚨 **APPROVAL NEEDED** 🚨
**Agent**: [Agent Name with Color Emoji]
**Action**: [What needs approval]
**Impact**: [What this affects]
**Options**: [Different approaches available]

**Alert Command**: `./scripts/agent-alert.sh "[Agent Name]" "[Alert Message]" "approval"`
```

### **Alert Types & When to Use**

#### **1. 🚨 APPROVAL ALERTS** (Use Sparingly)
- **When**: Before making significant architectural changes
- **Example**: "About to modify core practice planner structure"
- **Trigger**: `./scripts/agent-alert.sh "Practice Planner" "Ready to modify core timeline component" "approval"`

#### **2. ✅ COMPLETION ALERTS** (Use for Major Milestones)
- **When**: Phase completion, major feature working
- **Example**: "Admin content editor fully functional"  
- **Trigger**: `./scripts/agent-alert.sh "Admin Manager" "Phase 1 complete - content editing live" "complete"`

#### **3. ❌ ERROR ALERTS** (Use for Blocking Issues)
- **When**: Can't proceed without user input
- **Example**: "Database connection failed"
- **Trigger**: `./scripts/agent-alert.sh "Skills Academy" "Database error - need connection details" "error"`

## 🎨 Agent Color & Identity System

### **Established Agent Colors**
```
🔧 Admin Content Management      - Blue Theme     (#007ACC)
📋 Practice Planner Enhancement  - Green Theme    (#28A745) 
🎓 Skills Academy Workout        - Orange Theme   (#FF6B35)
🔐 WordPress Integration         - Purple Theme   (#6F42C1)
🏢 Team HQ & Club OS            - Red Theme      (#DC3545)
🎮 Gamification Enhancement      - Pink Theme     (#E83E8C)
🤝 LearnDash/BuddyBoss          - Teal Theme     (#20C997)
📱 Mobile & Print Features       - Yellow Theme   (#FFC107)
```

### **Agent Signature Template**
Each agent should start messages with:

```markdown
[COLOR_EMOJI] **[AGENT_NAME]** | Phase [X] | [STATUS]
─────────────────────────────────────────────────

[Agent message content]

─────────────────────────────────────────────────
🎯 Next Action: [What happens next]
⏱️ ETA: [Expected completion time]
🔔 Will Alert: [When next alert will trigger]
```

### **Color-Coded Progress Updates**

#### **🔧 Admin Content Management Agent**
```markdown
🔧 **ADMIN CONTENT MANAGER** | Phase 1 | IN PROGRESS
─────────────────────────────────────────────────

✅ Created content editor routes
✅ Fixed 12 broken Lacrosse Lab URLs  
🔄 Building drill editing interface...

─────────────────────────────────────────────────
🎯 Next Action: Complete strategy editor form
⏱️ ETA: 30 minutes
🔔 Will Alert: When all content editors functional
```

#### **📋 Practice Planner Enhancement Agent**
```markdown
📋 **PRACTICE PLANNER ENHANCER** | Phase 1 | TESTING
─────────────────────────────────────────────────

✅ Added strategy selector to header
✅ Built strategy-drill mapping system
🧪 Testing "4-3 Alpha Clear → 4 Corner 1v1s"...

─────────────────────────────────────────────────
🎯 Next Action: Validate recommendation accuracy
⏱️ ETA: 15 minutes  
🔔 Will Alert: When strategy recommendations working
```

#### **🎓 Skills Academy Workout Agent**
```markdown
🎓 **SKILLS ACADEMY BUILDER** | Phase 2 | BLOCKED
─────────────────────────────────────────────────

✅ Created workout builder interface
✅ Implemented drill selection system
🚨 NEED APPROVAL: Multiplier calculation method

─────────────────────────────────────────────────
🎯 Next Action: Await multiplier system approval
⏱️ ETA: Waiting for user input
🔔 Will Alert: APPROVAL NEEDED for multiplier logic
```

## 🔄 Alert Integration Instructions

### **For Claude Agents**
Add this pattern to agent instructions:

```markdown
**ALERT PROTOCOL**:
- 🚨 Request approval BEFORE major architectural changes
- ✅ Alert completion of each Phase  
- ❌ Alert immediately on blocking errors
- Use your assigned color emoji in all communications
- Include progress status in standard format

**Alert Examples**:
- Approval: "🚨 About to modify core database schema - need approval"  
- Complete: "✅ Phase 1 complete - all features tested and working"
- Error: "❌ Cannot proceed - missing environment variable"
```

### **Browser Setup** (Run once in console)
```javascript
// Enhanced alert system with colors
function setupPOWLAXAlerts() {
  const agentColors = {
    'Admin': '#007ACC',
    'Practice': '#28A745', 
    'Academy': '#FF6B35',
    'WordPress': '#6F42C1',
    'TeamHQ': '#DC3545',
    'Gamification': '#E83E8C',
    'LearnDash': '#20C997',
    'Mobile': '#FFC107'
  };

  window.alertPOWLAXAgent = function(agentName, message, type = 'info') {
    const color = agentColors[agentName] || '#333';
    const emoji = type === 'complete' ? '✅' : type === 'error' ? '❌' : type === 'approval' ? '🚨' : '🔔';
    
    // Audio alert
    const audio = new Audio('/sounds/notification.mp3'); // You can add custom sound files
    audio.play().catch(() => console.log('Audio not available'));
    
    // Visual notification
    if (Notification.permission === "granted") {
      new Notification(`${emoji} ${agentName}`, {
        body: message,
        requireInteraction: type === 'approval',
        icon: `/icons/${agentName.toLowerCase()}.png` // Custom icons
      });
    }
    
    // Console with colors
    console.log(`%c${emoji} ${agentName}%c ${message}`, 
      `background: ${color}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold`,
      'color: #333; padding: 4px 8px'
    );
    
    // Page title flash (if tab not active)
    if (document.hidden) {
      const originalTitle = document.title;
      document.title = `🔔 ${agentName} Alert!`;
      setTimeout(() => document.title = originalTitle, 3000);
    }
  };
  
  console.log('%c🚀 POWLAX Agent Alert System Ready!', 'background: #007ACC; color: white; padding: 8px; font-size: 14px');
}

// Auto-setup
setupPOWLAXAlerts();

// Request notification permission
if ("Notification" in window) {
  Notification.requestPermission();
}
```

### **Quick Test**
```javascript
// Test the alert system
alertPOWLAXAgent('Admin', 'Content editor setup complete!', 'complete');
alertPOWLAXAgent('Practice', 'Need approval for strategy changes', 'approval');
alertPOWLAXAgent('Academy', 'Database connection failed', 'error');
```

## 🎯 Implementation for Your Current Agents

Since your 3 agents are already running, you can add this to each conversation:

**For Admin Agent**:
```markdown
Your agent color is 🔧 BLUE (#007ACC). Use this format for all updates:

🔧 **ADMIN CONTENT MANAGER** | [Phase] | [Status]  
[Your message]
🔔 Alert me when: Phase complete or need approval for major changes
```

**For Practice Planner Agent**:  
```markdown
Your agent color is 📋 GREEN (#28A745). Use this format:

📋 **PRACTICE PLANNER ENHANCER** | [Phase] | [Status]
[Your message]  
🔔 Alert me when: Strategy recommendations working or need approval
```

**For Skills Academy Agent**:
```markdown  
Your agent color is 🎓 ORANGE (#FF6B35). Use this format:

🎓 **SKILLS ACADEMY BUILDER** | [Phase] | [Status]
[Your message]
🔔 Alert me when: Workout builder functional or need approval for multipliers
```

This gives you **visual differentiation**, **audio alerts**, **desktop notifications**, and **clear approval protocols** for all future agents! 🚀

Would you like me to set up any additional alert integrations (Slack, email, etc.) or modify the color scheme?