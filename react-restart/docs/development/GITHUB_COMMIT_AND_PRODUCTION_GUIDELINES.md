# GitHub Commit & Production Guidelines

## 🎯 Purpose
This document establishes clear expectations for what must be included when committing files to GitHub, especially for production deployments. All developers and AI agents must follow these standards.

---

## 📋 Pre-Commit Checklist

### **✅ REQUIRED Before Every Commit**

#### **1. Code Quality**
- [ ] All linter errors resolved (`npm run lint`)
- [ ] All TypeScript errors resolved (`npm run build`)
- [ ] All tests passing (`npx playwright test`)
- [ ] Code follows project patterns and standards
- [ ] No console.log statements in production code
- [ ] No TODO/FIXME comments without tickets

#### **2. Documentation Updates**
- [ ] README.md updated if features added/changed
- [ ] API documentation updated if endpoints changed
- [ ] Component documentation updated if UI changed
- [ ] Database schema docs updated if migrations added

#### **3. File Management**
- [ ] No sensitive data (API keys, passwords, tokens) committed
- [ ] .env files properly gitignored
- [ ] No large binary files committed
- [ ] Removed debugging/temporary files
- [ ] All necessary files included for deployment

#### **4. Dependencies**
- [ ] package.json and package-lock.json in sync
- [ ] No unused dependencies
- [ ] Security vulnerabilities checked (`npm audit`)
- [ ] Version locks appropriate for production

---

## 🚀 Production Deployment Requirements

### **✅ CRITICAL for Production Commits**

#### **1. Environment Configuration**
- [ ] Vercel configuration updated (`vercel.json`)
- [ ] Environment variables documented
- [ ] Database migrations tested and ready
- [ ] Build process verified locally

#### **2. Database Safety**
- [ ] All migrations are reversible
- [ ] Data migration scripts tested
- [ ] Backup plan documented
- [ ] RLS policies updated if schema changed

#### **3. Performance & Security**
- [ ] Images optimized for web
- [ ] Bundle size checked and acceptable
- [ ] Security headers configured
- [ ] HTTPS/SSL considerations addressed

#### **4. Monitoring & Rollback**
- [ ] Error monitoring configured
- [ ] Rollback plan documented
- [ ] Health check endpoints working
- [ ] Performance benchmarks established

---

## 📝 Commit Message Standards

### **Format Requirements**
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### **Types**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions/modifications
- `chore`: Build tasks, package manager configs
- `security`: Security improvements
- `perf`: Performance improvements

### **Examples**
```bash
# Good commit messages
feat(practice-planner): add drill filtering by difficulty level
fix(auth): resolve JWT token expiration handling
docs(api): update authentication endpoint documentation
security(database): implement additional RLS policies

# Bad commit messages
"updates"
"fix stuff"
"work in progress"
"temp commit"
```

---

## 🔍 File-Specific Guidelines

### **Database Files**
- [ ] Migration files numbered sequentially
- [ ] Up and down migrations included
- [ ] Test data migrations separately from schema
- [ ] RLS policies updated with schema changes

### **Component Files**
- [ ] TypeScript interfaces defined
- [ ] PropTypes or TypeScript props documented
- [ ] Accessibility attributes included
- [ ] Mobile responsiveness tested
- [ ] Error boundaries implemented where needed

### **API Routes**
- [ ] Input validation implemented
- [ ] Error handling comprehensive
- [ ] Response types documented
- [ ] Rate limiting considered
- [ ] Authentication/authorization checked

### **Configuration Files**
- [ ] Comments explaining non-obvious settings
- [ ] Environment-specific values separated
- [ ] Security settings reviewed
- [ ] Backup configurations maintained

---

## 🚨 Production Deployment Checklist

### **Before Pushing to Main Branch**

#### **1. Pre-Deployment Testing**
- [ ] Full test suite passes locally
- [ ] Manual testing of new features completed
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile device testing completed
- [ ] Performance testing acceptable

