# 🟠 **Team HQ & Club OS Management Agent - Deployment Instructions**

## 🎯 **Agent Mission Statement**
Build comprehensive team and organization management dashboards that allow Directors and Coaches to customize, manage, and scale their Team HQ and Club OS structures with member invitations, roster management, and upgrade flows.

---

## 🏗️ **Phase 1: Organization Management Dashboard (Week 1)**

### **Director Dashboard Route**
**File:** `src/app/(authenticated)/organizations/[orgId]/dashboard/page.tsx`

```typescript
export default function OrganizationDashboard({ params }: { params: { orgId: string } }) {
  const { organization, teams, stats, userRole } = useOrganization(params.orgId)
  
  // Security: Only directors can access organization dashboard
  if (userRole !== 'director') {
    return <UnauthorizedAccess message="Director access required" />
  }

  return (
    <div className="organization-dashboard max-w-7xl mx-auto p-6">
      <OrganizationHeader 
        organization={organization}
        onEdit={() => setShowEditModal(true)}
      />
      
      <OrganizationStats 
        totalTeams={teams.length}
        totalPlayers={stats.totalPlayers}
        totalCoaches={stats.totalCoaches}
        guaranteeDaysLeft={stats.guaranteeDaysLeft}
      />
      
      <TeamsManagementGrid 
        teams={teams}
        maxTeams={organization.subscription.maxTeams}
        onAddTeam={handleAddNewTeam}
        onManageTeam={handleTeamManagement}
      />
      
      <RecentActivity activities={stats.recentActivities} />
    </div>
  )
}
```

### **Teams Grid Component**
**File:** `src/components/organization/TeamsManagementGrid.tsx`

```typescript
export function TeamsManagementGrid({ teams, maxTeams, onAddTeam, onManageTeam }: TeamsGridProps) {
  const availableSlots = maxTeams - teams.length

  return (
    <div className="teams-grid">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Teams Management</h2>
        <div className="text-sm text-gray-600">
          {teams.length} of {maxTeams} teams used
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map(team => (
          <TeamCard 
            key={team.id}
            team={team}
            stats={getTeamStats(team.id)}
            onManage={() => onManageTeam(team.id)}
            onCustomize={() => openTeamCustomization(team.id)}
          />
        ))}
        
        {availableSlots > 0 && (
          <AddTeamCard 
            availableSlots={availableSlots}
            onClick={onAddTeam}
          />
        )}
        
        {availableSlots === 0 && (
          <UpgradeCard 
            currentPlan={organization.subscription.type}
            onUpgrade={handlePlanUpgrade}
          />
        )}
      </div>
    </div>
  )
}
```

---

## 🎨 **Phase 2: Team Customization Wizard (Week 1-2)**

### **Team Setup Wizard**
**File:** `src/components/team-management/TeamSetupWizard.tsx`

```typescript
export function TeamSetupWizard({ team, onComplete }: TeamSetupProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [teamData, setTeamData] = useState<TeamSetupData>({
    name: team.name,
    ageGroup: '',
    level: '',
    season: '',
    maxPlayers: 25,
    maxCoaches: 3,
    logo: null,
    colors: { primary: '#000000', secondary: '#ffffff' },
    location: { city: '', state: '', practiceLocation: '' }
  })

  const steps = [
    { 
      id: 1, 
      title: 'Basic Information', 
      component: <BasicInfoStep data={teamData} onChange={setTeamData} />
    },
    { 
      id: 2, 
      title: 'Team Details', 
      component: <TeamDetailsStep data={teamData} onChange={setTeamData} />
    },
    { 
      id: 3, 
      title: 'Branding & Colors', 
      component: <BrandingStep data={teamData} onChange={setTeamData} />
    },
    { 
      id: 4, 
      title: 'Registration Setup', 
      component: <RegistrationSetup team={team} data={teamData} />
    }
  ]

  const handleComplete = async () => {
    await updateTeamSettings(team.id, teamData)
    await generateRegistrationAssets(team.id, teamData)
    onComplete(teamData)
  }

  return (
    <div className="team-setup-wizard max-w-4xl mx-auto">
      <WizardProgress currentStep={currentStep} totalSteps={steps.length} />
      
      <div className="wizard-content bg-white rounded-lg shadow-lg p-8">
        {steps.find(s => s.id === currentStep)?.component}
      </div>
      
      <WizardNavigation 
        currentStep={currentStep}
        totalSteps={steps.length}
        onNext={() => setCurrentStep(s => Math.min(s + 1, steps.length))}
        onPrevious={() => setCurrentStep(s => Math.max(s - 1, 1))}
        onComplete={handleComplete}
        canProceed={validateCurrentStep(currentStep, teamData)}
      />
    </div>
  )
}
```

