import React, { useState, useEffect, useRef } from 'react'
import { useSpring, animated, useTransition, useSprings } from '@react-spring/web'

interface Team {
  id: string
  name: string
  color: string
  mascot: string
  members: number
  currentProgress: number
  totalContributions: number
  rank: number
}

interface Milestone {
  value: number
  label: string
  reward: string
}

interface TeamChallengeRacingProps {
  teams: Team[]
  challengeGoal: number
  challengeName: string
  timeRemaining: number
  milestones: Milestone[]
  onTeamClick?: (team: Team) => void
}

export default function TeamChallengeRacing({
  teams,
  challengeGoal,
  challengeName,
  timeRemaining,
  milestones,
  onTeamClick
}: TeamChallengeRacingProps) {
  const [sortedTeams, setSortedTeams] = useState<Team[]>([])
  const [animations, setAnimations] = useState<Record<string, boolean>>({})
  const [celebrationTeam, setCelebrationTeam] = useState<string | null>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  // Sort teams by progress and assign ranks
  useEffect(() => {
    const sorted = [...teams].sort((a, b) => b.currentProgress - a.currentProgress)
    sorted.forEach((team, index) => {
      team.rank = index + 1
    })
    setSortedTeams(sorted)

    // Trigger celebration for teams that reach milestones
    sorted.forEach(team => {
      const lastMilestone = milestones
        .filter(m => team.currentProgress >= m.value)
        .slice(-1)[0]
      
      if (lastMilestone && !animations[`${team.id}-${lastMilestone.value}`]) {
        setAnimations(prev => ({
          ...prev,
          [`${team.id}-${lastMilestone.value}`]: true
        }))
        setCelebrationTeam(team.id)
        setTimeout(() => setCelebrationTeam(null), 3000)
      }
    })
  }, [teams, milestones, animations])

  // Progress bar springs for each team
  const progressSprings = useSprings(
    sortedTeams.length,
    sortedTeams.map((team, index) => ({
      width: `${Math.min((team.currentProgress / challengeGoal) * 100, 100)}%`,
      y: index * 80,
      glow: celebrationTeam === team.id ? 1 : 0,
      config: { tension: 200, friction: 25 }
    }))
  )

  // Timer display spring
  const timerSpring = useSpring({
    color: timeRemaining < 3600000 ? '#FF1744' : timeRemaining < 7200000 ? '#FF9800' : '#4CAF50',
    pulse: timeRemaining < 3600000 ? 1 : 0,
    config: { tension: 300, friction: 20 }
  })

  // Milestone celebrations
  const milestoneTransitions = useTransition(
    celebrationTeam ? [celebrationTeam] : [],
    {
      from: { opacity: 0, scale: 0, rotate: -180 },
      enter: { opacity: 1, scale: 1, rotate: 0 },
      leave: { opacity: 0, scale: 1.5, rotate: 180 },
      config: { tension: 300, friction: 20 }
    }
  )

  const formatTime = (ms: number): string => {
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
  }

  const getPositionSuffix = (rank: number): string => {
    if (rank === 1) return 'st'
    if (rank === 2) return 'nd'
    if (rank === 3) return 'rd'
    return 'th'
  }

  return (
    <div className="team-challenge-container">
      {/* Header */}
      <div className="challenge-header">
        <h1 className="challenge-title">{challengeName}</h1>
        <div className="challenge-info">
          <div className="goal-display">
            <span className="goal-label">Goal:</span>
            <span className="goal-value">{challengeGoal.toLocaleString()} points</span>
          </div>
          <animated.div 
            className="timer-display"
            style={{
              color: timerSpring.color,
              transform: timerSpring.pulse.to(p => `scale(${1 + p * 0.1})`),
            }}
          >
            <span className="timer-label">Time Left:</span>
            <span className="timer-value">{formatTime(timeRemaining)}</span>
          </animated.div>
        </div>
      </div>

      {/* Racing Track */}
      <div className="racing-track" ref={progressBarRef}>
        {/* Milestone markers */}
        <div className="milestone-markers">
          {milestones.map((milestone, index) => (
            <div
              key={milestone.value}
              className="milestone-marker"
              style={{
                left: `${(milestone.value / challengeGoal) * 100}%`
              }}
            >
              <div className="milestone-flag">
                <div className="flag-pole" />
                <div className="flag" style={{ backgroundColor: '#FFD700' }}>
                  🏆
                </div>
              </div>
              <div className="milestone-info">
                <div className="milestone-value">{milestone.value.toLocaleString()}</div>
                <div className="milestone-label">{milestone.label}</div>
                <div className="milestone-reward">{milestone.reward}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Team progress bars */}
        <div className="team-tracks">
          {sortedTeams.map((team, index) => (
            <animated.div
              key={team.id}
              className="team-track"
              style={{
                transform: progressSprings[index].y.to(y => `translateY(${y}px)`),
              }}
              onClick={() => onTeamClick?.(team)}
            >
              {/* Track background */}
              <div className="track-background">
                <div className="track-lane" />
                
                {/* Progress bar */}
                <animated.div
                  className="progress-bar"
                  style={{
                    width: progressSprings[index].width,
                    backgroundColor: team.color,
                    boxShadow: progressSprings[index].glow.to(
                      g => `0 0 ${g * 20}px ${team.color}, inset 0 2px 10px rgba(255,255,255,0.3)`
                    ),
                  }}
                >
                  {/* Racing stripes */}
                  <div className="racing-stripes" />
                  
                  {/* Sparkle effect for leading team */}
                  {team.rank === 1 && (
                    <div className="sparkle-trail">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="sparkle"
                          style={{
                            animationDelay: `${i * 0.2}s`,
                            right: `${i * 20}px`
                          }}
                        />
                      ))}
                    </div>
                  )}
                </animated.div>

                {/* Team mascot/vehicle */}
                <div
                  className="team-vehicle"
                  style={{
                    left: `calc(${Math.min((team.currentProgress / challengeGoal) * 100, 97)}% - 30px)`,
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div className="vehicle-body" style={{ backgroundColor: team.color }}>
                    <span className="mascot">{team.mascot}</span>
                  </div>
                  {team.rank === 1 && (
                    <div className="crown">👑</div>
                  )}
                </div>
              </div>

              {/* Team info panel */}
              <div className="team-info">
                <div className="team-header">
                  <div className="rank-badge" style={{ backgroundColor: team.color }}>
                    #{team.rank}
                  </div>
                  <div className="team-details">
                    <div className="team-name">{team.name}</div>
                    <div className="team-members">{team.members} members</div>
                  </div>
                </div>
                
                <div className="team-stats">
                  <div className="stat">
                    <span className="stat-value">{team.currentProgress.toLocaleString()}</span>
                    <span className="stat-label">points</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{Math.round((team.currentProgress / challengeGoal) * 100)}%</span>
                    <span className="stat-label">complete</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{team.totalContributions}</span>
                    <span className="stat-label">contributions</span>
                  </div>
                </div>
              </div>
            </animated.div>
          ))}
        </div>
      </div>

      {/* Milestone celebrations */}
      {milestoneTransitions((style, teamId) => {
        const team = teams.find(t => t.id === teamId)
        if (!team) return null

        return (
          <animated.div
            className="milestone-celebration"
            style={style}
          >
            <div className="celebration-content">
              <div className="celebration-mascot">{team.mascot}</div>
              <div className="celebration-text">
                <h3>{team.name}</h3>
                <p>Milestone Reached! 🎉</p>
              </div>
            </div>
          </animated.div>
        )
      })}

      {/* Leaderboard sidebar */}
      <div className="leaderboard-sidebar">
        <h3>Leaderboard</h3>
        {sortedTeams.map((team, index) => (
          <div 
            key={team.id} 
            className={`leaderboard-item ${team.rank === 1 ? 'leader' : ''}`}
          >
            <div className="position">
              {team.rank}{getPositionSuffix(team.rank)}
            </div>
            <div className="team-mini">
              <span className="mini-mascot">{team.mascot}</span>
              <span className="mini-name">{team.name}</span>
            </div>
            <div className="mini-progress">
              {Math.round((team.currentProgress / challengeGoal) * 100)}%
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .team-challenge-container {
          width: 100%;
          min-height: 100vh;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%);
          padding: 20px;
          position: relative;
          overflow-x: auto;
        }

        .challenge-header {
          text-align: center;
          margin-bottom: 40px;
          color: white;
        }

        .challenge-title {
          font-size: 48px;
          font-weight: bold;
          margin: 0 0 20px 0;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }

        .challenge-info {
          display: flex;
          justify-content: center;
          gap: 60px;
          font-size: 18px;
        }

        .goal-display, .timer-display {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .goal-label, .timer-label {
          opacity: 0.8;
          margin-bottom: 5px;
        }

        .goal-value, .timer-value {
          font-size: 24px;
          font-weight: bold;
        }

        .racing-track {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          padding-right: 250px;
        }

        .milestone-markers {
          position: relative;
          height: 60px;
          margin-bottom: 20px;
        }

        .milestone-marker {
          position: absolute;
          top: 0;
          transform: translateX(-50%);
        }

        .milestone-flag {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 10px;
        }

        .flag-pole {
          width: 2px;
          height: 40px;
          background: #666;
        }

        .flag {
          width: 30px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 3px;
          font-size: 12px;
          margin-top: -20px;
        }

        .milestone-info {
          text-align: center;
          color: white;
          font-size: 10px;
          opacity: 0.8;
        }

        .team-tracks {
          position: relative;
          height: ${sortedTeams.length * 80}px;
        }

        .team-track {
          position: absolute;
          width: 100%;
          height: 70px;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .team-track:hover {
          transform: translateY(var(--y)) scale(1.02) !important;
        }

        .track-background {
          position: relative;
          height: 40px;
          margin-bottom: 10px;
        }

        .track-lane {
          width: 100%;
          height: 40px;
          background: rgba(255,255,255,0.1);
          border-radius: 20px;
          border: 2px solid rgba(255,255,255,0.2);
        }

        .progress-bar {
          position: absolute;
          top: 0;
          left: 0;
          height: 40px;
          border-radius: 20px;
          transition: all 0.5s ease;
          overflow: hidden;
        }

        .racing-stripes {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 10px,
            rgba(255,255,255,0.1) 10px,
            rgba(255,255,255,0.1) 20px
          );
          animation: moveStripes 1s linear infinite;
        }

        @keyframes moveStripes {
          0% { transform: translateX(0); }
          100% { transform: translateX(28px); }
        }

        .sparkle-trail {
          position: absolute;
          top: 50%;
          right: 0;
          transform: translateY(-50%);
        }

        .sparkle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          animation: sparkleFloat 1.5s ease-in-out infinite;
        }

        @keyframes sparkleFloat {
          0%, 100% { opacity: 0; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-10px); }
        }

        .team-vehicle {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          animation: vehicleBounce 2s ease-in-out infinite;
        }

        @keyframes vehicleBounce {
          0%, 100% { transform: translateY(-50%); }
          50% { transform: translateY(-55%); }
        }

        .vehicle-body {
          width: 60px;
          height: 30px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          position: relative;
        }

        .mascot {
          font-size: 18px;
        }

        .crown {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 16px;
          animation: crownFloat 2s ease-in-out infinite;
        }

        @keyframes crownFloat {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-3px); }
        }

        .team-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255,255,255,0.1);
          padding: 8px 15px;
          border-radius: 8px;
          backdrop-filter: blur(10px);
        }

        .team-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .rank-badge {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: 14px;
        }

        .team-details {
          color: white;
        }

        .team-name {
          font-weight: bold;
          font-size: 16px;
        }

        .team-members {
          font-size: 12px;
          opacity: 0.8;
        }

        .team-stats {
          display: flex;
          gap: 20px;
        }

        .stat {
          text-align: center;
          color: white;
        }

        .stat-value {
          display: block;
          font-weight: bold;
          font-size: 14px;
        }

        .stat-label {
          font-size: 10px;
          opacity: 0.8;
        }

        .milestone-celebration {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10000;
          pointer-events: none;
        }

        .celebration-content {
          background: linear-gradient(45deg, #FFD700, #FFA500);
          padding: 30px;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          border: 3px solid white;
        }

        .celebration-mascot {
          font-size: 60px;
          margin-bottom: 15px;
        }

        .celebration-text h3 {
          margin: 0 0 10px 0;
          font-size: 24px;
          color: white;
        }

        .celebration-text p {
          margin: 0;
          font-size: 18px;
          color: white;
        }

        .leaderboard-sidebar {
          position: fixed;
          right: 20px;
          top: 200px;
          width: 200px;
          background: rgba(0,0,0,0.8);
          border-radius: 15px;
          padding: 20px;
          color: white;
          backdrop-filter: blur(10px);
        }

        .leaderboard-sidebar h3 {
          margin: 0 0 20px 0;
          text-align: center;
          font-size: 18px;
        }

        .leaderboard-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          border-radius: 8px;
          margin-bottom: 8px;
          transition: background 0.3s ease;
        }

        .leaderboard-item.leader {
          background: linear-gradient(45deg, #FFD700, #FFA500);
          color: black;
          font-weight: bold;
        }

        .leaderboard-item:hover {
          background: rgba(255,255,255,0.1);
        }

        .position {
          font-weight: bold;
          min-width: 25px;
        }

        .team-mini {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .mini-mascot {
          font-size: 14px;
        }

        .mini-name {
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .mini-progress {
          font-size: 11px;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .racing-track {
            padding-right: 0;
          }
          
          .leaderboard-sidebar {
            position: static;
            width: 100%;
            margin-top: 30px;
          }
          
          .challenge-info {
            flex-direction: column;
            gap: 20px;
          }
          
          .challenge-title {
            font-size: 32px;
          }
        }
      `}</style>
    </div>
  )
}

// Demo component
export function TeamChallengeDemo() {
  const [teams, setTeams] = useState<Team[]>([
    {
      id: '1',
      name: 'Thunder Hawks',
      color: '#FF4444',
      mascot: '🦅',
      members: 12,
      currentProgress: 8500,
      totalContributions: 342,
      rank: 1
    },
    {
      id: '2', 
      name: 'Lightning Bolts',
      color: '#44FF44',
      mascot: '⚡',
      members: 15,
      currentProgress: 7200,
      totalContributions: 298,
      rank: 2
    },
    {
      id: '3',
      name: 'Fire Dragons',
      color: '#FF8844',
      mascot: '🐉',
      members: 10,
      currentProgress: 6800,
      totalContributions: 256,
      rank: 3
    },
    {
      id: '4',
      name: 'Ice Wolves',
      color: '#4444FF',
      mascot: '🐺',
      members: 13,
      currentProgress: 5900,
      totalContributions: 201,
      rank: 4
    }
  ])

  const milestones: Milestone[] = [
    { value: 2500, label: 'First Goal', reward: 'Team Badge' },
    { value: 5000, label: 'Halfway', reward: '50 Bonus Points' },
    { value: 7500, label: 'Final Push', reward: 'Special Drill' },
    { value: 10000, label: 'Victory!', reward: 'Championship Trophy' }
  ]

  const [timeRemaining, setTimeRemaining] = useState(7200000) // 2 hours

  // Simulate progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTeams(prev => prev.map(team => ({
        ...team,
        currentProgress: Math.min(
          team.currentProgress + Math.random() * 50,
          10000
        ),
        totalContributions: team.totalContributions + Math.floor(Math.random() * 3)
      })))

      setTimeRemaining(prev => Math.max(0, prev - 5000))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <TeamChallengeRacing
      teams={teams}
      challengeGoal={10000}
      challengeName="Weekly Skills Challenge"
      timeRemaining={timeRemaining}
      milestones={milestones}
      onTeamClick={(team) => console.log('Clicked team:', team)}
    />
  )
}