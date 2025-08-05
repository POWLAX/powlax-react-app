# POWLAX Dashboard Data Flow Architecture

## 🏗️ Architecture Overview

This document defines the complete data flow architecture for all role-based dashboards in the POWLAX application. Each role (Director, Coach, Player, Parent) has specific data requirements, access patterns, and real-time update needs.

## 📊 Data Flow Principles

### Core Architecture Decisions
1. **Optimistic UI Updates**: Immediate feedback with background sync
2. **Smart Caching**: Role-specific cache strategies
3. **Real-time Subscriptions**: Live updates for critical data
4. **Progressive Loading**: Load essential data first, details on demand
5. **Offline Support**: Critical features work without connection

### Technology Stack
- **Data Fetching**: TanStack Query (React Query) for caching and synchronization
- **State Management**: Zustand for global state, React Context for auth
- **Real-time**: Supabase Realtime for live updates
- **Type Safety**: TypeScript with strict mode
- **Validation**: Zod schemas for runtime validation

---

## 🔄 Universal Data Flow Pattern

```typescript
// Base dashboard data flow
interface DashboardDataFlow<T> {
  // 1. Initial data fetch
  fetchInitialData: () => Promise<T>;
  
  // 2. Cache management
  cacheStrategy: CacheConfig;
  
  // 3. Real-time subscriptions
  subscriptions?: RealtimeConfig[];
  
  // 4. Optimistic updates
  mutations: MutationConfig[];
  
  // 5. Error handling
  errorBoundary: ErrorStrategy;
}
```

### Query Patterns with Security Context
```typescript
// Efficient query pattern with React Query and security context
export const useDashboardData = <T>(
  role: UserRole,
  userId: string,
  options?: QueryOptions
) => {
  return useQuery({
    queryKey: ['dashboard', role, userId],
    queryFn: async () => {
      // Get user's full security context
      const context = await getUserSecurityContext(userId);
      
      // Fetch data based on role and context
      return fetchDashboardData(role, userId, {
        organizationId: context.organizationId,
        teamIds: context.teamIds,
        childIds: context.childIds // For parents
      });
    },
    staleTime: role === 'director' ? 30000 : 60000, // Directors get fresher data
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: role === 'coach' ? 60000 : false, // Coaches get auto-refresh
    ...options,
  });
};

// Security context helper
export const getUserSecurityContext = async (userId: string) => {
  const { data: user } = await supabase
    .from('users')
    .select(`
      *,
      organization:organizations(*),
      teams:team_members(
        team:teams(*)
      ),
      children:parent_child_relationships(
        child:users(*)
      )
    `)
    .eq('id', userId)
    .single();
    
  return {
    userId,
    roles: user.roles,
    organizationId: user.organization_id,
    teamIds: user.teams?.map(tm => tm.team.id) || [],
    childIds: user.children?.map(rel => rel.child.id) || []
  };
};
```

---

## 👨‍🏫 Coach Dashboard Architecture

### Data Requirements
```typescript
interface CoachDashboardData {
  // User & Subscription
  profile: CoachProfile;
  subscription: SubscriptionStatus;
  
  // Team Management
  teams: Team[];
  activeTeam: TeamDetail;
  roster: Player[];
  
  // Practice Planning
  recentPracticePlans: PracticePlan[];
  upcomingPractices: ScheduledPractice[];
  favoriteD drills: Drill[];
  
  // Analytics
  teamStats: TeamStatistics;
  drillUsage: DrillAnalytics;
  playerProgress: PlayerProgressSummary[];
  
  // Quick Actions
  quickActions: QuickAction[];
  notifications: Notification[];
}
```

### Data Fetching Strategy
```typescript
// Parallel data fetching for coach dashboard
export const fetchCoachDashboard = async (
  coachId: string,
  teamId: string
): Promise<CoachDashboardData> => {
  // Parallel fetch all required data
  const [
    profile,
    subscription,
    teams,
    practices,
    roster,
    stats,
    notifications
  ] = await Promise.all([
    fetchCoachProfile(coachId),
    fetchSubscriptionStatus(coachId),
    fetchCoachTeams(coachId),
    fetchRecentPractices(teamId, { limit: 5 }),
    fetchTeamRoster(teamId),
    fetchTeamStats(teamId),
    fetchNotifications(coachId, { unreadOnly: true })
  ]);
  
  // Secondary fetches based on primary data
  const [drillUsage, favoriteD rills] = await Promise.all([
    fetchDrillUsage(practices.map(p => p.id)),
    fetchFavoriteDrills(coachId)
  ]);
  
  return {
    profile,
    subscription,
    teams,
    activeTeam: teams.find(t => t.id === teamId)!,
    roster,
    recentPracticePlans: practices,
    upcomingPractices: filterUpcoming(practices),
    favoriteD rills,
    teamStats: stats,
    drillUsage,
    playerProgress: calculateProgress(roster, stats),
    quickActions: generateQuickActions(subscription, teams),
    notifications
  };
};
```

