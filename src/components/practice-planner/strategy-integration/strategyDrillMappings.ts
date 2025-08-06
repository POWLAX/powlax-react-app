export interface DrillRecommendation {
  drill_id?: string
  name: string
  duration: number
  category: string
  strategyContext: string
  relevance: 'essential' | 'supporting' | 'progression'
  difficulty?: number
  tags?: string[]
}

export interface StrategyMapping {
  essential: DrillRecommendation[]
  supporting: DrillRecommendation[]
  progression: DrillRecommendation[]
}

export const strategyDrillMappings: Record<string, StrategyMapping> = {
  "4-3 Alpha Clear": {
    essential: [
      {
        name: "4 Corner 1v1s",
        duration: 8,
        category: "1v1",
        strategyContext: "Core clearing skill - ground ball recovery and outlet passing under pressure",
        relevance: "essential",
        difficulty: 3,
        tags: ["clearing", "1v1", "groundball"]
      },
      {
        name: "Best Drill Ever",
        duration: 12,
        category: "concept",
        strategyContext: "Develops clearing fundamentals with pressure and communication",
        relevance: "essential",
        difficulty: 4,
        tags: ["clearing", "pressure", "communication"]
      },
      {
        name: "Ground Ball to Clear",
        duration: 10,
        category: "skill",
        strategyContext: "Combines ground ball skills with immediate clearing decisions",
        relevance: "essential",
        difficulty: 3,
        tags: ["groundball", "clearing", "transition"]
      }
    ],
    supporting: [
      {
        name: "Defensive Footwork",
        duration: 5,
        category: "skill",
        strategyContext: "Builds defensive positioning for clearing situations",
        relevance: "supporting",
        difficulty: 2,
        tags: ["defense", "footwork", "fundamentals"]
      },
      {
        name: "Outlet Passing",
        duration: 8,
        category: "skill",
        strategyContext: "Improves passing accuracy under pressure during clears",
        relevance: "supporting",
        difficulty: 2,
        tags: ["passing", "clearing", "accuracy"]
      },
      {
        name: "Communication Drills",
        duration: 6,
        category: "concept",
        strategyContext: "Essential for coordinated team clearing",
        relevance: "supporting",
        difficulty: 2,
        tags: ["communication", "teamwork", "clearing"]
      }
    ],
    progression: [
      {
        name: "6v6 Clearing",
        duration: 15,
        category: "concept",
        strategyContext: "Full team clearing practice against ride pressure",
        relevance: "progression",
        difficulty: 5,
        tags: ["clearing", "team", "advanced"]
      },
      {
        name: "Pressure Clearing",
        duration: 12,
        category: "concept",
        strategyContext: "Advanced clearing against aggressive rides",
        relevance: "progression",
        difficulty: 5,
        tags: ["clearing", "pressure", "advanced"]
      },
      {
        name: "Clear to Score",
        duration: 10,
        category: "concept",
        strategyContext: "Transitions from clearing to fast break offense",
        relevance: "progression",
        difficulty: 4,
        tags: ["clearing", "transition", "offense"]
      }
    ]
  },
  "Cuse Motion Offense": {
    essential: [
      {
        name: "1v1+1 Dodge Drill",
        duration: 10,
        category: "1v1",
        strategyContext: "Fundamental dodging with off-ball support - key to Cuse motion",
        relevance: "essential",
        difficulty: 3,
        tags: ["offense", "dodging", "motion"]
      },
      {
        name: "Cuse Motion Fundamentals",
        duration: 15,
        category: "concept",
        strategyContext: "Walk through the basic Cuse motion patterns and reads",
        relevance: "essential",
        difficulty: 3,
        tags: ["offense", "motion", "patterns"]
      },
      {
        name: "Off Ball Movement",
        duration: 8,
        category: "skill",
        strategyContext: "Critical for creating space and opportunities in motion offense",
        relevance: "essential",
        difficulty: 3,
        tags: ["offense", "movement", "spacing"]
      }
    ],
    supporting: [
      {
        name: "Pick Setting",
        duration: 6,
        category: "skill",
        strategyContext: "Proper pick technique for motion offense",
        relevance: "supporting",
        difficulty: 2,
        tags: ["offense", "picks", "technique"]
      },
      {
        name: "Ball Movement",
        duration: 8,
        category: "skill",
        strategyContext: "Quick ball movement to exploit defensive shifts",
        relevance: "supporting",
        difficulty: 2,
        tags: ["passing", "offense", "movement"]
      },
      {
        name: "Finishing Drills",
        duration: 10,
        category: "skill",
        strategyContext: "Converting opportunities created by motion offense",
        relevance: "supporting",
        difficulty: 3,
        tags: ["shooting", "finishing", "offense"]
      }
    ],
    progression: [
      {
        name: "6v6 Motion Offense",
        duration: 20,
        category: "concept",
        strategyContext: "Full team execution of Cuse motion patterns",
        relevance: "progression",
        difficulty: 5,
        tags: ["offense", "team", "motion"]
      },
      {
        name: "Motion vs Pressure D",
        duration: 15,
        category: "concept",
        strategyContext: "Running motion against aggressive defense",
        relevance: "progression",
        difficulty: 5,
        tags: ["offense", "pressure", "advanced"]
      },
      {
        name: "Motion to Fast Break",
        duration: 12,
        category: "concept",
        strategyContext: "Transitioning from motion to fast break opportunities",
        relevance: "progression",
        difficulty: 4,
        tags: ["offense", "transition", "fastbreak"]
      }
    ]
  },
  "2-3-1 Motion Offense": {
    essential: [
      {
        name: "2-3-1 Formation Drill",
        duration: 10,
        category: "concept",
        strategyContext: "Establishing proper 2-3-1 spacing and positioning",
        relevance: "essential",
        difficulty: 2,
        tags: ["offense", "formation", "spacing"]
      },
      {
        name: "Wing Dodges",
        duration: 8,
        category: "1v1",
        strategyContext: "Primary initiation from wing positions in 2-3-1",
        relevance: "essential",
        difficulty: 3,
        tags: ["offense", "dodging", "wings"]
      },
      {
        name: "Crease Play",
        duration: 10,
        category: "skill",
        strategyContext: "Essential crease movement and finishing in 2-3-1",
        relevance: "essential",
        difficulty: 3,
        tags: ["offense", "crease", "finishing"]
      }
    ],
    supporting: [
      {
        name: "Skip Passing",
        duration: 6,
        category: "skill",
        strategyContext: "Cross-field passing to exploit 2-3-1 spacing",
        relevance: "supporting",
        difficulty: 3,
        tags: ["passing", "offense", "spacing"]
      },
      {
        name: "Two-Man Game",
        duration: 10,
        category: "concept",
        strategyContext: "Pick and roll concepts within 2-3-1 structure",
        relevance: "supporting",
        difficulty: 3,
        tags: ["offense", "picks", "teamwork"]
      },
      {
        name: "Midfield Shooting",
        duration: 8,
        category: "skill",
        strategyContext: "Outside shooting opportunities from 2-3-1 positions",
        relevance: "supporting",
        difficulty: 3,
        tags: ["shooting", "midfield", "offense"]
      }
    ],
    progression: [
      {
        name: "Full 2-3-1 Motion",
        duration: 20,
        category: "concept",
        strategyContext: "Complete 2-3-1 motion offense with all rotations",
        relevance: "progression",
        difficulty: 4,
        tags: ["offense", "team", "motion"]
      },
      {
        name: "2-3-1 vs Zone Defense",
        duration: 15,
        category: "concept",
        strategyContext: "Adapting 2-3-1 motion against zone defenses",
        relevance: "progression",
        difficulty: 5,
        tags: ["offense", "zone", "advanced"]
      },
      {
        name: "2-3-1 Special Plays",
        duration: 12,
        category: "concept",
        strategyContext: "Set plays and special situations from 2-3-1",
        relevance: "progression",
        difficulty: 4,
        tags: ["offense", "plays", "situations"]
      }
    ]
  },
  "Ground Ball Recovery": {
    essential: [
      {
        name: "Box Ground Balls",
        duration: 8,
        category: "skill",
        strategyContext: "Fundamental ground ball technique and body positioning",
        relevance: "essential",
        difficulty: 2,
        tags: ["groundball", "fundamentals", "technique"]
      },
      {
        name: "50/50 Ground Balls",
        duration: 10,
        category: "1v1",
        strategyContext: "Competitive ground ball situations",
        relevance: "essential",
        difficulty: 3,
        tags: ["groundball", "competition", "1v1"]
      },
      {
        name: "Ground Ball to Outlet",
        duration: 8,
        category: "skill",
        strategyContext: "Securing possession and making the first pass",
        relevance: "essential",
        difficulty: 3,
        tags: ["groundball", "passing", "transition"]
      }
    ],
    supporting: [
      {
        name: "Body Positioning",
        duration: 5,
        category: "skill",
        strategyContext: "Proper body mechanics for ground ball success",
        relevance: "supporting",
        difficulty: 2,
        tags: ["fundamentals", "technique", "positioning"]
      },
      {
        name: "Ground Ball Circuits",
        duration: 12,
        category: "skill",
        strategyContext: "High-rep ground ball practice for muscle memory",
        relevance: "supporting",
        difficulty: 2,
        tags: ["groundball", "conditioning", "reps"]
      },
      {
        name: "Team Ground Balls",
        duration: 10,
        category: "concept",
        strategyContext: "Team support and communication on ground balls",
        relevance: "supporting",
        difficulty: 3,
        tags: ["groundball", "teamwork", "communication"]
      }
    ],
    progression: [
      {
        name: "Ground Ball to Fast Break",
        duration: 12,
        category: "concept",
        strategyContext: "Converting ground balls into transition offense",
        relevance: "progression",
        difficulty: 4,
        tags: ["groundball", "transition", "offense"]
      },
      {
        name: "Scramble Situations",
        duration: 10,
        category: "concept",
        strategyContext: "Multiple ground balls and chaotic situations",
        relevance: "progression",
        difficulty: 4,
        tags: ["groundball", "scramble", "advanced"]
      },
      {
        name: "Ground Ball Under Pressure",
        duration: 8,
        category: "concept",
        strategyContext: "Securing possession with immediate defensive pressure",
        relevance: "progression",
        difficulty: 4,
        tags: ["groundball", "pressure", "advanced"]
      }
    ]
  },
  "Transition Defense": {
    essential: [
      {
        name: "Numbers Down Defense",
        duration: 10,
        category: "concept",
        strategyContext: "Defending when outnumbered in transition",
        relevance: "essential",
        difficulty: 4,
        tags: ["defense", "transition", "numbers"]
      },
      {
        name: "Sprint Back Defense",
        duration: 8,
        category: "skill",
        strategyContext: "Recovery speed and defensive positioning",
        relevance: "essential",
        difficulty: 3,
        tags: ["defense", "transition", "speed"]
      },
      {
        name: "Communication in Transition",
        duration: 6,
        category: "concept",
        strategyContext: "Organizing defense on the fly",
        relevance: "essential",
        difficulty: 3,
        tags: ["defense", "communication", "transition"]
      }
    ],
    supporting: [
      {
        name: "Slide Recovery",
        duration: 8,
        category: "skill",
        strategyContext: "Quick recovery after sliding in transition",
        relevance: "supporting",
        difficulty: 3,
        tags: ["defense", "sliding", "recovery"]
      },
      {
        name: "Defensive Positioning",
        duration: 6,
        category: "skill",
        strategyContext: "Proper positioning to prevent transition goals",
        relevance: "supporting",
        difficulty: 2,
        tags: ["defense", "positioning", "fundamentals"]
      },
      {
        name: "Goalie Communication",
        duration: 5,
        category: "concept",
        strategyContext: "Goalie directing transition defense",
        relevance: "supporting",
        difficulty: 3,
        tags: ["goalie", "communication", "defense"]
      }
    ],
    progression: [
      {
        name: "Full Field Transition",
        duration: 15,
        category: "concept",
        strategyContext: "Complete transition defense from offense to defense",
        relevance: "progression",
        difficulty: 5,
        tags: ["transition", "fullfield", "advanced"]
      },
      {
        name: "Transition to Settled D",
        duration: 12,
        category: "concept",
        strategyContext: "Converting from transition to settled defense",
        relevance: "progression",
        difficulty: 4,
        tags: ["defense", "transition", "settled"]
      },
      {
        name: "Transition Scramble",
        duration: 10,
        category: "concept",
        strategyContext: "Defending chaotic transition situations",
        relevance: "progression",
        difficulty: 5,
        tags: ["defense", "scramble", "advanced"]
      }
    ]
  }
}

export function getStrategyRecommendations(strategyId: string): StrategyMapping | null {
  // Map strategy IDs to names
  const strategyNameMap: Record<string, string> = {
    'demo-1': '4-3 Alpha Clear',
    'demo-2': 'Cuse Motion Offense',
    'demo-3': '2-3-1 Motion Offense',
    'demo-4': 'Ground Ball Recovery',
    'demo-5': 'Transition Defense'
  }
  
  const strategyName = strategyNameMap[strategyId] || strategyId
  return strategyDrillMappings[strategyName] || null
}