# A4CC - Simple Registration Flow Builder

## 🎯 **Agent Mission**
Build clean, simple registration pages that convert visitors to team members. Focus on MINIMAL steps and CLEAR instructions - eliminate friction and confusion.

## 🚨 **CRITICAL ERROR PREVENTION**

### **🚨 IMPORT VERIFICATION (BREAKS ENTIRE APP)**
**BEFORE creating any file**: Verify ALL imports exist
- **Check these paths work**:
  - `@/contexts/JWTAuthContext` ✅ (for auth)
  - `@/components/ui/...` ✅ (for UI components)
  - `@/lib/supabase` ✅ (for database)
- **NEVER import**: `@/hooks/useAuthContext` ❌ (doesn't exist)

### **🛡️ Null Safety (UI Crashes)**
- Always use: `formData?.email ?? ''`
- Form validation: `(email?.includes('@') ?? false)`
- Database queries: `team?.name ?? 'Team'`

### **🗄️ Database Safety**
- Always handle null values from DB: `team || null`
- Use proper TypeScript interfaces for registration data
- Test queries with invalid team codes

### **🔧 After Changes**
- Restart server if making new files: `rm -rf .next && npm run dev`
- Verify correct port in terminal output

## 🎯 **SIMPLE REGISTRATION PHILOSOPHY**

### **MINIMAL FRICTION PRINCIPLES** ⭐⭐⭐
```typescript
// NOT THIS: Complex multi-step registration
❌ Too many form fields
❌ Multiple pages/steps
❌ Confusing role selection
❌ Required fields that aren't essential

// THIS: Simple, focused registration
✅ 3-4 essential fields only
✅ Single page with clear sections
✅ Obvious role selection with explanations
✅ Optional fields are truly optional
```

### **CONVERSION-FOCUSED APPROACH** ⭐⭐⭐
```typescript
// Ask: "What's the minimum info needed to get them started?"
interface SimpleRegistrationForm {
  // Essential info only
  essential: {
    firstName: string
    lastName: string  
    email: string
    role: 'player' | 'parent' | 'coach'
  }
  
  // Context (auto-filled when possible)
  context: {
    teamName: string // From registration code
    invitedBy: string // From invitation
    registrationSource: 'qr_code' | 'invitation' | 'direct'
  }
  
  // Optional (can be added later)
  optional: {
    phone?: string
    emergencyContact?: string // Only for players
    parentEmail?: string // Only for young players
  }
}
```

## 🏗️ **REGISTRATION PAGES TO BUILD**

### **1. Team Registration Landing** ⭐⭐⭐
**Route**: `/register?code=TEAM_CODE` (create new)
**For**: Anyone joining via QR code or registration link

```typescript
// SIMPLE welcome + registration form
<RegistrationPage>
  {/* Section 1: Team Welcome */}
  <TeamWelcome>
    <h1>Join {teamName}!</h1>
    <p>You've been invited to join our lacrosse team.</p>
    {coachName && <p>Coach: {coachName}</p>}
    {teamLevel && <p>Level: {teamLevel} • Age: {ageGroup}</p>}
  </TeamWelcome>
  
  {/* Section 2: Role Selection - CLEAR explanations */}
  <RoleSelection>
    <h2>I am a...</h2>
    <RoleCard 
      value="player"
      title="Player" 
      description="I will be playing on this team"
      selected={role === 'player'}
    />
    <RoleCard 
      value="parent" 
      title="Parent/Guardian"
      description="My child will be playing on this team" 
      selected={role === 'parent'}
    />
    <RoleCard 
      value="coach"
      title="Coach/Assistant" 
      description="I will help coach this team"
      selected={role === 'coach'}
    />
  </RoleSelection>
  
  {/* Section 3: Essential Info Form */}
  <RegistrationForm role={role} />
</RegistrationPage>
```

### **2. Invitation-Based Registration** ⭐⭐⭐
**Route**: `/register?invite=INVITE_CODE` (create new)  
**For**: People who received personal invitations

```typescript
// PRE-FILLED form from invitation data
<InvitationRegistration>
  {/* Section 1: Personal Welcome */}
  <PersonalWelcome>
    <h1>Hi {invitedFirstName}!</h1>
    <p>{coachName} invited you to join {teamName} as a {invitedRole}.</p>
    {personalMessage && <blockquote>{personalMessage}</blockquote>}
  </PersonalWelcome>
  
  {/* Section 2: Confirm Details */}
  <ConfirmDetails>
    <h2>Confirm Your Information</h2>
    <PrefilledForm
      firstName={invitedFirstName}
      lastName={invitedLastName}  
      email={invitedEmail}
      role={invitedRole}
      editable={true} // Allow corrections
    />
  </ConfirmDetails>
  
  {/* Section 3: Complete Registration */}
  <CompleteRegistration>
    <Button size="large">Join {teamName}</Button>
  </CompleteRegistration>
</InvitationRegistration>
```

### **3. Registration Success** ⭐⭐
**Route**: `/register/success` (create new)
**For**: Confirmation and next steps after registration

```typescript
// CLEAR next steps based on role
<RegistrationSuccess>
  {/* Section 1: Success Confirmation */}
  <SuccessMessage>
    <CheckIcon className="text-green-500" />
    <h1>Welcome to {teamName}!</h1>
    <p>Your registration is complete.</p>
  </SuccessMessage>
  
  {/* Section 2: Role-Specific Next Steps */}
  <NextSteps role={userRole}>
    {role === 'player' && (
      <PlayerNextSteps>
        <h2>What's Next?</h2>
        <StepCard title="Check Skills Academy" action="Start Training" />
        <StepCard title="Practice Schedule" action="View Practices" />
      </PlayerNextSteps>
    )}
    
    {role === 'parent' && (
      <ParentNextSteps>
        <h2>What's Next?</h2>
        <StepCard title="Team Communication" action="Join Updates" />
        <StepCard title="View Schedule" action="See Practices" />
      </ParentNextSteps>
    )}
    
    {role === 'coach' && (
      <CoachNextSteps>
        <h2>What's Next?</h2>
        <StepCard title="Team Dashboard" action="Manage Team" />
        <StepCard title="Practice Planner" action="Plan Practice" />
      </CoachNextSteps>
    )}
  </NextSteps>
</RegistrationSuccess>
```

## 🎨 **SIMPLE FORM COMPONENTS**

### **Essential Form Components ONLY**
```typescript
// Keep forms minimal and focused
components/registration/
├── RoleSelectionCard.tsx       // Clear role explanation cards
├── RegistrationForm.tsx        // Minimal essential fields
├── TeamWelcomeCard.tsx         // Team info display
├── SuccessStepsCard.tsx        // Next steps after registration
└── FormField.tsx               // Simple form input with validation
```

### **RoleSelectionCard Component**
```typescript
interface RoleSelectionCard {
  value: 'player' | 'parent' | 'coach'
  title: string
  description: string
  selected: boolean
  onClick: () => void
}

// Clear, obvious selection
<div 
  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
    selected 
      ? 'border-blue-500 bg-blue-50' 
      : 'border-gray-200 hover:border-gray-300'
  }`}
  onClick={onClick}
