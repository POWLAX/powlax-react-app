/**
 * SendGrid Email Service for POWLAX
 * Handles all transactional emails including magic links, registrations, and team invitations
 */

import sgMail from '@sendgrid/mail'

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  templateId?: string
  dynamicTemplateData?: Record<string, any>
  from?: {
    email: string
    name: string
  }
  replyTo?: string
}

export class EmailService {
  private fromEmail: string
  private fromName: string
  private replyTo: string
  private baseUrl: string
  private isConfigured: boolean

  constructor() {
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'team@powlax.com'
    this.fromName = process.env.SENDGRID_FROM_NAME || 'POWLAX Team'
    this.replyTo = process.env.SENDGRID_REPLY_TO || 'support@powlax.com'
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    this.isConfigured = !!SENDGRID_API_KEY
  }

  /**
   * Send a magic link for passwordless login
   */
  async sendMagicLink(email: string, token: string): Promise<boolean> {
    if (!this.isConfigured) {
      console.warn('SendGrid not configured, magic link URL:', `${this.baseUrl}/auth/magic-link?token=${token}`)
      return false
    }

    const magicLinkUrl = `${this.baseUrl}/auth/magic-link?token=${token}`
    
    const html = this.getMagicLinkTemplate(magicLinkUrl)
    const text = `Click here to log in to POWLAX: ${magicLinkUrl}\n\nThis link expires in 1 hour.`

    return this.sendEmail({
      to: email,
      subject: 'Your POWLAX Login Link',
      html,
      text
    })
  }

  /**
   * Send registration confirmation
   */
  async sendRegistrationConfirmation(
    email: string, 
    fullName: string,
    teamName?: string,
    role?: string
  ): Promise<boolean> {
    if (!this.isConfigured) {
      console.warn('SendGrid not configured, skipping registration email')
      return false
    }

    const html = this.getRegistrationTemplate(fullName, teamName, role)
    const text = `Welcome to POWLAX, ${fullName}! You've been registered${teamName ? ` for ${teamName}` : ''}.`

    return this.sendEmail({
      to: email,
      subject: 'Welcome to POWLAX!',
      html,
      text
    })
  }

  /**
   * Send team invitation
   */
  async sendTeamInvitation(
    email: string,
    inviterName: string,
    teamName: string,
    role: string,
    registrationLink: string
  ): Promise<boolean> {
    if (!this.isConfigured) {
      console.warn('SendGrid not configured, registration link:', registrationLink)
      return false
    }

    const html = this.getTeamInvitationTemplate(inviterName, teamName, role, registrationLink)
    const text = `${inviterName} has invited you to join ${teamName} on POWLAX as a ${role}. Join here: ${registrationLink}`

    return this.sendEmail({
      to: email,
      subject: `You're invited to join ${teamName} on POWLAX`,
      html,
      text
    })
  }

  /**
   * Send practice reminder
   */
  async sendPracticeReminder(
    emails: string[],
    teamName: string,
    practiceDate: Date,
    location: string,
    notes?: string
  ): Promise<boolean> {
    if (!this.isConfigured) {
      console.warn('SendGrid not configured, skipping practice reminder')
      return false
    }

    const html = this.getPracticeReminderTemplate(teamName, practiceDate, location, notes)
    const dateStr = practiceDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
    const text = `Practice reminder for ${teamName}: ${dateStr} at ${location}${notes ? `\n\nNotes: ${notes}` : ''}`

    return this.sendEmail({
      to: emails,
      subject: `Practice Reminder: ${teamName} - ${practiceDate.toLocaleDateString()}`,
      html,
      text
    })
  }

  /**
   * Core email sending function
   */
  private async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const msg = {
        to: options.to,
        from: options.from || {
          email: this.fromEmail,
          name: this.fromName
        },
        replyTo: options.replyTo || this.replyTo,
        subject: options.subject,
        text: options.text,
        html: options.html,
        templateId: options.templateId,
        dynamicTemplateData: options.dynamicTemplateData
      }

      // Remove undefined fields
      Object.keys(msg).forEach(key => {
        if (msg[key as keyof typeof msg] === undefined) {
          delete msg[key as keyof typeof msg]
        }
      })