### Real-time Subscriptions
```typescript
// Coach dashboard real-time updates
export const useCoachRealtimeUpdates = (teamId: string) => {
  useEffect(() => {
    // Subscribe to team roster changes
    const rosterSub = supabase
      .channel(`team-roster-${teamId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'team_members',
        filter: `team_id=eq.${teamId}`
      }, handleRosterChange)
      .subscribe();
    
    // Subscribe to practice plan updates
    const practiceSub = supabase
      .channel(`team-practices-${teamId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'practice_plans',
        filter: `team_id=eq.${teamId}`
      }, handlePracticeUpdate)
      .subscribe();
    
    return () => {
      supabase.removeChannel(rosterSub);
      supabase.removeChannel(practiceSub);
    };
  }, [teamId]);
};
```

### Component Architecture
```typescript
// Coach Dashboard component structure
<CoachDashboard>
  <DashboardHeader>
    <UserGreeting />
    <SubscriptionStatus />
    <TeamSelector />
  </DashboardHeader>
  
  <DashboardGrid>
    <QuickActionsCard />
    <TeamStatsCard />
    <RecentPracticesCard />
    <UpcomingScheduleCard />
    <RosterOverviewCard />
    <DrillUsageCard />
  </DashboardGrid>
  
  <NotificationBar />
</CoachDashboard>
```

---

## 🏃 Player Dashboard Architecture

### Data Requirements
```typescript
interface PlayerDashboardData {
  // Profile & Progress
  profile: PlayerProfile;
  overallProgress: ProgressMetrics;
  
  // Skills Academy
  currentWorkout: Workout | null;
  workoutHistory: CompletedWorkout[];
  skillMastery: SkillMasteryMap;
  nextChallenges: Challenge[];
  
  // Gamification
  points: PointsBalance;
  badges: Badge[];
  recentAchievements: Achievement[];
  leaderboardPosition: LeaderboardEntry;
  
  // Team Integration
  team: TeamInfo | null;
  teamSchedule: TeamEvent[];
  coachAnnouncements: Announcement[];
  
  // Personal Stats
  personalBests: PersonalRecord[];
  trainingStreak: StreakData;
}
```

### Progressive Data Loading
```typescript
// Player dashboard with progressive enhancement
export const usePlayerDashboard = (playerId: string) => {
  // Critical data - load immediately
  const { data: coreData, isLoading: coreLoading } = useQuery({
    queryKey: ['player-core', playerId],
    queryFn: () => fetchPlayerCore(playerId),
    staleTime: 30000,
  });
  
  // Secondary data - load after core
  const { data: academyData } = useQuery({
    queryKey: ['player-academy', playerId],
    queryFn: () => fetchAcademyProgress(playerId),
    enabled: !!coreData,
    staleTime: 60000,
  });
  
  // Gamification data - can be stale
  const { data: gamificationData } = useQuery({
    queryKey: ['player-gamification', playerId],
    queryFn: () => fetchGamificationData(playerId),
    enabled: !!coreData,
    staleTime: 300000, // 5 minutes
  });
  
  return {
    coreData,
    academyData,
    gamificationData,
    isLoading: coreLoading,
  };
};
```

### Skills Academy Data Flow
```typescript
// Real-time workout tracking
export const useWorkoutTracking = (workoutId: string, playerId: string) => {
  const queryClient = useQueryClient();
  
  // Optimistic update for drill completion
  const completeDrill = useMutation({
    mutationFn: (drillId: string) => 
      markDrillComplete(workoutId, drillId, playerId),
    
    onMutate: async (drillId) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries(['workout', workoutId]);
      
      // Snapshot previous value
      const previous = queryClient.getQueryData(['workout', workoutId]);
      
      // Optimistically update
      queryClient.setQueryData(['workout', workoutId], (old: any) => ({
        ...old,
        completedD rills: [...old.completedD rills, drillId],
        progress: calculateProgress(old.completedD rills.length + 1, old.totalDrills)
      }));
      
      return { previous };
    },
    
    onError: (err, drillId, context) => {
      // Rollback on error
      queryClient.setQueryData(['workout', workoutId], context.previous);
    },
    
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries(['workout', workoutId]);
      queryClient.invalidateQueries(['player-academy', playerId]);
    }
  });
  
  return { completeDrill };
};
```

---

## 👪 Parent Dashboard Architecture

### Data Requirements
```typescript
interface ParentDashboardData {
  // Parent Profile
  profile: ParentProfile;
  subscription: FamilySubscription;
  
  // Children Management
  children: ChildAccount[];
  childrenProgress: Map<string, ChildProgress>;
  
  // Per-Child Data
  childSchedules: Map<string, TeamEvent[]>;
  childAchievements: Map<string, Achievement[]>;
  childCoaches: Map<string, CoachContact>;
  
  // Family Overview
  familyActivity: ActivityTimeline;
  upcomingEvents: FamilyEvent[];
  
  // Support Resources
  parentResources: Resource[];
  supportQuizResults: QuizResult[];
}
```

### Multi-Child Data Aggregation
```typescript
// Efficient multi-child data fetching
export const useParentDashboard = (parentId: string) => {
  // First, get list of children
  const { data: children } = useQuery({
    queryKey: ['parent-children', parentId],
    queryFn: () => fetchChildren(parentId),
  });
  
  // Then, fetch data for all children in parallel
  const { data: childrenData } = useQuery({
    queryKey: ['children-data', children?.map(c => c.id)],
    queryFn: async () => {
      if (!children?.length) return null;
      
      // Parallel fetch for each child
      const childDataPromises = children.map(async (child) => {
        const [progress, schedule, achievements, coach] = await Promise.all([
          fetchChildProgress(child.id),
          fetchChildSchedule(child.teamId),
          fetchChildAchievements(child.id),
          fetchChildCoach(child.teamId)
        ]);
        
        return {
          childId: child.id,
          progress,
          schedule,
          achievements,
          coach
        };
      });
      
      const results = await Promise.all(childDataPromises);
      
      // Transform to maps for easy access
      return {
        progressMap: new Map(results.map(r => [r.childId, r.progress])),
        scheduleMap: new Map(results.map(r => [r.childId, r.schedule])),
        achievementsMap: new Map(results.map(r => [r.childId, r.achievements])),
        coachMap: new Map(results.map(r => [r.childId, r.coach]))
      };
    },
    enabled: !!children?.length,
    staleTime: 120000, // 2 minutes
  });
  
  return { children, childrenData };
};
```

### Family Activity Timeline
```typescript
// Aggregated family activity stream
export const useFamilyActivity = (parentId: string, childIds: string[]) => {
  return useQuery({
    queryKey: ['family-activity', parentId, ...childIds],
    queryFn: async () => {
      // Fetch activities for all family members
      const activities = await Promise.all([
        fetchParentActivity(parentId),
        ...childIds.map(id => fetchChildActivity(id))
      ]);
      
      // Merge and sort by timestamp
      const merged = activities
        .flat()
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 50); // Limit to recent 50
      
      return merged;
    },
    refetchInterval: 60000, // Refresh every minute
  });
};
```

---

## 🏢 Director Dashboard Architecture

### Data Requirements
```typescript
interface DirectorDashboardData {
  // Program Overview
  profile: DirectorProfile;
  organization: Organization;
  
  // Multi-Team Management
  teams: TeamSummary[];
  teamDetails: Map<string, TeamDetail>;
  
  // Aggregate Statistics
  programStats: {
    totalPlayers: number;
    totalCoaches: number;
    activePractices: number;
    subscriptionRevenue: number;
  };
  
  // Analytics
  usageMetrics: UsageAnalytics;
  performanceMetrics: PerformanceAnalytics;
  engagementMetrics: EngagementAnalytics;
  
  // Coach Management
  coaches: CoachSummary[];
  coachPerformance: Map<string, CoachMetrics>;
  pendingCertifications: Certification[];
  
  // Financial Overview
  subscriptionAnalytics: SubscriptionMetrics;
  revenueProjections: RevenueData;
}
```

### Hierarchical Data Loading
```typescript
// Director dashboard with drill-down capability
export const useDirectorDashboard = (directorId: string, orgId: string) => {
  // Top-level organization data
  const { data: orgData } = useQuery({
    queryKey: ['director-org', orgId],
    queryFn: () => fetchOrganizationData(orgId),
    staleTime: 60000,
  });
  
  // Teams summary with pagination
  const {
    data: teamsData,
    fetchNextPage,
    hasNextPage
  } = useInfiniteQuery({
    queryKey: ['director-teams', orgId],
    queryFn: ({ pageParam = 0 }) => 
      fetchTeamsSummary(orgId, { offset: pageParam, limit: 20 }),
    getNextPageParam: (lastPage, pages) => 
      lastPage.hasMore ? pages.length * 20 : undefined,
  });
  
  // Aggregate analytics
  const { data: analytics } = useQuery({
    queryKey: ['director-analytics', orgId],
    queryFn: () => fetchProgramAnalytics(orgId),
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000,
  });
  
  // Real-time metrics
  const metrics = useRealtimeMetrics(orgId);
  
  return {
    orgData,
    teams: teamsData?.pages.flatMap(p => p.teams) ?? [],
    analytics,
    metrics,
    loadMoreTeams: fetchNextPage,
    hasMoreTeams: hasNextPage,
  };
};
```

### Analytics Aggregation
```typescript
// Complex analytics queries with caching
export const useProgramAnalytics = (orgId: string, dateRange: DateRange) => {
  const queryClient = useQueryClient();
  
  // Cache key includes date range
  const cacheKey = ['analytics', orgId, dateRange.start, dateRange.end];
  
  return useQuery({
    queryKey: cacheKey,
    queryFn: async () => {
      // Check if we have recent data
      const cached = queryClient.getQueryData(cacheKey);
      if (cached && isDataFresh(cached, 300000)) {
        return cached;
      }
      
      // Parallel fetch all metrics
      const [
        usage,
        performance,
        engagement,
        financial
      ] = await Promise.all([
        fetchUsageMetrics(orgId, dateRange),
        fetchPerformanceMetrics(orgId, dateRange),
        fetchEngagementMetrics(orgId, dateRange),
        fetchFinancialMetrics(orgId, dateRange)
      ]);
      
      // Compute derived metrics
      const insights = computeInsights({
        usage,
        performance,
        engagement,
        financial
      });
      
      return {
        usage,
        performance,
        engagement,
        financial,
        insights,
        generatedAt: new Date()
      };
    },
    staleTime: 300000, // 5 minutes
    cacheTime: 1800000, // 30 minutes
  });
};
```

### Real-time Monitoring
```typescript
// Director real-time monitoring dashboard
export const useRealtimeMetrics = (orgId: string) => {
  const [metrics, setMetrics] = useState<RealtimeMetrics>({
    activeUsers: 0,
    activePractices: 0,
    ongoingWorkouts: 0,
  });
  
  useEffect(() => {
    // Subscribe to user activity
    const userChannel = supabase
      .channel(`org-users-${orgId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = userChannel.presenceState();
        setMetrics(prev => ({
          ...prev,
          activeUsers: Object.keys(state).length
        }));
      })
      .subscribe();
    
    // Subscribe to practice sessions
    const practiceChannel = supabase
      .channel(`org-practices-${orgId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'practice_sessions',
        filter: `org_id=eq.${orgId}`
      }, (payload) => {
        setMetrics(prev => ({
          ...prev,
          activePractices: prev.activePractices + 1
        }));
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(userChannel);
      supabase.removeChannel(practiceChannel);
    };
  }, [orgId]);
  
  return metrics;
};
```

---

## 🔄 State Management Architecture

### Global State Structure
```typescript
// Zustand store for dashboard state
interface DashboardStore {
  // User & Auth
  user: User | null;
  role: UserRole | null;
  subscription: SubscriptionStatus | null;
  
  // UI State
  sidebarOpen: boolean;
  activeView: DashboardView;
  notifications: Notification[];
  
  // Cache Management
  lastFetch: Record<string, Date>;
  
  // Actions
  setUser: (user: User) => void;
  toggleSidebar: () => void;
  addNotification: (notification: Notification) => void;
  clearCache: (key?: string) => void;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  user: null,
  role: null,
  subscription: null,
  sidebarOpen: true,
  activeView: 'overview',
  notifications: [],
  lastFetch: {},
  
  setUser: (user) => set({ 
    user, 
    role: user.roles[0] as UserRole 
  }),
  
  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen 
  })),
  
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications].slice(0, 10)
  })),
  
  clearCache: (key) => set((state) => ({
    lastFetch: key 
      ? omit(state.lastFetch, [key])
      : {}
  })),
}));
```

### Context Providers
```typescript
// Dashboard context provider hierarchy
export const DashboardProviders = ({ children }: { children: ReactNode }) => {
  return (
    <WordPressAuthProvider>
      <QueryClientProvider client={queryClient}>
        <DashboardDataProvider>
          <RealtimeProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </RealtimeProvider>
        </DashboardDataProvider>
      </QueryClientProvider>
    </WordPressAuthProvider>
  );
};
```

---

## ⚡ Performance Optimizations

### Query Optimization
```typescript
// Batched queries for related data
export const batchedQueries = {
  // Batch drill queries
  drills: batchRequests<string, Drill>(
    async (drillIds) => {
      const { data } = await supabase
        .from('drills')
        .select('*')
        .in('id', drillIds);
      return data;
    },
    { maxBatchSize: 100, delayMs: 10 }
  ),
  
  // Batch user queries
  users: batchRequests<string, User>(
    async (userIds) => {
      const { data } = await supabase
        .from('users')
        .select('id, name, avatar_url')
        .in('id', userIds);
      return data;
    },
    { maxBatchSize: 50, delayMs: 10 }
  ),
};
```

### Prefetching Strategy
```typescript
// Intelligent prefetching based on user behavior
export const usePrefetchDashboard = (role: UserRole) => {
  const queryClient = useQueryClient();
  
  // Prefetch likely next actions
  useEffect(() => {
    switch (role) {
      case 'coach':
        // Coaches likely to view practice planner
        queryClient.prefetchQuery({
          queryKey: ['drills-library'],
          queryFn: fetchDrillsLibrary,
          staleTime: 3600000, // 1 hour
        });
        break;
        
      case 'player':
        // Players likely to start workout
        queryClient.prefetchQuery({
          queryKey: ['available-workouts'],
          queryFn: fetchAvailableWorkouts,
          staleTime: 1800000, // 30 minutes
        });
        break;
    }
  }, [role, queryClient]);
};
```

### Lazy Loading Components
```typescript
// Dynamic imports for role-specific components
const DashboardComponents = {
  coach: lazy(() => import('./CoachDashboard')),
  player: lazy(() => import('./PlayerDashboard')),
  parent: lazy(() => import('./ParentDashboard')),
  director: lazy(() => import('./DirectorDashboard')),
};

export const RoleDashboard = ({ role }: { role: UserRole }) => {
  const Component = DashboardComponents[role];
  
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Component />
    </Suspense>
  );
};
```

---

## 🚨 Error Handling & Recovery

### Error Boundary Strategy
```typescript
// Dashboard-specific error boundary
export class DashboardErrorBoundary extends Component<
  { children: ReactNode; role: UserRole },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to monitoring service
    logError('dashboard_error', {
      error: error.message,
      stack: error.stack,
      role: this.props.role,
      errorInfo,
    });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <DashboardErrorFallback 
          error={this.state.error}
          role={this.props.role}
          retry={() => window.location.reload()}
        />
      );
    }
    
    return this.props.children;
  }
}
```

### Offline Support
```typescript
// Offline-first data strategy
export const useOfflineDashboard = () => {
  const isOnline = useOnlineStatus();
  const queryClient = useQueryClient();
  
  // Switch to offline mode
  useEffect(() => {
    if (!isOnline) {
      // Use cached data only
      queryClient.setDefaultOptions({
        queries: {
          staleTime: Infinity,
          cacheTime: Infinity,
          refetchOnMount: false,
          refetchOnWindowFocus: false,
          refetchOnReconnect: true,
        },
      });
    }
  }, [isOnline, queryClient]);
  
  // Queue mutations when offline
  const queuedMutations = useQueuedMutations();
  
  return { isOnline, queuedMutations };
};
```

---

## 📝 Implementation Checklist

### Phase 1: Core Infrastructure
- [ ] Set up React Query with proper configuration
- [ ] Implement Zustand store for global state
- [ ] Create base dashboard layout components
- [ ] Set up error boundaries and logging

### Phase 2: Role-Specific Implementation
- [ ] Coach Dashboard with real-time updates
- [ ] Player Dashboard with progressive loading
- [ ] Parent Dashboard with multi-child aggregation
- [ ] Director Dashboard with analytics

### Phase 3: Performance & Polish
- [ ] Implement prefetching strategies
- [ ] Add offline support
- [ ] Optimize bundle sizes with code splitting
- [ ] Add comprehensive error handling

### Phase 4: Testing & Monitoring
- [ ] Unit tests for data fetching hooks
- [ ] Integration tests for dashboard flows
- [ ] Performance testing with large datasets
- [ ] Set up monitoring and analytics

---

## 🔗 Related Documentation
- [Security Architecture](/docs/technical/security-architecture.md)
- [API Documentation](/docs/api/README.md)
- [Component Library](/docs/components/README.md)
- [Testing Strategy](/docs/testing/README.md)