### **Basic Info Step Component**
**File:** `src/components/team-management/wizard-steps/BasicInfoStep.tsx`

```typescript
export function BasicInfoStep({ data, onChange }: StepProps) {
  return (
    <div className="basic-info-step">
      <h2 className="text-2xl font-bold mb-6">Team Basic Information</h2>
      
      <div className="form-grid grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Team Name</label>
          <input 
            type="text"
            value={data.name}
            onChange={e => onChange({...data, name: e.target.value})}
            placeholder="Enter team name"
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Age Group</label>
          <select 
            value={data.ageGroup}
            onChange={e => onChange({...data, ageGroup: e.target.value})}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-orange-500"
            required
          >
            <option value="">Select age group</option>
            <option value="U8">U8 (Under 8)</option>
            <option value="U10">U10 (Under 10)</option>
            <option value="U12">U12 (Under 12)</option>
            <option value="U14">U14 (Under 14)</option>
            <option value="U16">U16 (Under 16)</option>
            <option value="U18">U18 (Under 18)</option>
            <option value="Adult">Adult</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Competition Level</label>
          <select 
            value={data.level}
            onChange={e => onChange({...data, level: e.target.value})}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-orange-500"
            required
          >
            <option value="">Select level</option>
            <option value="recreational">Recreational</option>
            <option value="competitive">Competitive</option>
            <option value="elite">Elite</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Season</label>
          <input 
            type="text"
            value={data.season}
            onChange={e => onChange({...data, season: e.target.value})}
            placeholder="e.g., Spring 2024"
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>
    </div>
  )
}
```

---

## 👥 **Phase 3: Member Invitation System (Week 2)**

### **Member Invitations Interface**
**File:** `src/components/team-management/MemberInvitations.tsx`

```typescript
export function MemberInvitations({ team }: { team: Team }) {
  const [activeTab, setActiveTab] = useState<'individual' | 'bulk' | 'qr'>('individual')
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([])

  return (
    <div className="member-invitations">
      <div className="invitations-header mb-8">
        <h2 className="text-2xl font-bold">Invite Team Members</h2>
        <p className="text-gray-600 mt-2">
          Invite players, parents, and coaches to join {team.name}
        </p>
      </div>
      
      <div className="invitation-tabs mb-8">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('individual')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'individual' 
                ? 'bg-white text-orange-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Individual Invites
          </button>
          <button 
            onClick={() => setActiveTab('bulk')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'bulk' 
                ? 'bg-white text-orange-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Bulk Invites
          </button>
          <button 
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'qr' 
                ? 'bg-white text-orange-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            QR Code & Flyer
          </button>
        </nav>
      </div>
      
      <div className="invitation-content">
        {activeTab === 'individual' && (
          <IndividualInviteForm team={team} onInvite={handleSendInvite} />
        )}
        
        {activeTab === 'bulk' && (
          <BulkInviteInterface team={team} onBulkInvite={handleBulkInvite} />
        )}
        
        {activeTab === 'qr' && (
          <QRCodeAndFlyer team={team} />
        )}
      </div>
      
      <PendingInvitationsList 
        invitations={pendingInvitations}
        onResend={handleResendInvite}
        onCancel={handleCancelInvite}
      />
    </div>
  )
}
```

### **Individual Invite Form**
**File:** `src/components/team-management/IndividualInviteForm.tsx`

