export interface TemplateTimeSlot {
  id: string
  drills: {
    id: string
    name: string
    description: string
    duration: number
    category: string
    equipment?: string[]
    notes?: string
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced'
  }[]
  duration: number
  category: 'warm-up' | 'skill-development' | 'scrimmage' | 'conditioning' | 'cool-down'
}

export interface PracticeTemplate {
  id: string
  name: string
  description: string
  ageGroup: '8-10' | '11-14' | '15-18'
  duration: number
  focus: string[]
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  timeSlots: TemplateTimeSlot[]
  notes: string
  equipment: string[]
  coachingTips: string[]
}

export const practiceTemplates: PracticeTemplate[] = [
  {
    id: 'beginner-fundamentals-8-10',
    name: 'Fundamentals Fun',
    description: 'Basic skills introduction with lots of movement and fun activities',
    ageGroup: '8-10',
    duration: 60,
    focus: ['Catching', 'Throwing', 'Ground Balls', 'Running'],
    difficulty: 'Beginner',
    timeSlots: [
      {
        id: 'warmup-1',
        category: 'warm-up',
        duration: 10,
        drills: [
          {
            id: 'dynamic-warmup',
            name: 'Dynamic Warm-Up',
            description: 'Light jogging, arm circles, leg swings, and movement prep',
            duration: 10,
            category: 'Warm-Up',
            equipment: ['Cones'],
            notes: 'Keep it fun with games like follow the leader'
          }
        ]
      },
      {
        id: 'catching-1',
        category: 'skill-development',
        duration: 15,
        drills: [
          {
            id: 'wall-ball-basic',
            name: 'Wall Ball Basics',
            description: 'Simple catching and throwing against a wall',
            duration: 15,
            category: 'Stick Skills',
            equipment: ['Lacrosse balls', 'Wall or rebounder'],
            notes: 'Start close (5 feet) and focus on proper catching form',
            difficulty: 'Beginner'
          }
        ]
      },
      {
        id: 'ground-balls-1',
        category: 'skill-development',
        duration: 15,
        drills: [
          {
            id: 'treasure-hunt',
            name: 'Ground Ball Treasure Hunt',
            description: 'Pick up stationary balls like collecting treasure',
            duration: 15,
            category: 'Ground Balls',
            equipment: ['Lacrosse balls', 'Cones'],
            notes: 'Make it a game - who can collect the most treasure?'
          }
        ]
      },
      {
        id: 'fun-games',
        category: 'scrimmage',
        duration: 15,
        drills: [
          {
            id: 'sharks-minnows',
            name: 'Sharks and Minnows',
            description: 'Tag-based game with lacrosse sticks',
            duration: 15,
            category: 'Games',
            equipment: ['Sticks', 'Cones for boundaries'],
            notes: 'Builds stick handling while moving'
          }
        ]
      },
      {
        id: 'cooldown-1',
        category: 'cool-down',
        duration: 5,
        drills: [
          {
            id: 'circle-stretch',
            name: 'Circle Stretching',
            description: 'Group stretching in a circle with simple stretches',
            duration: 5,
            category: 'Cool Down',
            notes: 'Keep it social and positive'
          }
        ]
      }
    ],
    notes: 'Focus on fun and movement. Keep instructions simple and provide lots of encouragement.',
    equipment: ['Lacrosse sticks', 'Lacrosse balls', 'Cones', 'Wall or rebounder'],
    coachingTips: [
      'Use simple language and demonstrations',
      'Keep drills short (10-15 minutes max)',
      'Focus on effort over perfection',
      'Make everything a game when possible',
      'Provide lots of positive reinforcement'
    ]
  },
  {
    id: 'intermediate-skills-11-14',
    name: 'Skill Development Focus',
    description: 'Building on fundamentals with more complex drills and tactical awareness',
    ageGroup: '11-14',
    duration: 90,
    focus: ['Dodging', 'Shooting', 'Defense', 'Team Play'],
    difficulty: 'Intermediate',
    timeSlots: [
      {
        id: 'warmup-2',
        category: 'warm-up',
        duration: 15,
        drills: [
          {
            id: 'dynamic-warmup-advanced',
            name: 'Dynamic Warm-Up with Sticks',
            description: 'Movement prep combined with basic stick work',
            duration: 15,
            category: 'Warm-Up',
            equipment: ['Sticks', 'Balls', 'Cones']
          }
        ]
      },
      {
        id: 'stick-skills-2',
        category: 'skill-development',
        duration: 20,
        drills: [
          {
            id: 'dodging-basics',
            name: 'Basic Dodging Progression',
            description: 'Face dodge, split dodge, and roll dodge fundamentals',
            duration: 20,
            category: 'Dodging',
            equipment: ['Sticks', 'Balls', 'Cones'],
            difficulty: 'Intermediate'
          }
        ]
      },
      {
        id: 'shooting-2',
        category: 'skill-development',
        duration: 20,
        drills: [
          {
            id: 'shooting-progression',
            name: 'Shooting Progression',
            description: 'Stationary shooting to shooting on the run',
            duration: 20,
            category: 'Shooting',
            equipment: ['Goals', 'Balls', 'Cones'],
            notes: 'Focus on form before power'
          }
        ]
      },
      {
        id: 'team-play-2',
        category: 'scrimmage',
        duration: 25,
        drills: [
          {
            id: 'small-sided-games',
            name: '4v4 Small-Sided Games',
            description: 'Half-field games focusing on movement and decision making',
            duration: 25,
            category: 'Scrimmage',
            equipment: ['Full field setup'],
            notes: 'Emphasize communication and teamwork'
          }
        ]
      },
      {
        id: 'cooldown-2',
        category: 'cool-down',
        duration: 10,
        drills: [
          {
            id: 'team-stretch',
            name: 'Team Stretching & Review',
            description: 'Stretching with brief practice review',
            duration: 10,
            category: 'Cool Down',
            notes: 'Ask players what they learned'
          }
        ]
      }
    ],
    notes: 'Balance skill development with game application. Start introducing tactical concepts.',
    equipment: ['Lacrosse sticks', 'Lacrosse balls', 'Goals', 'Cones', 'Pinnies'],
    coachingTips: [
      'Provide more detailed technical instruction',
      'Begin introducing game situations',
      'Encourage players to coach each other',
      'Focus on decision-making skills',
      'Set higher expectations for effort and attention'
    ]
  },
  {
    id: 'advanced-tactics-15-18',
    name: 'Advanced Tactical Development',
    description: 'Complex strategies, conditioning, and game preparation for high school level',
    ageGroup: '15-18',
    duration: 120,
    focus: ['Advanced Tactics', 'Conditioning', 'Leadership', 'Game Preparation'],
    difficulty: 'Advanced',
    timeSlots: [
      {
        id: 'warmup-3',
        category: 'warm-up',
        duration: 15,
        drills: [
          {
            id: 'pre-practice-prep',
            name: 'Pre-Practice Preparation',
            description: 'Player-led dynamic warm-up with stick work',
            duration: 15,
            category: 'Warm-Up',
            equipment: ['Sticks', 'Balls'],
            notes: 'Captains lead warm-up'
          }
        ]
      },
      {
        id: 'advanced-skills',
        category: 'skill-development',
        duration: 30,
        drills: [
          {
            id: 'advanced-dodging',
            name: 'Advanced Dodging & Finishing',
            description: 'Complex dodge combinations with immediate shooting',
            duration: 30,
            category: 'Advanced Skills',
            equipment: ['Goals', 'Balls', 'Cones', 'Defensive equipment'],
            difficulty: 'Advanced'
          }
        ]
      },
      {
        id: 'tactical-work',
        category: 'skill-development',
        duration: 30,
        drills: [
          {
            id: 'set-plays',
            name: 'Offensive Set Plays',
            description: 'Practice specific offensive plays and counters',
            duration: 30,
            category: 'Tactics',
            equipment: ['Full field setup', 'Pinnies'],
            notes: 'Focus on timing and communication'
          }
        ]
      },
      {
        id: 'scrimmage-3',
        category: 'scrimmage',
        duration: 30,
        drills: [
          {
            id: 'live-scrimmage',
            name: 'Full-Field Scrimmage',
            description: 'Game-like situations with specific focuses',
            duration: 30,
            category: 'Scrimmage',
            equipment: ['Full field setup', 'Officials equipment'],
            notes: 'Stop play to coach specific situations'
          }
        ]
      },
      {
        id: 'conditioning-3',
        category: 'conditioning',
        duration: 10,
        drills: [
          {
            id: 'sport-specific-conditioning',
            name: 'Lacrosse-Specific Conditioning',
            description: 'High-intensity intervals mimicking game demands',
            duration: 10,
            category: 'Conditioning',
            equipment: ['Cones', 'Timer']
          }
        ]
      },
      {
        id: 'cooldown-3',
        category: 'cool-down',
        duration: 5,
        drills: [
          {
            id: 'team-meeting',
            name: 'Cool Down & Team Meeting',
            description: 'Stretching followed by team discussion',
            duration: 5,
            category: 'Cool Down',
            notes: 'Address upcoming games and goals'
          }
        ]
      }
    ],
    notes: 'High-intensity practice focusing on game preparation and advanced concepts.',
    equipment: ['Complete lacrosse equipment', 'Goals', 'Cones', 'Pinnies', 'Timer', 'Whiteboard'],
    coachingTips: [
      'Expect high-level execution and effort',
      'Focus on game-specific situations',
      'Develop player leadership and ownership',
      'Emphasize mental aspects of the game',
      'Prepare players for next level competition'
    ]
  }
]

export function getTemplatesByAgeGroup(ageGroup: '8-10' | '11-14' | '15-18') {
  return practiceTemplates.filter(template => template.ageGroup === ageGroup)
}

export function getTemplateById(id: string) {
  return practiceTemplates.find(template => template.id === id)
}