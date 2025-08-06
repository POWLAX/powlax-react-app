import React, { useState, useEffect, useRef } from 'react'
import { useSpring, animated } from '@react-spring/web'

interface SkillNode {
  id: string
  name: string
  description: string
  category: 'attack' | 'defense' | 'midfield' | 'goalie' | 'fundamentals'
  tier: number
  unlocked: boolean
  progress: number
  requirements: string[]
  x: number
  y: number
  icon: string
}

interface Connection {
  from: string
  to: string
  unlocked: boolean
}

interface SkillTreeSVGProps {
  nodes: SkillNode[]
  connections: Connection[]
  onNodeClick: (node: SkillNode) => void
  selectedNode?: string
}

export default function SkillTreeSVG({ 
  nodes, 
  connections, 
  onNodeClick, 
  selectedNode 
}: SkillTreeSVGProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [pathAnimations, setPathAnimations] = useState<Record<string, number>>({})
  const svgRef = useRef<SVGSVGElement>(null)

  // Category colors
  const categoryColors = {
    attack: '#FF4444',
    defense: '#4444FF',
    midfield: '#44FF44',
    goalie: '#FF8844',
    fundamentals: '#8844FF'
  }

  // Animate path drawing when connections unlock
  useEffect(() => {
    connections.forEach(conn => {
      if (conn.unlocked && !pathAnimations[`${conn.from}-${conn.to}`]) {
        setPathAnimations(prev => ({
          ...prev,
          [`${conn.from}-${conn.to}`]: 1
        }))
      }
    })
  }, [connections, pathAnimations])

  // Create SVG path between two nodes
  const createPath = (fromNode: SkillNode, toNode: SkillNode): string => {
    const dx = toNode.x - fromNode.x
    const dy = toNode.y - fromNode.y
    const midX = fromNode.x + dx * 0.5
    const midY = fromNode.y + dy * 0.3

    return `M ${fromNode.x} ${fromNode.y} Q ${midX} ${midY} ${toNode.x} ${toNode.y}`
  }

  // Calculate path length for animation
  const getPathLength = (path: string): number => {
    if (!svgRef.current) return 0
    const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    tempPath.setAttribute('d', path)
    svgRef.current.appendChild(tempPath)
    const length = tempPath.getTotalLength()
    svgRef.current.removeChild(tempPath)
    return length
  }

  // Node hover spring
  const nodeSpring = useSpring({
    scale: hoveredNode ? 1.1 : 1,
    glow: hoveredNode ? 1 : 0,
    config: { tension: 300, friction: 20 }
  })

  return (
    <div className="skill-tree-container">
      <svg
        ref={svgRef}
        viewBox="0 0 1200 800"
        className="skill-tree-svg"
        style={{
          width: '100%',
          height: '600px',
          background: 'radial-gradient(ellipse at center, #2a4365 0%, #1a202c 100%)'
        }}
      >
        {/* Grid pattern background */}
        <defs>
          <pattern
            id="grid"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          </pattern>
          
          {/* Glow filters for each category */}
          {Object.entries(categoryColors).map(([category, color]) => (
            <filter key={category} id={`glow-${category}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          ))}

          {/* Arrow marker */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="rgba(255,255,255,0.6)"
            />
          </marker>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Connection paths */}
        {connections.map(conn => {
          const fromNode = nodes.find(n => n.id === conn.from)
          const toNode = nodes.find(n => n.id === conn.to)
          
          if (!fromNode || !toNode) return null

          const pathData = createPath(fromNode, toNode)
          const pathLength = getPathLength(pathData)
          const isAnimated = pathAnimations[`${conn.from}-${conn.to}`]

          return (
            <g key={`${conn.from}-${conn.to}`}>
              {/* Base path */}
              <path
                d={pathData}
                fill="none"
                stroke={conn.unlocked ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)"}
                strokeWidth="2"
                strokeDasharray={conn.unlocked ? "none" : "5,5"}
                markerEnd={conn.unlocked ? "url(#arrowhead)" : ""}
              />
              
              {/* Animated flowing path */}
              {conn.unlocked && (
                <path
                  d={pathData}
                  fill="none"
                  stroke="rgba(100,200,255,0.8)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${pathLength * 0.1} ${pathLength}`}
                  style={{
                    animation: `pathFlow 3s linear infinite`,
                    strokeDashoffset: pathLength
                  }}
                />
              )}
            </g>
          )
        })}

        {/* Skill nodes */}
        {nodes.map(node => {
          const isSelected = selectedNode === node.id
          const isHovered = hoveredNode === node.id
          const categoryColor = categoryColors[node.category]

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => onNodeClick(node)}
            >
              {/* Node glow effect */}
              {(isHovered || isSelected) && (
                <circle
                  r="45"
                  fill="none"
                  stroke={categoryColor}
                  strokeWidth="3"
                  opacity="0.6"
                  filter={`url(#glow-${node.category})`}
                  style={{
                    animation: isSelected ? 'selectedPulse 2s ease-in-out infinite' : 'none'
                  }}
                />
              )}

              {/* Main node circle */}
              <circle
                r="35"
                fill={node.unlocked 
                  ? `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}88 100%)`
                  : 'rgba(100,100,100,0.3)'
                }
                stroke={node.unlocked ? categoryColor : 'rgba(150,150,150,0.5)'}
                strokeWidth="3"
                style={{
                  transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.2s ease'
                }}
              />

              {/* Progress ring for partially completed nodes */}
              {!node.unlocked && node.progress > 0 && (
                <circle
                  r="38"
                  fill="none"
                  stroke={categoryColor}
                  strokeWidth="4"
                  strokeDasharray={`${node.progress * 2.4} 240`}
                  strokeLinecap="round"
                  transform="rotate(-90)"
                  opacity="0.8"
                />
              )}

              {/* Node icon/tier number */}
              <text
                textAnchor="middle"
                dy="0.3em"
                fontSize="16"
                fontWeight="bold"
                fill={node.unlocked ? "white" : "rgba(200,200,200,0.7)"}
                style={{
                  filter: node.unlocked ? 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))' : 'none'
                }}
              >
                {node.icon || node.tier}
              </text>

              {/* Lock icon for locked nodes */}
              {!node.unlocked && node.progress === 0 && (
                <text
                  textAnchor="middle"
                  dy="0.3em"
                  fontSize="20"
                  fill="rgba(200,200,200,0.5)"
                >
                  🔒
                </text>
              )}

              {/* Node label */}
              <text
                textAnchor="middle"
                y="55"
                fontSize="12"
                fontWeight="bold"
                fill={node.unlocked ? "white" : "rgba(200,200,200,0.6)"}
                style={{
                  filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))'
                }}
              >
                {node.name}
              </text>

              {/* Tier indicator */}
              <circle
                cx="25"
                cy="-25"
                r="8"
                fill={categoryColor}
                stroke="white"
                strokeWidth="2"
              />
              <text
                x="25"
                y="-25"
                textAnchor="middle"
                dy="0.3em"
                fontSize="10"
                fontWeight="bold"
                fill="white"
              >
                {node.tier}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Node tooltip */}
      {hoveredNode && (
        <div className="skill-tooltip">
          {(() => {
            const node = nodes.find(n => n.id === hoveredNode)
            if (!node) return null

            return (
              <div 
                style={{
                  position: 'absolute',
                  background: 'rgba(0,0,0,0.9)',
                  color: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  border: `2px solid ${categoryColors[node.category]}`,
                  maxWidth: '300px',
                  zIndex: 1000,
                  left: '20px',
                  top: '20px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                }}
              >
                <h3 style={{ 
                  margin: '0 0 8px 0', 
                  color: categoryColors[node.category],
                  fontSize: '18px'
                }}>
                  {node.name}
                </h3>
                <p style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  {node.description}
                </p>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  <div>Category: <span style={{ color: categoryColors[node.category] }}>
                    {node.category.toUpperCase()}
                  </span></div>
                  <div>Tier: {node.tier}</div>
                  {!node.unlocked && (
                    <div>Progress: {Math.round(node.progress)}%</div>
                  )}
                  {node.requirements.length > 0 && (
                    <div>
                      Requires: {node.requirements.map(req => 
                        nodes.find(n => n.id === req)?.name || req
                      ).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
        </div>
      )}

      <style jsx>{`
        .skill-tree-container {
          position: relative;
          width: 100%;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }

        .skill-tree-svg {
          border-radius: 12px;
        }

        @keyframes pathFlow {
          0% {
            stroke-dashoffset: var(--path-length);
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes selectedPulse {
          0%, 100% {
            stroke-opacity: 0.6;
            transform: scale(1);
          }
          50% {
            stroke-opacity: 1;
            transform: scale(1.05);
          }
        }

        @media (max-width: 768px) {
          .skill-tree-svg {
            height: 400px;
          }
          
          .skill-tooltip {
            max-width: 250px !important;
            font-size: 12px !important;
          }
        }
      `}</style>
    </div>
  )
}

// Demo data and component
export function SkillTreeDemo() {
  const [selectedNode, setSelectedNode] = useState<string>()

  const demoNodes: SkillNode[] = [
    // Fundamentals tier
    { id: 'f1', name: 'Catching', description: 'Basic ball catching techniques', category: 'fundamentals', tier: 1, unlocked: true, progress: 100, requirements: [], x: 200, y: 400, icon: '🥍' },
    { id: 'f2', name: 'Throwing', description: 'Fundamental throwing mechanics', category: 'fundamentals', tier: 1, unlocked: true, progress: 100, requirements: [], x: 400, y: 400, icon: '🎯' },
    { id: 'f3', name: 'Scooping', description: 'Ground ball pickup skills', category: 'fundamentals', tier: 1, unlocked: true, progress: 100, requirements: [], x: 300, y: 300, icon: '⚡' },
    
    // Attack tier 2
    { id: 'a1', name: 'Shooting', description: 'Basic shooting techniques and accuracy', category: 'attack', tier: 2, unlocked: true, progress: 100, requirements: ['f2'], x: 500, y: 300, icon: '🚀' },
    { id: 'a2', name: 'Dodging', description: '1v1 offensive moves and fakes', category: 'attack', tier: 2, unlocked: false, progress: 65, requirements: ['f1', 'f3'], x: 350, y: 200, icon: '💨' },
    
    // Defense tier 2
    { id: 'd1', name: 'Body Check', description: 'Legal defensive contact techniques', category: 'defense', tier: 2, unlocked: false, progress: 30, requirements: ['f3'], x: 200, y: 200, icon: '🛡️' },
    { id: 'd2', name: 'Poke Check', description: 'Stick checking and ball disruption', category: 'defense', tier: 2, unlocked: false, progress: 0, requirements: ['f1'], x: 100, y: 300, icon: '⚔️' },
    
    // Advanced tier 3
    { id: 'a3', name: 'Behind Goal', description: 'X-area offensive strategies', category: 'attack', tier: 3, unlocked: false, progress: 0, requirements: ['a1', 'a2'], x: 500, y: 150, icon: '🎭' },
    { id: 'd3', name: 'Team Defense', description: 'Communication and help defense', category: 'defense', tier: 3, unlocked: false, progress: 0, requirements: ['d1', 'd2'], x: 150, y: 100, icon: '👥' },
    
    // Midfield
    { id: 'm1', name: 'Faceoffs', description: 'Winning possession at the X', category: 'midfield', tier: 2, unlocked: false, progress: 45, requirements: ['f1', 'f3'], x: 300, y: 500, icon: '⚪' },
    { id: 'm2', name: 'Transition', description: 'Fast break offense and defense', category: 'midfield', tier: 3, unlocked: false, progress: 0, requirements: ['m1', 'a1'], x: 400, y: 550, icon: '🏃' }
  ]

  const demoConnections: Connection[] = [
    { from: 'f1', to: 'a2', unlocked: true },
    { from: 'f2', to: 'a1', unlocked: true },
    { from: 'f3', to: 'a2', unlocked: true },
    { from: 'f3', to: 'd1', unlocked: true },
    { from: 'f1', to: 'd2', unlocked: true },
    { from: 'f1', to: 'm1', unlocked: true },
    { from: 'f3', to: 'm1', unlocked: true },
    { from: 'a1', to: 'a3', unlocked: false },
    { from: 'a2', to: 'a3', unlocked: false },
    { from: 'd1', to: 'd3', unlocked: false },
    { from: 'd2', to: 'd3', unlocked: false },
    { from: 'm1', to: 'm2', unlocked: false },
    { from: 'a1', to: 'm2', unlocked: false }
  ]

  return (
    <div style={{ padding: '20px', background: '#1a202c', minHeight: '100vh' }}>
      <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '30px' }}>
        POWLAX Skills Tree
      </h1>
      
      <SkillTreeSVG
        nodes={demoNodes}
        connections={demoConnections}
        onNodeClick={(node) => {
          setSelectedNode(node.id === selectedNode ? undefined : node.id)
          console.log('Selected node:', node)
        }}
        selectedNode={selectedNode}
      />
      
      <div style={{ 
        color: 'white', 
        textAlign: 'center', 
        marginTop: '20px',
        fontSize: '14px',
        opacity: 0.8
      }}>
        Click nodes to select • Hover for details • Progress rings show completion
      </div>
    </div>
  )
}