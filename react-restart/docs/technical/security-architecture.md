# POWLAX Security & Performance Architecture

## 🔐 Security-First Development Mandate

### CRITICAL: Security Review Requirements
**Every new feature, component, or modification MUST undergo security review using this document as reference.**

When implementing ANY new functionality, developers/agents must:
1. Reference this security architecture document
2. Complete the Security Checklist (Section 9)
3. Implement all applicable security patterns
4. Document any security decisions or exceptions

### AI Agent Security Prompt
When any AI agent (Dev, UX, Analyst, etc.) builds new features, include this prompt:
```
Before implementing this feature, review /docs/technical/security-architecture.md and ensure:
1. All database queries use RLS policies
2. API endpoints are properly authenticated and rate-limited
3. User inputs are validated and sanitized
4. Sensitive data is properly encrypted
5. The feature follows the principle of least privilege
6. Any new security considerations are documented
```

---

## 📋 Table of Contents
1. [Security Principles](#security-principles)
2. [Authentication & Authorization](#authentication--authorization)
3. [Row-Level Security (RLS) Patterns](#row-level-security-patterns)
4. [API Security & Rate Limiting](#api-security--rate-limiting)
5. [Data Protection & Encryption](#data-protection--encryption)
6. [Performance Optimization](#performance-optimization)
7. [Security Monitoring & Logging](#security-monitoring--logging)
8. [Incident Response Plan](#incident-response-plan)
9. [Security Checklist for New Features](#security-checklist-for-new-features)

---

## 1. Security Principles

### Core Security Tenets
1. **Defense in Depth**: Multiple layers of security controls
2. **Least Privilege**: Users/components only get minimum required access
3. **Zero Trust**: Verify everything, trust nothing
4. **Fail Secure**: System fails to a secure state
5. **Security by Design**: Security built-in, not bolted-on

### POWLAX-Specific Security Requirements
- **Family Account Isolation**: Children cannot access parent data or vice versa
- **Team Boundaries**: Strict isolation between different teams
- **Subscription Gating**: Features locked behind active subscriptions
- **Content Protection**: Drill videos, PDFs, and strategies are premium content
- **Age-Appropriate Access**: Children cannot access forums/messaging

---

## 2. Authentication & Authorization

### WordPress Bridge Security
```typescript
// Authentication flow security checks
interface AuthSecurityChecks {
  // 1. Validate WordPress credentials
  validateWordPressAuth: (username: string, password: string) => Promise<boolean>;
  
  // 2. Check MemberPress subscription
  validateSubscription: (userId: number) => Promise<SubscriptionStatus>;
  
  // 3. Generate secure session token
  generateSecureToken: (user: WordPressUser) => string;
  
  // 4. Validate all requests
  validateRequest: (token: string) => Promise<RequestValidation>;
}
```

### JWT Token Security
```typescript
// Token configuration
const tokenConfig = {
  secret: process.env.JWT_SECRET!, // Min 32 characters
  expiresIn: '24h',
  algorithm: 'HS256',
  issuer: 'powlax.com',
  audience: 'powlax-app'
};

// Token payload structure
interface SecureTokenPayload {
  userId: string;
  wordpressId: number;
  roles: string[];
  subscriptions: string[];
  iat: number;
  exp: number;
  jti: string; // Unique token ID for revocation
}
```

### Role-Based Access Control (RBAC)
```typescript
enum UserRole {
  DIRECTOR = 'director',
  COACH = 'coach',
  PLAYER = 'player',
  PARENT = 'parent'
}

// Permission matrix
const permissions = {
  [UserRole.DIRECTOR]: [
    'view_all_teams',
    'manage_coaches',
    'view_analytics',
    'manage_subscriptions'
  ],
  [UserRole.COACH]: [
    'manage_own_team',
    'create_practice_plans',
    'view_team_players',
    'access_drill_library'
  ],
  [UserRole.PLAYER]: [
    'view_own_progress',
    'access_skills_academy',
    'view_team_schedule'
  ],
  [UserRole.PARENT]: [
    'view_children_progress',
    'manage_children_accounts',
    'view_team_communications'
  ]
};
```

---

## 3. Row-Level Security (RLS) Patterns

### Universal RLS Policies

#### User Profile Security
```sql
-- Users can only see their own profile
CREATE POLICY "users_select_own" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Parents can view their children's profiles
CREATE POLICY "parents_view_children" ON user_profiles
  FOR SELECT USING (
    auth.uid() IN (
      SELECT parent_id FROM user_profiles WHERE id = user_profiles.id
    )
  );

-- Coaches can view their team members
CREATE POLICY "coaches_view_team_members" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm1
      JOIN team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = auth.uid() 
      AND tm1.role = 'coach'
      AND tm2.user_id = user_profiles.id
    )
  );
```

#### Team Access Security
```sql
-- Team visibility based on membership
CREATE POLICY "team_member_access" ON teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = teams.id
      AND user_id = auth.uid()
    )
  );

-- Only coaches and directors can modify teams
CREATE POLICY "team_modification" ON teams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = teams.id
      AND user_id = auth.uid()
      AND role IN ('coach', 'director')
    )
  );
```

#### Practice Plan Security
```sql
-- Coaches can CRUD their own practice plans
CREATE POLICY "coach_own_practices" ON practice_plans
  FOR ALL USING (
    coach_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = practice_plans.team_id
      AND user_id = auth.uid()
      AND role = 'coach'
    )
  );

-- Team members can view submitted practice plans
CREATE POLICY "team_view_practices" ON practice_plans
  FOR SELECT USING (
    status = 'submitted'
    AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = practice_plans.team_id
      AND user_id = auth.uid()
    )
  );
```

#### Content Access Security
```sql
-- Drills require active subscription
CREATE POLICY "drills_subscription_required" ON drills
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_subscriptions
      WHERE wordpress_user_id = (
        SELECT wordpress_id FROM users WHERE id = auth.uid()
      )
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

-- Age-appropriate content filtering
CREATE POLICY "age_appropriate_drills" ON drills
  FOR SELECT USING (
    -- Complex age band checking based on user's team age band
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN teams t ON tm.team_id = t.id
      WHERE tm.user_id = auth.uid()
      AND (
        -- Check if drill matches team's age band
        (t.age_band_id = '8U' AND drills.do_it_ages LIKE '%6%' OR drills.do_it_ages LIKE '%7%' OR drills.do_it_ages LIKE '%8%')
        OR (t.age_band_id = '10U' AND drills.do_it_ages LIKE '%8%' OR drills.do_it_ages LIKE '%9%' OR drills.do_it_ages LIKE '%10%')
        -- Add more age band checks
      )
    )
  );
```

### Critical Security Policies

#### Family Account Isolation
```sql
-- Children cannot access parent accounts
CREATE POLICY "child_account_isolation" ON user_profiles
  FOR ALL USING (
    -- If user is a child, they can only access their own profile
    CASE 
      WHEN parent_id IS NOT NULL THEN id = auth.uid()
      ELSE true
    END
  );

-- Children cannot use communication features
CREATE POLICY "child_no_messaging" ON messages
  FOR ALL USING (
    NOT EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND parent_id IS NOT NULL
    )
  );
```

---

## 4. API Security & Rate Limiting

### API Gateway Security
```typescript
// middleware/security.ts
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Base security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://player.vimeo.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://powlax.com", "wss://"],
      frameSrc: ["https://player.vimeo.com", "https://powlax.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});
```

### Rate Limiting Strategy
```typescript
// Rate limit configurations by endpoint type
const rateLimits = {
  // Authentication endpoints - strict limits
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many login attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  }),
  
  // API endpoints - standard limits
  api: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    keyGenerator: (req) => req.user?.id || req.ip,
  }),
  
  // Heavy operations - strict limits
  heavy: rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // 10 requests per 5 minutes
    skip: (req) => req.user?.role === 'director', // Directors get higher limits
  }),
};
```

### API Input Validation
```typescript
// validation/schemas.ts
import { z } from 'zod';

// Input validation schemas
export const schemas = {
  // Practice plan creation
  createPracticePlan: z.object({
    name: z.string().min(1).max(100),
    date: z.string().datetime(),
    duration: z.number().min(15).max(180), // 15-180 minutes
    drillIds: z.array(z.string().uuid()).max(20), // Max 20 drills
    notes: z.string().max(1000).optional(),
  }),
  
  // User input sanitization
  userInput: z.object({
    text: z.string()
      .trim()
      .min(1)
      .max(500)
      .regex(/^[a-zA-Z0-9\s\-.,!?'"]+$/, 'Invalid characters'),
  }),
};

// Validation middleware
export function validate(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      res.status(400).json({ error: 'Invalid input data' });
    }
  };
}
```

### CORS Configuration
```typescript
// CORS security configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    const allowedOrigins = [
      'https://powlax.com',
      'https://app.powlax.com',
      process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
```

---

## 5. Data Protection & Encryption

### Sensitive Data Handling
```typescript
// Encryption utilities
import crypto from 'crypto';

class DataProtection {
  private algorithm = 'aes-256-gcm';
  private key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  
  // Encrypt sensitive data before storage
  encrypt(text: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }
  
  // Decrypt data for authorized access
  decrypt(encryptedData: EncryptedData): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### PII Protection
```typescript
// Personal Identifiable Information handling
const piiFields = [
  'email',
  'phone',
  'address',
  'dateOfBirth',
  'parentEmail',
  'emergencyContact',
];

// Middleware to redact PII in logs
export function redactPII(data: any): any {
  if (typeof data !== 'object' || data === null) return data;
  
  const redacted = { ...data };
  
  for (const field of piiFields) {
    if (field in redacted) {
      redacted[field] = '[REDACTED]';
    }
  }
  
  return redacted;
}
```

### Media Access Control
```typescript
// Secure media URL generation
export function generateSecureMediaUrl(
  fileKey: string,
  userId: string,
  expiresIn: number = 3600 // 1 hour default
): string {
  const expires = Date.now() + (expiresIn * 1000);
  
  const payload = `${fileKey}:${userId}:${expires}`;
  const signature = crypto
    .createHmac('sha256', process.env.MEDIA_SECRET!)
    .update(payload)
    .digest('hex');
  
  return `${process.env.CDN_URL}/${fileKey}?user=${userId}&expires=${expires}&sig=${signature}`;
}
```

---

## 6. Performance Optimization

### Database Query Optimization

#### Indexing Strategy
```sql
-- Critical performance indexes
CREATE INDEX idx_drills_game_phase ON drills(game_phase);
CREATE INDEX idx_drills_age_bands ON drills(do_it_ages, coach_it_ages, own_it_ages);
CREATE INDEX idx_practice_plans_team_date ON practice_plans(team_id, practice_date);
CREATE INDEX idx_team_members_composite ON team_members(team_id, user_id, role);

-- Full-text search indexes
CREATE INDEX idx_drills_search ON drills USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_strategies_search ON strategies USING gin(to_tsvector('english', name || ' ' || description));
```

#### Query Optimization Patterns
```typescript
// Efficient data fetching with Supabase
export class OptimizedQueries {
  // Batch loading with pagination
  async getDrillsForPracticePlanner(
    teamId: string,
    filters: DrillFilters,
    page: number = 1,
    limit: number = 50
  ) {
    const offset = (page - 1) * limit;
    
    return supabase
      .from('drills')
      .select(`
        id,
        title,
        duration,
        drill_types,
        game_phase,
        strategies!inner(id, name),
        skills!inner(id, name)
      `)
      .match(filters)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });
  }
  
  // Optimized relationship loading
  async getPracticePlanWithDrills(planId: string) {
    // Single query with joins instead of N+1 queries
    return supabase
      .from('practice_plans')
      .select(`
        *,
        drills:practice_plan_drills(
          drill:drills(
            id,
            title,
            duration,
            video_url
          )
        ),
        team:teams(
          id,
          name,
          age_band
        )
      `)
      .eq('id', planId)
      .single();
  }
}
```

### Caching Strategy
```typescript
// Redis caching configuration
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT!),
  password: process.env.REDIS_PASSWORD,
  tls: process.env.NODE_ENV === 'production' ? {} : undefined,
});

// Cache utilities
export class CacheManager {
  // Cache drill library (changes infrequently)
  async getCachedDrills(teamAgeband: string): Promise<Drill[] | null> {
    const key = `drills:${teamAgeband}`;
    const cached = await redis.get(key);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    return null;
  }
  
  async setCachedDrills(teamAgeband: string, drills: Drill[]) {
    const key = `drills:${teamAgeband}`;
    await redis.setex(key, 3600, JSON.stringify(drills)); // 1 hour cache
  }
  
  // Invalidate cache on updates
  async invalidateDrillCache(ageband?: string) {
    const pattern = ageband ? `drills:${ageband}` : 'drills:*';
    const keys = await redis.keys(pattern);
    
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}
```

### CDN & Asset Optimization
```typescript
// CDN configuration for static assets
export const cdnConfig = {
  // Video delivery optimization
  video: {
    provider: 'vimeo',
    quality: 'auto', // Adaptive bitrate
    preload: 'metadata',
    cdn: 'fastly',
  },
  
  // Image optimization
  images: {
    formats: ['webp', 'avif', 'jpg'],
    sizes: [320, 640, 1280, 1920],
    quality: 85,
    lazy: true,
  },
  
  // PDF caching
  pdfs: {
    cache: 'public, max-age=31536000', // 1 year
    compress: true,
  },
};

// Next.js image optimization
export const imageLoader = ({ src, width, quality }: ImageLoaderProps) => {
  return `${process.env.CDN_URL}/image/${src}?w=${width}&q=${quality || 85}&fm=webp`;
};
```

### API Response Optimization
```typescript
// Response compression and field filtering
export class APIOptimizer {
  // Field filtering to reduce payload size
  filterFields(data: any, allowedFields: string[]): any {
    if (Array.isArray(data)) {
      return data.map(item => this.filterFields(item, allowedFields));
    }
    
    const filtered: any = {};
    for (const field of allowedFields) {
      if (field in data) {
        filtered[field] = data[field];
      }
    }
    
    return filtered;
  }
  
  // Pagination metadata
  paginateResponse(data: any[], page: number, limit: number, total: number) {
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }
}
```

---

## 7. Security Monitoring & Logging

### Security Event Logging
```typescript
// Centralized security logger
import winston from 'winston';

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'powlax-security' },
  transports: [
    new winston.transports.File({ filename: 'security.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Security event types
export enum SecurityEvent {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  DATA_EXPORT = 'DATA_EXPORT',
  PERMISSION_VIOLATION = 'PERMISSION_VIOLATION',
}

// Log security events
export function logSecurityEvent(
  event: SecurityEvent,
  userId: string | null,
  details: any,
  severity: 'info' | 'warn' | 'error' = 'info'
) {
  securityLogger.log(severity, {
    event,
    userId,
    timestamp: new Date().toISOString(),
    details: redactPII(details),
    ip: details.ip,
    userAgent: details.userAgent,
  });
  
  // Alert on critical events
  if (severity === 'error' || event === SecurityEvent.SUSPICIOUS_ACTIVITY) {
    alertSecurityTeam(event, userId, details);
  }
}
```

### Audit Trail
```sql
-- Comprehensive audit trail table
CREATE TABLE audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    to_jsonb(OLD),
    to_jsonb(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
  
CREATE TRIGGER audit_practice_plans AFTER INSERT OR UPDATE OR DELETE ON practice_plans
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

---

## 8. Incident Response Plan

### Security Incident Levels
1. **Level 1 - Low**: Failed login attempts, minor policy violations
2. **Level 2 - Medium**: Multiple failed logins, suspicious patterns
3. **Level 3 - High**: Unauthorized access attempts, data breach attempts
4. **Level 4 - Critical**: Confirmed breach, data exfiltration, system compromise

### Response Procedures
```typescript
interface IncidentResponse {
  level: 1 | 2 | 3 | 4;
  actions: string[];
  notifications: string[];
  remediation: string[];
}

const incidentResponsePlan: Record<number, IncidentResponse> = {
  1: {
    level: 1,
    actions: ['Log event', 'Monitor user'],
    notifications: [],
    remediation: ['Review logs daily'],
  },
  2: {
    level: 2,
    actions: ['Temporary account lock', 'Increase monitoring'],
    notifications: ['Security team email'],
    remediation: ['Review user activity', 'Contact user if legitimate'],
  },
  3: {
    level: 3,
    actions: ['Immediate account suspension', 'Block IP', 'Preserve evidence'],
    notifications: ['Security team SMS', 'Development team'],
    remediation: ['Full audit', 'Patch vulnerabilities', 'User notification'],
  },
  4: {
    level: 4,
    actions: ['System isolation', 'Emergency maintenance mode', 'Full audit'],
    notifications: ['All stakeholders', 'Legal team', 'Affected users'],
    remediation: ['Complete security review', 'System rebuild if needed', 'Public disclosure per policy'],
  },
};
```

---

## 9. Security Checklist for New Features

### Pre-Implementation Security Review
When implementing ANY new feature, complete this checklist:

#### Authentication & Authorization
- [ ] Feature requires authentication?
- [ ] Correct role-based permissions implemented?
- [ ] Subscription status checked?
- [ ] Family account restrictions respected?

#### Data Access
- [ ] RLS policies created/updated?
- [ ] No direct database access bypassing RLS?
- [ ] Proper data scoping by team/user?
- [ ] Sensitive data encrypted?

#### Input Validation
- [ ] All user inputs validated with Zod schemas?
- [ ] File uploads restricted by type/size?
- [ ] SQL injection prevention verified?
- [ ] XSS prevention in place?

#### API Security
- [ ] Endpoint requires authentication?
- [ ] Rate limiting applied?
- [ ] CORS properly configured?
- [ ] Response data filtered appropriately?

#### Logging & Monitoring
- [ ] Security events logged?
- [ ] Audit trail updated?
- [ ] Error messages don't leak sensitive info?
- [ ] Performance metrics captured?

#### Testing
- [ ] Security test cases written?
- [ ] Penetration testing considered?
- [ ] Load testing for DoS prevention?
- [ ] Edge cases handled securely?

### Post-Implementation Security Verification
```bash
# Security verification script
npm run security:check

# Runs:
# - ESLint security rules
# - npm audit
# - OWASP dependency check
# - Custom security tests
# - RLS policy verification
```

---

## 🚨 Emergency Contacts

### Security Team
- **Primary**: security@powlax.com
- **Emergency**: +1-XXX-XXX-XXXX
- **Slack**: #security-alerts

### Incident Reporting
1. Log incident in security system
2. Email security@powlax.com with details
3. For Level 3+ incidents, call emergency number

---

## 📚 Security Resources

### References
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)

### Security Tools
- **Dependency Scanning**: Snyk, npm audit
- **SAST**: SonarQube, ESLint security plugin
- **DAST**: OWASP ZAP
- **Monitoring**: Sentry, LogRocket

---

## 🔄 Document Maintenance

This security architecture document must be reviewed and updated:
- **Quarterly**: Regular review
- **After incidents**: Update based on lessons learned
- **New features**: Before any major feature release
- **Compliance changes**: When regulations update

Last Updated: [Current Date]
Next Review: [Quarterly Date]
Document Version: 1.0