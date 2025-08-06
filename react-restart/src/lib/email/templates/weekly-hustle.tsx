// Weekly Parent Notification Template
// Phase 1: Anti-Gaming Foundation

import { ReactElement } from 'react'

interface WeeklyHustleEmailProps {
  playerName: string
  parentName: string
  weekData: {
    streak: number
    workoutsCompleted: number
    averageDifficulty: number
    totalPoints: number
    difficultyImprovement: number // % change from last week
    topCategory: string // Which point type they earned most of
  }
  newBadges: Array<{
    title: string
    description: string
    iconUrl?: string
  }>
  milestones: Array<{
    type: 'streak' | 'points' | 'difficulty'
    achievement: string
  }>
  nextWeekGoals?: {
    streakTarget: number
    difficultyTarget: number
    focusArea: string
  }
  coachNotes?: string
}

export function WeeklyHustleEmail({
  playerName,
  parentName,
  weekData,
  newBadges,
  milestones,
  nextWeekGoals,
  coachNotes
}: WeeklyHustleEmailProps): ReactElement {
  const getDifficultyLabel = (score: number): string => {
    if (score >= 4.5) return 'Elite'
    if (score >= 4.0) return 'Advanced'
    if (score >= 3.5) return 'Intermediate'
    if (score >= 2.5) return 'Developing'
    return 'Beginner'
  }

  const getDifficultyColor = (score: number): string => {
    if (score >= 4.0) return '#dc2626' // red
    if (score >= 3.5) return '#ea580c' // orange
    if (score >= 2.5) return '#ca8a04' // yellow
    return '#16a34a' // green
  }

  const getStreakEmoji = (streak: number): string => {
    if (streak >= 30) return '🏆'
    if (streak >= 14) return '⚔️'
    if (streak >= 7) return '🔥'
    if (streak >= 3) return '📈'
    return '🚀'
  }

  const formatCategoryName = (category: string): string => {
    const names: Record<string, string> = {
      'attack_token': 'Attack Tokens',
      'defense_dollar': 'Defense Dollars',
      'midfield_medal': 'Midfield Medals',
      'rebound_reward': 'Rebound Rewards',
      'lax_iq_point': 'Lax IQ Points',
      'lax_credit': 'Lax Credits'
    }
    return names[category] || category
  }

  return (
    <html>
      <head>
        <title>{playerName}'s Weekly Hustle Report</title>
        <style>{`
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            background-color: #f8fafc;
          }
          .container { 
            background: white; 
            padding: 20px; 
            border-radius: 12px; 
            margin: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); 
            color: white; 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center;
            margin-bottom: 20px;
          }
          .header h1 { 
            margin: 0; 
            font-size: 24px; 
            font-weight: bold;
          }
          .header p { 
            margin: 5px 0 0 0; 
            opacity: 0.9; 
          }
          .stat-grid { 
            display: grid; 
            grid-template-columns: repeat(2, 1fr); 
            gap: 15px; 
            margin: 20px 0; 
          }
          .stat-card { 
            background: #f8fafc; 
            padding: 15px; 
            border-radius: 8px; 
            text-align: center;
            border: 1px solid #e2e8f0;
          }
          .stat-number { 
            font-size: 28px; 
            font-weight: bold; 
            margin-bottom: 5px; 
          }
          .stat-label { 
            font-size: 12px; 
            color: #64748b; 
            text-transform: uppercase; 
            letter-spacing: 0.5px;
          }
          .improvement { 
            color: #16a34a; 
            font-weight: bold; 
          }
          .decline { 
            color: #dc2626; 
            font-weight: bold; 
          }
          .badge-showcase { 
            background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); 
            color: white; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
          }
          .badge-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 15px; 
            margin-top: 15px;
          }
          .badge-item { 
            background: rgba(255, 255, 255, 0.1); 
            padding: 12px; 
            border-radius: 6px;
            text-align: center;
          }
          .milestone-list { 
            background: #fef3c7; 
            border: 1px solid #f59e0b; 
            border-radius: 8px; 
            padding: 15px; 
            margin: 20px 0;
          }
          .milestone-item { 
            display: flex; 
            align-items: center; 
            margin: 8px 0;
            font-weight: 500;
          }
          .milestone-item::before { 
            content: '🎉'; 
            margin-right: 10px; 
          }
          .goals-section { 
            background: #ecfdf5; 
            border: 1px solid #10b981; 
            border-radius: 8px; 
            padding: 15px; 
            margin: 20px 0;
          }
          .coach-notes { 
            background: #eff6ff; 
            border-left: 4px solid #3b82f6; 
            padding: 15px; 
            margin: 20px 0;
            font-style: italic;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #64748b; 
            font-size: 14px;
            border-top: 1px solid #e2e8f0;
            margin-top: 30px;
          }
          .difficulty-bar {
            height: 8px;
            background: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
            margin: 5px 0;
          }
          .difficulty-fill {
            height: 100%;
            transition: width 0.3s ease;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          {/* Header */}
          <div className="header">
            <h1>{getStreakEmoji(weekData.streak)} {playerName}'s Weekly Hustle</h1>
            <p>Training Report • Week Ending {new Date().toLocaleDateString()}</p>
          </div>

          {/* Greeting */}
          <div style={{ marginBottom: '20px' }}>
            <p>Hi {parentName},</p>
            <p>
              Here's how {playerName} performed this week! {' '}
              {weekData.streak > 0 && `They maintained a ${weekData.streak}-day training streak 🔥`}
              {weekData.difficultyImprovement > 0 && ` and increased their workout difficulty by ${weekData.difficultyImprovement}%!`}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-number" style={{ color: '#f97316' }}>
                {weekData.streak}
              </div>
              <div className="stat-label">Day Streak</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number" style={{ color: '#3b82f6' }}>
                {weekData.workoutsCompleted}
              </div>
              <div className="stat-label">Workouts This Week</div>
            </div>
            
            <div className="stat-card">
              <div 
                className="stat-number" 
                style={{ color: getDifficultyColor(weekData.averageDifficulty) }}
              >
                {weekData.averageDifficulty.toFixed(1)}
              </div>
              <div className="stat-label">
                Avg Difficulty ({getDifficultyLabel(weekData.averageDifficulty)})
              </div>
              <div className="difficulty-bar">
                <div 
                  className="difficulty-fill"
                  style={{ 
                    width: `${(weekData.averageDifficulty / 5) * 100}%`,
                    backgroundColor: getDifficultyColor(weekData.averageDifficulty)
                  }}
                />
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number" style={{ color: '#10b981' }}>
                {weekData.totalPoints}
              </div>
              <div className="stat-label">
                Total Points Earned
              </div>
              <div style={{ fontSize: '11px', marginTop: '4px', color: '#64748b' }}>
                Most from {formatCategoryName(weekData.topCategory)}
              </div>
            </div>
          </div>

          {/* Difficulty Improvement */}
          {weekData.difficultyImprovement !== 0 && (
            <div style={{ 
              background: weekData.difficultyImprovement > 0 ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${weekData.difficultyImprovement > 0 ? '#10b981' : '#ef4444'}`,
              borderRadius: '8px',
              padding: '12px',
              margin: '15px 0',
              textAlign: 'center'
            }}>
              <span className={weekData.difficultyImprovement > 0 ? 'improvement' : 'decline'}>
                {weekData.difficultyImprovement > 0 ? '📈 ' : '📉 '}
                {Math.abs(weekData.difficultyImprovement)}% 
                {weekData.difficultyImprovement > 0 ? ' increase' : ' decrease'} in workout difficulty
              </span>
            </div>
          )}

          {/* New Badges */}
          {newBadges.length > 0 && (
            <div className="badge-showcase">
              <h3 style={{ margin: '0 0 10px 0' }}>🏆 New Badges Earned!</h3>
              <div className="badge-grid">
                {newBadges.map((badge, index) => (
                  <div key={index} className="badge-item">
                    <div style={{ fontSize: '20px', marginBottom: '5px' }}>🏅</div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{badge.title}</div>
                    <div style={{ fontSize: '12px', opacity: '0.9', marginTop: '4px' }}>
                      {badge.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Milestones */}
          {milestones.length > 0 && (
            <div className="milestone-list">
              <h3 style={{ margin: '0 0 10px 0', color: '#92400e' }}>🎯 Milestones Achieved</h3>
              {milestones.map((milestone, index) => (
                <div key={index} className="milestone-item">
                  {milestone.achievement}
                </div>
              ))}
            </div>
          )}

          {/* Coach Notes */}
          {coachNotes && (
            <div className="coach-notes">
              <h4 style={{ margin: '0 0 10px 0', color: '#1e40af' }}>💬 Coach's Notes</h4>
              <p style={{ margin: 0 }}>{coachNotes}</p>
            </div>
          )}

          {/* Next Week Goals */}
          {nextWeekGoals && (
            <div className="goals-section">
              <h3 style={{ margin: '0 0 15px 0', color: '#065f46' }}>🎯 Next Week's Goals</h3>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Maintain a {nextWeekGoals.streakTarget}-day streak</li>
                <li>Average difficulty of {nextWeekGoals.difficultyTarget}+</li>
                <li>Focus on: {nextWeekGoals.focusArea}</li>
              </ul>
            </div>
          )}

          {/* Footer */}
          <div className="footer">
            <p>
              <strong>Keep up the great work, {playerName}!</strong><br/>
              Questions? Reply to this email or contact your coach.
            </p>
            <p style={{ fontSize: '12px', marginTop: '15px' }}>
              Generated by POWLAX Skills Academy • 
              <a href="#" style={{ color: '#3b82f6' }}>View Full Progress Dashboard</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}

// Helper function to generate email data
export async function generateWeeklyHustleData(userId: string, playerName: string) {
  // This would fetch real data from the database
  // For now, returning mock structure
  return {
    playerName,
    parentName: 'Parent', // Fetch from user profile
    weekData: {
      streak: 5,
      workoutsCompleted: 4,
      averageDifficulty: 3.2,
      totalPoints: 128,
      difficultyImprovement: 15,
      topCategory: 'attack_token'
    },
    newBadges: [
      {
        title: 'Attack Apprentice',
        description: 'Earned 250 Attack Tokens'
      }
    ],
    milestones: [
      {
        type: 'streak' as const,
        achievement: 'Maintained 5-day training streak'
      }
    ],
    nextWeekGoals: {
      streakTarget: 7,
      difficultyTarget: 3.5,
      focusArea: 'Wall Ball Skills'
    },
    coachNotes: 'Great improvement in stick handling drills! Focus on off-hand next week.'
  }
}