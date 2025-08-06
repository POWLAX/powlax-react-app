# Claude Context: Feature Development

*Auto-updated: 2025-01-16*  
*Purpose: Local context for Claude when working on POWLAX feature development documentation*

## 🎯 **What This Area Does**
Feature development documentation system that enforces mandatory 20-minute planning before any coding, tracks feature progress, and maintains comprehensive specifications for all POWLAX features with mobile-first and age-appropriate requirements.

## 🔧 **Key Components**
**Primary Files:**
- `FEATURE_TEMPLATE.md` - Mandatory template for all new features
- Individual feature specifications (e.g., `mobile-optimization.md`, `practice-planner-v2.md`)
- Feature branch tracking and coordination documentation
- Quality gate definitions and success criteria

**Documentation Structure:**
- Vision statements and user impact analysis
- Technical specifications with mobile and age-band requirements
- Sub agent coordination plans and responsibilities
- Testing strategies and rollback procedures
- Implementation logs and lessons learned

## 📱 **Mobile & Age Band Considerations**
**Mobile Responsiveness:**
- All features must work on 375px+ screens
- Touch targets minimum 44px for field usage with gloves
- Performance targets: <3 seconds load time on 3G networks
- Battery efficiency for extended practice sessions
- Offline functionality when connectivity is poor

**Age Band Appropriateness:**
- **Do it (8-10):** Simple, guided interfaces with large visual elements
- **Coach it (11-14):** Scaffolded learning interfaces with helpful prompts
- **Own it (15+):** Advanced functionality with full customization options

**Field Usage Requirements:**
- High contrast for bright sunlight visibility
- Weather-resistant interaction patterns
- Quick access to essential functions during practice
- Emergency modifications capability

## 🔗 **Integration Points**
**This area connects to:**
- POWLAX Sub Agent system for coordinated development
- Feature branch workflow (powlax-sub-agent-system/feature-[name])
- Quality gate automation (lint, build, mobile testing)
- Documentation system and architecture updates
- Git workflow and branch management

**Sub Agent Coordination:**
- powlax-master-controller: Orchestrates feature development
- powlax-frontend-developer: Implements UI and mobile optimization
- powlax-ux-researcher: Validates age-appropriate and coaching workflows
- powlax-backend-architect: Handles data and API requirements
- powlax-sprint-prioritizer: Manages feature prioritization and impact

**When you modify this area, also check:**
- Feature branch naming consistency
- Sub agent assignment accuracy
- Quality gate definitions completeness
- Mobile and age-band requirement specifications
- Integration point documentation
- Testing strategy comprehensiveness

## 🧪 **Testing Strategy**
**Essential Tests:**
- Feature specification completeness (all template sections filled)
- Mobile responsiveness validation across breakpoints
- Age-band interface usability testing
- Integration testing with existing POWLAX features
- Performance impact measurement
- Rollback procedure validation

**Quality Gates:**
- Mandatory 20-minute planning before any coding
- Master Controller review and approval
- Sub agent coordination confirmation
- Success criteria clearly defined and measurable
- Testing strategy established and documented

## ⚠️ **Common Issues & Gotchas**
**Known Problems:**
- Features often started without proper 20-minute planning
- Mobile requirements overlooked until late in development
- Age-band appropriateness not validated with target users
- Integration points with existing features missed
- Rollback procedures not tested before deployment

**Before Making Changes:**
1. Complete mandatory 20-minute planning in feature.md
2. Get Master Controller review and sub agent assignments
3. Define clear, measurable success criteria
4. Document mobile responsiveness requirements
5. Validate age-appropriate interface specifications
6. Plan comprehensive testing strategy including rollback

**Feature Development Process:**
1. **Planning Gate:** 20+ minutes of feature.md documentation
2. **Implementation Gate:** Sub agent coordination and quality gates
3. **Quality Gate:** Mobile testing, age-band validation, integration testing
4. **Integration Gate:** Merge to main development branch with full validation

**Success Criteria Requirements:**
- All success criteria must be measurable and specific
- Mobile performance targets clearly defined
- Age-band appropriateness validation methods established
- Integration compatibility with existing features confirmed
- Rollback triggers and procedures documented

---
*This file auto-updates when structural changes are made to ensure context accuracy*