      await sgMail.send(msg)
      console.log(`Email sent successfully to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`)
      return true
    } catch (error: any) {
      console.error('SendGrid error:', error?.response?.body || error?.message || error)
      return false
    }
  }

  /**
   * Email Templates
   */

  private getMagicLinkTemplate(magicLinkUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>POWLAX Login</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      color: #0A2240;
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .button {
      display: inline-block;
      padding: 14px 30px;
      background-color: #2E69B7;
      color: white !important;
      text-decoration: none;
      border-radius: 5px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #0A2240;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    .warning {
      background-color: #FFF8E1;
      border: 1px solid #D7B349;
      border-radius: 5px;
      padding: 10px;
      margin: 20px 0;
      color: #7A5E1F;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">POWLAX</div>
      <p style="color: #666; margin: 0;">Your Lacrosse Training Platform</p>
    </div>
    
    <h2>Log in to POWLAX</h2>
    <p>Click the button below to securely log in to your account:</p>
    
    <div style="text-align: center;">
      <a href="${magicLinkUrl}" class="button">Log In to POWLAX</a>
    </div>
    
    <div class="warning">
      <strong>⏰ This link expires in 1 hour</strong><br>
      For security, this login link will expire in 60 minutes. If it expires, simply request a new one.
    </div>
    
    <p style="color: #666; font-size: 14px;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${magicLinkUrl}" style="color: #2E69B7; word-break: break-all;">${magicLinkUrl}</a>
    </p>
    
    <div class="footer">
      <p>Didn't request this email? You can safely ignore it.</p>
      <p>&copy; ${new Date().getFullYear()} POWLAX. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `
  }

  private getRegistrationTemplate(fullName: string, teamName?: string, role?: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to POWLAX</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      color: #003366;
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .welcome-box {
      background-color: #e8f4f8;
      border-left: 4px solid #2E69B7;
      padding: 15px;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      padding: 14px 30px;
      background-color: #D7B349;
      color: white !important;
      text-decoration: none;
      border-radius: 5px;
      font-weight: 600;
      margin: 20px 0;
    }
    .features {
      margin: 30px 0;
    }
    .feature {
      display: flex;
      align-items: flex-start;
      margin: 15px 0;
    }
    .feature-icon {
      font-size: 24px;
      margin-right: 15px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">POWLAX</div>
      <p style="color: #666; margin: 0;">Your Lacrosse Training Platform</p>
    </div>
    
    <h1>Welcome to POWLAX, ${fullName}! 🥍</h1>
    
    <div class="welcome-box">
      <strong>You're all set!</strong><br>
      ${teamName ? `You've been registered for <strong>${teamName}</strong> as a <strong>${role || 'member'}</strong>.` : 'Your account has been created successfully.'}
    </div>
    
    <div class="features">
      <h3>What you can do now:</h3>
      
      <div class="feature">
        <span class="feature-icon">📋</span>
        <div>
          <strong>Practice Planner</strong><br>
          <span style="color: #666;">Build efficient practice plans with our drill library</span>
        </div>
      </div>
      
      <div class="feature">
        <span class="feature-icon">🎯</span>
        <div>
          <strong>Skills Academy</strong><br>
          <span style="color: #666;">Access wall ball workouts and skill development programs</span>
        </div>
      </div>
      
      <div class="feature">
        <span class="feature-icon">🏆</span>
        <div>
          <strong>Track Progress</strong><br>
          <span style="color: #666;">Earn points and badges as you improve</span>
        </div>
      </div>
    </div>
    
    <div style="text-align: center;">
      <a href="${this.baseUrl}/dashboard" class="button">Go to Dashboard</a>
    </div>
    
    <div class="footer">
      <p>Need help? Reply to this email or visit our support center.</p>
      <p>&copy; ${new Date().getFullYear()} POWLAX. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `
  }

  private getTeamInvitationTemplate(
    inviterName: string,
    teamName: string,
    role: string,
    registrationLink: string
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Invitation</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      color: #003366;
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .invite-box {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 10px;
      padding: 25px;
      text-align: center;
      margin: 20px 0;
    }
    .team-name {
      font-size: 28px;
      font-weight: bold;
      margin: 10px 0;
    }
    .button {
      display: inline-block;
      padding: 14px 30px;
      background-color: white;
      color: #2E69B7 !important;
      text-decoration: none;
      border-radius: 5px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">POWLAX</div>
      <p style="color: #666; margin: 0;">Your Lacrosse Training Platform</p>
    </div>
    
    <div class="invite-box">
      <p style="margin: 0; opacity: 0.9;">You're invited to join</p>
      <div class="team-name">${teamName}</div>
      <p style="margin: 10px 0; opacity: 0.9;">as a <strong>${role}</strong></p>
    </div>
    
    <p><strong>${inviterName}</strong> has invited you to join their team on POWLAX, the comprehensive lacrosse training platform.</p>
    
    <p>As a ${role}, you'll be able to:</p>
    <ul>
      ${role === 'player' ? `
        <li>Access team practice plans</li>
        <li>Complete skills workouts</li>
        <li>Track your progress</li>
        <li>Earn points and badges</li>
      ` : role === 'parent' ? `
        <li>View your child's progress</li>
        <li>See practice schedules</li>
        <li>Receive team updates</li>
        <li>Communicate with coaches</li>
      ` : `
        <li>Create practice plans</li>
        <li>Manage team rosters</li>
        <li>Track player development</li>
        <li>Access coaching resources</li>
      `}
    </ul>
    
    <div style="text-align: center;">
      <a href="${registrationLink}" class="button">Accept Invitation</a>
    </div>
    
    <p style="color: #666; font-size: 14px;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${registrationLink}" style="color: #003366; word-break: break-all;">${registrationLink}</a>
    </p>
    
    <div class="footer">
      <p>This invitation link will expire in 100 days.</p>
      <p>&copy; ${new Date().getFullYear()} POWLAX. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `
  }

  private getPracticeReminderTemplate(
    teamName: string,
    practiceDate: Date,
    location: string,
    notes?: string
  ): string {
    const dateStr = practiceDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric'
    })
    const timeStr = practiceDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Practice Reminder</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      color: #003366;
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .practice-card {
      background-color: #f8f9fa;
      border-left: 4px solid #D7B349;
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .detail {
      display: flex;
      margin: 10px 0;
    }
    .detail-label {
      font-weight: 600;
      width: 100px;
      color: #666;
    }
    .notes-box {
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 5px;
      padding: 15px;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      padding: 14px 30px;
      background-color: #003366;
      color: white !important;
      text-decoration: none;
      border-radius: 5px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">POWLAX</div>
      <p style="color: #666; margin: 0;">Practice Reminder</p>
    </div>
    
    <h2 style="color: #0A2240;">⏰ Practice Tomorrow!</h2>
    
    <div class="practice-card">
      <h3 style="margin-top: 0; color: #0A2240;">${teamName}</h3>
      
      <div class="detail">
        <span class="detail-label">📅 Date:</span>
        <span>${dateStr}</span>
      </div>
      
      <div class="detail">
        <span class="detail-label">🕐 Time:</span>
        <span>${timeStr}</span>
      </div>
      
      <div class="detail">
        <span class="detail-label">📍 Location:</span>
        <span>${location}</span>
      </div>
    </div>
    
    ${notes ? `
    <div class="notes-box">
      <strong>Coach's Notes:</strong><br>
      ${notes}
    </div>
    ` : ''}
    
    <h3>What to Bring:</h3>
    <ul>
      <li>Stick and helmet</li>
      <li>Cleats and practice gear</li>
      <li>Water bottle</li>
      <li>Great attitude! 💪</li>
    </ul>
    
    <div style="text-align: center;">
      <a href="${this.baseUrl}/dashboard" class="button">View Practice Plan</a>
    </div>
    
    <div class="footer">
      <p>See you on the field!</p>
      <p>&copy; ${new Date().getFullYear()} POWLAX. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `
  }
}

// Export singleton instance
export const emailService = new EmailService()