#### **2. Database Preparation**
- [ ] Migration scripts tested on staging data
- [ ] Database backup scheduled
- [ ] RLS policies tested with different user roles
- [ ] Data integrity checks passed

#### **3. Third-Party Services**
- [ ] Supabase connection tested
- [ ] WordPress integration tested (if applicable)
- [ ] External APIs validated
- [ ] CDN/media services confirmed working

#### **4. Monitoring Setup**
- [ ] Error tracking configured (Sentry/similar)
- [ ] Performance monitoring enabled
- [ ] Log aggregation working
- [ ] Alert thresholds set

### **During Deployment**
- [ ] Deploy during low-traffic periods
- [ ] Monitor error rates during rollout
- [ ] Verify all core features working
- [ ] Check database performance
- [ ] Validate third-party integrations

### **Post-Deployment**
- [ ] Smoke tests completed
- [ ] User acceptance testing
- [ ] Performance metrics within acceptable ranges
- [ ] Error rates below threshold
- [ ] Rollback plan ready if needed

---

## 📊 Required Documentation Updates

### **For Every Major Feature**
- [ ] Update `CLAUDE.md` with new patterns/commands
- [ ] Update API documentation
- [ ] Update user-facing documentation
- [ ] Update deployment runbook
- [ ] Update troubleshooting guides

### **For Database Changes**
- [ ] Update schema documentation
- [ ] Update data flow diagrams
- [ ] Update backup/restore procedures
- [ ] Update security model documentation

### **For UI Changes**
- [ ] Update component library documentation
- [ ] Update accessibility documentation
- [ ] Update responsive design notes
- [ ] Update browser compatibility matrix

---

## 🛠️ Tools and Automation

### **Required Before Commit**
```bash
# Run these commands before every commit
npm run lint                    # Check code style
npm run build                   # Verify TypeScript compilation
npx playwright test            # Run test suite
npm audit                      # Check for vulnerabilities
```

### **Git Hooks (Recommended)**
```bash
# Pre-commit hook should include:
- Lint checking
- Type checking
- Test execution
- Commit message validation
```

---

## 🚦 Branch Strategy

### **Main Branch Protection**
- All commits to `main` must pass CI/CD
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date

### **Feature Branch Requirements**
- Branch naming: `feature/description` or `fix/description`
- Keep branches focused and small
- Regular rebasing with main
- Clear PR descriptions with testing notes

---

## 📈 Success Metrics

### **Quality Gates**
- Test coverage > 80%
- Build time < 5 minutes
- Bundle size increase < 10% per feature
- Zero critical security vulnerabilities
- Lighthouse performance score > 90

### **Deployment Success Criteria**
- Zero downtime deployments
- Rollback capability within 5 minutes
- Error rate < 0.1% post-deployment
- Performance degradation < 5%

---

## 🆘 Emergency Procedures

### **If Deployment Fails**
1. **Immediate Actions**
   - Stop deployment process
   - Assess impact scope
   - Execute rollback plan
   - Communicate to stakeholders

2. **Investigation**
   - Review deployment logs
   - Check monitoring dashboards
   - Identify root cause
   - Document findings

3. **Recovery**
   - Fix issues in feature branch
   - Test fix thoroughly
   - Deploy fix with expedited process
   - Post-mortem review

---

## 📚 Additional Resources

- [POWLAX Development Workflow](./CLAUDE.md)
- [Task Management System](../tasks/README.md)
- [A4CC Standards Template](../agent-instructions/A4CC-STANDARDS-TEMPLATE.md)
- [BMad Method Guidelines](../.bmad-core/user-guide.md)

---

**Document Version**: 1.0  
**Last Updated**: January 15, 2025  
**Next Review**: February 15, 2025  
**Maintained By**: Development Team Lead

---

## 🔄 Continuous Improvement

This document should be reviewed and updated monthly. All team members are encouraged to suggest improvements based on lessons learned during development and deployment processes.

**Feedback Process**: Create issues in GitHub with label `process-improvement` for suggested changes to these guidelines.