# Quick Commit Checklist

## ⚡ Before Every Commit

### **Code Quality (2 min)**
- [ ] `npm run lint` - passes
- [ ] `npm run build` - compiles successfully  
- [ ] `npx playwright test` - tests pass
- [ ] No console.log/debugging code left in

### **Documentation (1 min)**
- [ ] README updated if features changed
- [ ] Comments added for complex logic
- [ ] API docs updated if endpoints changed

### **Security (30 sec)**
- [ ] No secrets/API keys in code
- [ ] .env files properly ignored
- [ ] No sensitive data committed

## 🚀 Production Commits (Additional)

### **Deployment Ready (5 min)**
- [ ] `vercel.json` updated if needed
- [ ] Database migrations tested
- [ ] Environment variables documented
- [ ] Performance acceptable (Lighthouse > 90)

### **Safety Net (2 min)**
- [ ] Rollback plan ready
- [ ] Error monitoring configured  
- [ ] Health checks working
- [ ] Backup plan documented

## 📝 Commit Message Format
```
type(scope): description

Examples:
feat(auth): add JWT token refresh
fix(database): resolve connection timeout
docs(api): update authentication guide
```

## 🔧 Quick Commands
```bash
# Pre-commit checks
npm run lint && npm run build && npx playwright test

# Security audit  
npm audit

# Performance check
npm run build && npm run analyze
```

---
**For full guidelines see**: [GitHub Commit & Production Guidelines](./GITHUB_COMMIT_AND_PRODUCTION_GUIDELINES.md)