>
  <div className="flex items-center">
    <input 
      type="radio" 
      checked={selected}
      className="mr-3"
      readOnly
    />
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
</div>
```

### **Minimal Registration Form**
```typescript
// Only essential fields - everything else comes later
<form onSubmit={handleRegistration} className="space-y-4">
  <FormField
    label="First Name"
    type="text"
    value={firstName}
    onChange={setFirstName}
    required
  />
  
  <FormField
    label="Last Name"  
    type="text"
    value={lastName}
    onChange={setLastName}
    required
  />
  
  <FormField
    label="Email Address"
    type="email" 
    value={email}
    onChange={setEmail}
    required
  />
  
  {/* Optional field - only show if relevant */}
  {role === 'player' && ageGroup.includes('U12') && (
    <FormField
      label="Parent Email (for communication)"
      type="email"
      value={parentEmail}
      onChange={setParentEmail}
      placeholder="Optional - can add later"
    />
  )}
  
  <Button 
    type="submit"
    size="large"
    className="w-full bg-blue-600 text-white"
    disabled={isLoading}
  >
    {isLoading ? 'Joining...' : `Join ${teamName}`}
  </Button>
</form>
```

## 🗃️ **DATABASE OPERATIONS (KEEP SIMPLE)**

### **Registration Flow Queries**
```typescript
// 1. Validate registration code/invitation
const validateRegistrationCode = async (code: string) => {
  const { data: team } = await supabase
    .from('team_registration_assets')
    .select('team_id, teams(name, coach_name, age_group)')
    .eq('registration_code', code)
    .single()
    
  return team
}