```typescript
export function IndividualInviteForm({ team, onInvite }: IndividualInviteProps) {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'player' as const,
    personalMessage: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Generate unique invitation code
    const invitationCode = generateInvitationCode(team.id)
    
    // Create invitation record
    const invitation = await createInvitation({
      teamId: team.id,
      organizationId: team.organizationId,
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: formData.role,
      personalMessage: formData.personalMessage,
      invitationCode,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    })
    
    // Send invitation email
    await sendInvitationEmail(invitation)
    
    onInvite(invitation)
    setFormData({ email: '', firstName: '', lastName: '', role: 'player', personalMessage: '' })
  }

  return (
    <form onSubmit={handleSubmit} className="individual-invite-form bg-gray-50 p-6 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input 
            type="email" 
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role *
          </label>
          <select 
            value={formData.role}
            onChange={e => setFormData({...formData, role: e.target.value as any})}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
          >
            <option value="player">Player</option>
            <option value="coach">Coach</option>
            <option value="parent">Parent</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input 
            type="text"
            value={formData.firstName}
            onChange={e => setFormData({...formData, firstName: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input 
            type="text"
            value={formData.lastName}
            onChange={e => setFormData({...formData, lastName: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Personal Message (Optional)
        </label>
        <textarea 
          value={formData.personalMessage}
          onChange={e => setFormData({...formData, personalMessage: e.target.value})}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
          placeholder="Add a personal message to the invitation..."
        />
      </div>
      
      <button 
        type="submit"
        className="w-full md:w-auto bg-orange-600 text-white py-3 px-6 rounded-md hover:bg-orange-700 transition-colors font-medium"
      >
        Send Invitation
      </button>
    </form>
  )
}
```

---

## 📱 **Phase 4: QR Code & Registration Assets (Week 2)**

### **QR Code and Flyer Component**
**File:** `src/components/team-management/QRCodeAndFlyer.tsx`

```typescript
export function QRCodeAndFlyer({ team }: { team: Team }) {
  const [registrationAssets, setRegistrationAssets] = useState<RegistrationAssets | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    loadRegistrationAssets()
  }, [team.id])

  const loadRegistrationAssets = async () => {
    const assets = await getTeamRegistrationAssets(team.id)
    setRegistrationAssets(assets)
  }

  const regenerateAssets = async () => {
    setIsGenerating(true)
    try {
      const newAssets = await generateRegistrationAssets(team.id, {
        teamName: team.name,
        ageGroup: team.ageGroup,
        level: team.level,
        colors: team.colors
      })
      setRegistrationAssets(newAssets)
    } finally {
      setIsGenerating(false)
    }
  }

  if (!registrationAssets) {
    return <div className="text-center py-8">Loading registration assets...</div>
  }

  return (
    <div className="qr-code-flyer">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Code Section */}
        <div className="qr-code-section">
          <h3 className="text-lg font-semibold mb-4">Registration QR Code</h3>
          <div className="bg-white p-6 rounded-lg border text-center">
            <img 
              src={registrationAssets.qrCodeData}
              alt="Registration QR Code"
              className="mx-auto mb-4"
              width={200}
              height={200}
            />
            <p className="text-sm text-gray-600 mb-4">
              Team members can scan this QR code to register
            </p>
            <div className="space-y-2">
              <button 
                onClick={() => downloadQRCode(registrationAssets.qrCodeData)}
                className="block w-full bg-orange-100 text-orange-700 py-2 px-4 rounded hover:bg-orange-200"
              >
                Download QR Code
              </button>
              <button 
                onClick={() => copyToClipboard(registrationAssets.registrationUrl)}
                className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200"
              >
                Copy Registration Link
              </button>
            </div>
          </div>
        </div>

        {/* Flyer Section */}
        <div className="flyer-section">
          <h3 className="text-lg font-semibold mb-4">Registration Flyer</h3>
          <div className="bg-white p-6 rounded-lg border">
            <div className="flyer-preview mb-4">
              <FlyerPreview team={team} qrCode={registrationAssets.qrCodeData} />
            </div>
            <div className="space-y-2">
              <button 
                onClick={() => downloadFlyer(team.id)}
                className="block w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700"
              >
                Download Flyer (PDF)
              </button>
              <button 
                onClick={regenerateAssets}
                disabled={isGenerating}
                className="block w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 disabled:opacity-50"
              >
                {isGenerating ? 'Regenerating...' : 'Regenerate Assets'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Statistics */}
      <div className="registration-stats mt-8">
        <h3 className="text-lg font-semibold mb-4">Registration Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard 
            label="Total Registrations"
            value={registrationAssets.stats.totalRegistrations}
            color="blue"
          />
          <StatCard 
            label="Players"
            value={registrationAssets.stats.players}
            color="green"
          />
          <StatCard 
            label="Parents"
            value={registrationAssets.stats.parents}
            color="purple"
          />
          <StatCard 
            label="Coaches"
            value={registrationAssets.stats.coaches}
            color="orange"
          />
        </div>
      </div>
    </div>
  )
}
```

---

## 🔄 **Phase 5: Team HQ to Club OS Upgrade Flow (Week 3)**

### **Upgrade Flow Component**
**File:** `src/components/upgrades/TeamHQToClubOSUpgrade.tsx`

```typescript
export function TeamHQToClubOSUpgrade({ team }: { team: Team }) {
  const [upgradeStep, setUpgradeStep] = useState(1)
  const [upgradeData, setUpgradeData] = useState({
    organizationName: `${team.name} Club`,
    additionalTeams: 2, // Need 3 total minimum
    keepExistingTeam: true,
    transferCoachesToDirector: true
  })

  const upgradeSteps = [
    { id: 1, title: 'Upgrade Overview', component: <UpgradeOverview /> },
    { id: 2, title: 'Organization Setup', component: <OrganizationSetup /> },
    { id: 3, title: 'Team Configuration', component: <TeamConfiguration /> },
    { id: 4, title: 'Pricing & Confirmation', component: <UpgradeConfirmation /> }
  ]

  const handleUpgradeComplete = async () => {
    try {
      // 1. Create organization structure
      const organization = await createOrganizationFromTeam(team.id, upgradeData)
      
      // 2. Move existing team to organization
      await moveTeamToOrganization(team.id, organization.id)
      
      // 3. Create additional teams
      const newTeams = await createAdditionalTeams(organization.id, upgradeData.additionalTeams)
      
      // 4. Update user roles (coach → director)
      await upgradeUserRole(team.coachId, organization.id, 'director')
      
      // 5. Initiate MemberPress subscription change
      await initiateMemberPressUpgrade(team.subscriptionId, 'club_os')
      
      // 6. Redirect to new organization dashboard
      router.push(`/organizations/${organization.id}/dashboard`)
    } catch (error) {
      console.error('Upgrade failed:', error)
      setUpgradeError(error.message)
    }
  }

  return (
    <div className="upgrade-flow max-w-4xl mx-auto">
      <UpgradeProgress currentStep={upgradeStep} totalSteps={upgradeSteps.length} />
      
      <div className="upgrade-content bg-white rounded-lg shadow-lg p-8">
        {upgradeSteps.find(s => s.id === upgradeStep)?.component}
      </div>
      
      <UpgradeNavigation 
        currentStep={upgradeStep}
        totalSteps={upgradeSteps.length}
        onNext={() => setUpgradeStep(s => s + 1)}
        onPrevious={() => setUpgradeStep(s => s - 1)}
        onComplete={handleUpgradeComplete}
        upgradeData={upgradeData}
      />
    </div>
  )
}
```

---

## 🗃️ **Database Schema Updates**