// 2. Create new user registration
const createUserRegistration = async (registrationData: RegistrationData) => {
  // Create user in users table
  const { data: user } = await supabase
    .from('users')
    .insert({
      first_name: registrationData.firstName,
      last_name: registrationData.lastName,
      email: registrationData.email,
      registration_source: registrationData.source
    })
    .select()
    .single()
    
  // Add to team with role
  await supabase
    .from('user_team_roles')
    .insert({
      user_id: user.id,
      team_id: registrationData.teamId,
      role: registrationData.role
    })
    
  return user
}

// 3. Handle invitation acceptance
const acceptInvitation = async (inviteCode: string, userData: UserData) => {
  // Get invitation details
  const { data: invitation } = await supabase
    .from('team_invitations')
    .select('*')
    .eq('invitation_code', inviteCode)
    .single()
    
  // Create user and assign role
  const user = await createUserRegistration({
    ...userData,
    teamId: invitation.team_id,
    role: invitation.role
  })
  
  // Mark invitation as accepted
  await supabase
    .from('team_invitations')
    .update({ 
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })
    .eq('invitation_code', inviteCode)
    
  return user
}
```

## 🎯 **SIMPLE SUCCESS CRITERIA**

### **Must Have - WORKING REGISTRATION FLOW**
- [ ] QR code/link registration works without errors
- [ ] Invitation-based registration pre-fills correctly
- [ ] Role selection is obvious and clear
- [ ] Essential form fields validate properly
- [ ] Success page shows relevant next steps by role
- [ ] Database properly stores user and team relationship

### **Should Have - SMOOTH EXPERIENCE**
- [ ] Mobile-friendly responsive design
- [ ] Loading states during registration process
- [ ] Error handling for invalid codes/invitations
- [ ] Form validation with helpful error messages
- [ ] Automatic redirect to success page

### **NEVER INCLUDE**
- ❌ Too many form fields that can be collected later
- ❌ Complex multi-step registration process
- ❌ Confusing role selection without explanations
- ❌ Registration that requires immediate profile completion

## 📱 **MOBILE-FIRST REGISTRATION**

### **Touch-Friendly Design**
```css
.registration-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px 16px;
}

.role-selection {
  display: grid;
  gap: 12px;
  margin: 24px 0;
}

.form-field {
  margin-bottom: 16px;
}

.form-field input {
  width: 100%;
  padding: 12px;
  font-size: 16px; /* Prevents zoom on iOS */
  border: 1px solid #d1d5db;
  border-radius: 8px;
}

.submit-button {
  width: 100%;
  padding: 16px;
  font-size: 18px;
  font-weight: 600;
}
```

## 📝 **MANDATORY: Documentation Self-Update (CRITICAL)**

### **Phase Final: Documentation Self-Update (MANDATORY)**  
**Priority**: Critical - Must complete before task sign-off

**Required Updates**:
1. **Issue Documentation**: Record any registration flow problems with form/database context
2. **Troubleshooting Guide Update**: Add new form validation and registration error patterns
3. **Builder Template Enhancement**: Update UI template with registration flow strategies
4. **Future Agent Guidance**: Create specific warnings for registration form work

**Success Criteria**:
- [ ] All registration issues documented with form/flow context
- [ ] Troubleshooting guide updated with new registration patterns
- [ ] UI agent template enhanced with form handling safety measures
- [ ] Future registration agents have specific guidance for conversion optimization

**Reference**: Follow [`AGENT_SELF_UPDATE_PROTOCOL.md`](AGENT_SELF_UPDATE_PROTOCOL.md) exactly

---

**CRITICAL REMINDER: Build SIMPLE registration flow. Get them signed up fast with minimal friction, then collect additional details later!**