### **Team Enhancement Tables**
```sql
-- Enhanced team customization
ALTER TABLE teams ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7) DEFAULT '#000000';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(7) DEFAULT '#ffffff';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS age_group VARCHAR(10);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS level VARCHAR(20);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS season VARCHAR(50);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS practice_location TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS state VARCHAR(50);

-- Team invitations tracking
CREATE TABLE team_invitations (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id) NOT NULL,
  organization_id INTEGER REFERENCES organizations(id),
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) NOT NULL CHECK (role IN ('player', 'coach', 'parent')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  invitation_code VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  personal_message TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Upgrade history tracking
CREATE TABLE upgrade_history (
  id SERIAL PRIMARY KEY,
  original_team_id INTEGER REFERENCES teams(id),
  new_organization_id INTEGER REFERENCES organizations(id),
  upgrade_type VARCHAR(50) NOT NULL,
  original_subscription_type VARCHAR(50),
  new_subscription_type VARCHAR(50),
  upgrade_data JSONB, -- Store upgrade configuration
  completed_at TIMESTAMP DEFAULT NOW(),
  upgraded_by INTEGER REFERENCES users(id)
);

-- Registration statistics
CREATE TABLE registration_stats (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id) NOT NULL,
  organization_id INTEGER REFERENCES organizations(id),
  total_registrations INTEGER DEFAULT 0,
  players_count INTEGER DEFAULT 0,
  parents_count INTEGER DEFAULT 0,
  coaches_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_team_invitations_team ON team_invitations(team_id);
CREATE INDEX idx_team_invitations_code ON team_invitations(invitation_code);
CREATE INDEX idx_team_invitations_status ON team_invitations(status);
CREATE INDEX idx_upgrade_history_team ON upgrade_history(original_team_id);
```

---

## 🎯 **Dashboard User Experience Flows**

### **Director Experience (Club OS)**
1. **Login → Organization Dashboard**
   - See all teams at a glance with key stats
   - Quick actions: Add team, view reports, manage settings

2. **Team Management**
   - Click team card → Team details and customization
   - Manage coaches, players, and parents for each team
   - Set team-specific settings and branding

3. **Organization Growth**
   - Add new teams (within subscription limits)
   - Upgrade subscription for more teams
   - Cross-team competitions and leaderboards

### **Coach Experience (Team HQ)**
1. **Login → Team Dashboard**
   - Single team focus with comprehensive tools
   - Practice planning, player management, Skills Academy

2. **Team Customization**
   - Setup wizard for team branding and details
   - Generate registration assets and invite members
   - Manage roster and parent communications

3. **Growth Options**
   - Upgrade to Club OS for multiple teams
   - Add assistant coaches and administrative helpers

---

## 🚀 **Implementation Timeline**

### **Week 1: Core Dashboards**
- [ ] Organization dashboard for Directors
- [ ] Team dashboard for Coaches  
- [ ] Basic team customization interface
- [ ] User role verification and security

### **Week 2: Invitations & Assets**
- [ ] Member invitation system (individual and bulk)
- [ ] QR code and flyer generation
- [ ] Registration asset management
- [ ] Invitation tracking and resending

### **Week 3: Advanced Features**
- [ ] Team scaling and organization growth
- [ ] Team HQ → Club OS upgrade flow
- [ ] Analytics and reporting dashboard
- [ ] Cross-team management features

---

## 🔗 **Integration Requirements**

### **MemberPress Integration**
- Monitor subscription changes and limits
- Handle upgrade flows and billing transitions
- Sync team/organization limits with subscription tiers

### **Registration System**
- Connect invitation codes to user registration
- Assign roles during signup process
- Trigger guarantee period start on first registration

### **Skills Academy Integration**
- Team-based progress tracking and leaderboards
- Coach assignment of workouts to players
- Organization-wide competitions and challenges

---

## 🎯 **Success Criteria**

### **Director Dashboard Must-Haves:**
- [ ] View all organization teams in grid layout
- [ ] Quick stats: players, coaches, guarantee period
- [ ] Add new teams (within subscription limits)
- [ ] Individual team management access
- [ ] Organization-wide settings and branding

### **Team Customization Must-Haves:**
- [ ] 4-step setup wizard with validation
- [ ] Team branding (name, colors, logo, age group, level)
- [ ] Registration asset generation (QR codes, flyers)
- [ ] Member invitation system with role assignment
- [ ] Roster management and statistics

### **Upgrade Flow Must-Haves:**
- [ ] Team HQ can upgrade to Club OS seamlessly  
- [ ] Existing team data preserved during upgrade
- [ ] Coach automatically becomes Director
- [ ] Additional teams created as placeholders
- [ ] MemberPress subscription updated accordingly

---

## 🟠 **Agent Color Theme**
Use Orange (#F97316) for all team and organization management UI elements, buttons, and active states.