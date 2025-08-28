'use client'

import React, { useState } from 'react'

import Image from 'next/image'

import { TEAM_COLORS_ENUM } from '@/utils/dbUtils'

import { DbTeamColor } from '@/types/database/dbTypeAliases'

type BuildingColor = DbTeamColor

interface Building {
  id: string
  name: string
  path: string
  color: BuildingColor
  center: [number, number]
  description: string
}

interface Location {
  id: string
  name: string
  path: string
  center: [number, number]
  description: string
}

const teamColorToBadgeClass = (team: DbTeamColor) => {
  switch (team) {
    case 'orange':
      return 'bg-orange-500'
    case 'purple':
      return 'bg-purple-500'
    case 'green':
      return 'bg-green-500'
    case 'unassigned':
      return 'bg-gray-500'
  }
}

const getBuildingColorClasses = (color: BuildingColor): string => {
  switch (color) {
    case 'orange':
      return 'fill-orange-500/70 hover:fill-orange-600/90'
    case 'purple':
      return 'fill-purple-500/70 hover:fill-purple-600/90'
    case 'green':
      return 'fill-green-500/70 hover:fill-green-600/90'
    case 'unassigned':
    default:
      return 'fill-gray-500/30 hover:fill-gray-600/40'
  }
}

const getEdgeColor = (color: BuildingColor): string => {
  const badgeClass = teamColorToBadgeClass(color)
  switch (badgeClass) {
    case 'bg-orange-500':
      return '#f97316' // orange-500
    case 'bg-purple-500':
      return '#a855f7' // purple-500
    case 'bg-green-500':
      return '#22c55e' // green-500
    case 'bg-gray-500':
    default:
      return '#6b7280' // gray-500
  }
}

const buildings: Building[] = [
  {
    id: 'A',
    name: 'Building A',
    path: 'm 550.81359,537.45385 82.36465,1.96106 -0.24514,3.18673 36.76994,0.7354 0.98053,54.4195 23.77789,-0.7354 v 22.18452 h 6.61859 l -0.49027,12.37921 3.92213,-0.12256 v 6.12832 l 8.45708,-0.24513 0.7354,83.22261 14.58541,0.49027 c 0,0 0.24513,36.52479 -0.24514,36.64736 -0.49026,0.12257 -34.19603,0.49027 -34.19603,0.49027 l 0.73539,36.64736 -70.108,2.5739 -0.49027,-25.24869 -84.93854,-1.22566 v 7.47655 l -46.69781,3.06416 -46.82039,-3.92213 -7.10885,-2.69646 0.24513,-6.37345 -18.2624,-1.22567 c 0,0 -1.83849,-33.5832 -1.83849,-34.07347 0,-0.49026 5.14779,-38.24073 5.14779,-38.24073 l 0.49026,-31.13187 -5.02522,-38.3633 4.28983,-39.34383 25.86151,-0.24513 v -4.28983 l 8.08939,-0.49026 0.85796,-36.27967 45.22702,0.7354 c 0,0 6.49602,0.24513 6.98629,0.12257 0.49026,-0.12257 39.83409,4.53496 39.83409,3.30929 0,-1.22566 0.49027,-11.52124 0.49027,-11.52124 z',
    color: 'unassigned',
    center: [580, 620],
    description: '',
  },
  {
    id: 'B',
    name: 'Building B',
    path: 'm 654.99506,442.21972 h 100.50448 l -1.22566,-101.23988 -17.64957,-0.49027 0.24514,-14.9531 -6.86372,0.24513 v -10.05045 l 34.3186,-1.71593 0.49026,-28.92568 -7.84425,0.49027 v -41.18233 l -174.28948,0.49027 -0.49026,21.08143 -18.6301,0.49026 c 0,0 -27.45489,-18.87523 -51.47791,4.65753 -24.02302,23.53276 -5.63805,47.06551 -5.63805,47.06551 l -0.49027,85.30625 h 50.25224 l 1.22567,10.54071 h 22.06196 l 0.24513,-8.82478 75.01066,0.49026 z',
    color: 'purple',
    center: [640, 380],
    description: '',
  },
  {
    id: 'C',
    name: 'Building C',
    path: 'm 888.85183,330.43913 h 100.01422 l 3.92212,161.29743 c 0,0 -5.39292,11.27612 -8.33451,11.27612 -2.9416,0 -120.60538,-1.4708 -120.60538,-1.4708 l 0.98053,-46.57525 -26.47435,-0.98053 v -41.18233 h 15.19824 l -0.49027,27.45489 10.78585,-1.4708 -0.49027,-38.24073 26.47435,-2.94159 z',
    color: 'unassigned',
    center: [940, 410],
    description: '',
  },
  {
    id: 'D',
    name: 'Building D',
    path: 'm 763.09866,518.21091 10e-6,21.32657 7.35398,0.49026 -0.49026,17.8947 -29.90622,-0.24513 -0.98053,42.65312 h 14.70797 l 1.22567,-26.96462 h 14.21771 l -0.49027,15.93364 -5.14779,-0.24513 v 22.79736 l 16.4239,-0.24514 v 4.90266 l 174.77975,1.96106 1.22566,-107.85847 -175.76027,0.24514 -0.24514,7.35398 z',
    color: 'unassigned',
    center: [850, 550],
    description: '',
  },
  {
    id: 'E',
    name: 'Building E',
    path: 'm 825.60755,652.05347 109.81953,0.98053 -1.4708,149.04079 1.4708,32.35754 -2.94159,30.88675 1.96106,139.23552 -68.14694,7.8442 -81.87439,-7.8442 0.49027,-127.46915 v -41.91772 l 8.82478,-0.49026 0.49027,-23.77789 54.17437,0.7354 2.45133,-108.10361 -24.75842,-0.73539 z',
    color: 'orange',
    center: [880, 800],
    description: '',
  },
  {
    id: 'F',
    name: 'Building F',
    path: 'm 1015.8307,683.17303 102.4655,0.25745 7.8443,25.98408 -5.8832,32.35754 0.3713,74.06497 -63.7592,1.63904 -53.0502,-1.42874 v -25.49382 l 12.9397,-0.7354 z',
    color: 'unassigned',
    center: [1070, 720],
    description: '',
  },
]

const locations: Location[] = [
  {
    id: 'thePark',
    name: 'The Park',
    path: 'm 167.64706,300 176.79207,-11.86605 v 100.01422 l 15.34617,-0.22403 31.39117,123.84057 h -33.33333 l -29.82792,0.91096 -28.92568,-0.49026 0.49027,7.84425 h -41.18233 v 12.72677 h -81.27416 -11.09187 z',
    center: [280, 380],
    description: '',
  },
  {
    id: 'eigenHall',
    name: 'Eigen Hall',
    path: 'M 814.46957,428.34191 814.99844,343.0331 694.5,341.57292 l -0.1875,21.41927 -28.25903,-0.48647 v 43.02797 L 693.9375,405.83073 693.75,427.25 Z',
    center: [754, 385],
    description: '',
  },
  {
    id: 'theClocktower',
    name: 'The Clocktower',
    path: 'm 398.45467,754.65968 -102.17693,-1.94454 1.06066,-126.92567 100.58594,0.35356 z',
    center: [347, 690],
    description: '3rd Floor',
  },
  {
    id: 'playtestingPlaza',
    name: 'Playtesting Plaza',
    path: 'm 344.43913,288.13395 v 100.01422 l 67.16641,-0.98053 2.94159,26.47435 100.99475,-0.49027 1.4708,-86.46839 -103.35521,1.23744 0.17414,-41.47417 z',
    center: [435, 338],
    description: '',
  },
]

interface Edge {
  fromBuilding: string
  toBuilding: string
  from: [number, number]
  to: [number, number]
  fromColor: BuildingColor
  toColor: BuildingColor
}
const edges: Edge[] = [
  {
    fromBuilding: 'A',
    toBuilding: 'B',
    from: [630, 550],
    to: [638, 397],
    fromColor: 'purple',
    toColor: 'unassigned',
  },
  {
    fromBuilding: 'B',
    toBuilding: 'C',
    from: [721, 313],
    to: [877, 412],
    fromColor: 'purple',
    toColor: 'unassigned',
  },
  {
    fromBuilding: 'C',
    toBuilding: 'D',
    from: [846, 444],
    to: [847, 523],
    fromColor: 'unassigned',
    toColor: 'unassigned',
  },
  {
    fromBuilding: 'D',
    toBuilding: 'E',
    from: [772, 600],
    to: [843, 670],
    fromColor: 'orange',
    toColor: 'unassigned',
  },
  {
    fromBuilding: 'E',
    toBuilding: 'F',
    from: [918, 794],
    to: [1013, 804],
    fromColor: 'orange',
    toColor: 'unassigned',
  },
  {
    fromBuilding: 'A',
    toBuilding: 'D',
    from: [688, 606],
    to: [747, 593],
    fromColor: 'unassigned',
    toColor: 'unassigned',
  },
  {
    fromBuilding: 'B',
    toBuilding: 'D',
    from: [744, 432],
    to: [791, 520],
    fromColor: 'purple',
    toColor: 'unassigned',
  },
  {
    fromBuilding: 'D',
    toBuilding: 'F',
    from: [1033, 702],
    to: [935, 598],
    fromColor: 'unassigned',
    toColor: 'unassigned',
  },
  {
    fromBuilding: 'A',
    toBuilding: 'E',
    from: [862, 788],
    to: [709, 737],
    fromColor: 'orange',
    toColor: 'unassigned',
  },
]

interface CampusMapProps {
  showMegagameNames?: boolean
  showLocationNames?: boolean
  showLocationDescription?: boolean
  highlightBuilding?: string
  highlightLocation?: string
  showMegagame?: boolean
  showMegagameElements?: boolean
  showMegagameColor?: boolean
  textScale?: number
}

export default function CampusMap({
  showMegagameNames = false,
  showLocationNames = false,
  showLocationDescription = false,
  highlightBuilding,
  highlightLocation,
  showMegagame = true,
  showMegagameElements = true,
  showMegagameColor = true,
  textScale = 1,
}: CampusMapProps = {}) {
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null)
  const [edgePositions, setEdgePositions] = useState(edges)
  const [dragState, setDragState] = useState<{
    edgeIndex: number
    endpoint: 'from' | 'to'
    offset: [number, number]
  } | null>(null)
  const [showDragHandles, setShowDragHandles] = useState(false)
  const [buildingColors, setBuildingColors] = useState<
    Record<string, BuildingColor>
  >(
    buildings.reduce(
      (acc, building) => ({ ...acc, [building.id]: building.color }),
      {},
    ),
  )

  const cycleColors: BuildingColor[] = TEAM_COLORS_ENUM

  const getBuildingDisplayColor = (buildingId: string): BuildingColor => {
    if (highlightBuilding) {
      return highlightBuilding === buildingId ? 'green' : 'unassigned'
    }
    if (showMegagame && showMegagameColor) {
      return buildingColors[buildingId]
    }
    return 'unassigned'
  }

  const toggleBuildingColor = (buildingId: string) => {
    const currentColor = buildingColors[buildingId]
    const currentIndex = cycleColors.indexOf(currentColor)
    const nextIndex = (currentIndex + 1) % cycleColors.length
    const newColor = cycleColors[nextIndex]

    // Update building color
    setBuildingColors((prev) => ({ ...prev, [buildingId]: newColor }))
  }

  const toggleEdgeColor = (edgeIndex: number, side: 'from' | 'to') => {
    setEdgePositions((prevEdges) =>
      prevEdges.map((edge, index) => {
        if (index === edgeIndex) {
          const currentColor = side === 'from' ? edge.fromColor : edge.toColor
          const currentIndex = cycleColors.indexOf(currentColor)
          const nextIndex = (currentIndex + 1) % cycleColors.length
          const newColor = cycleColors[nextIndex]

          return {
            ...edge,
            [side === 'from' ? 'fromColor' : 'toColor']: newColor,
          }
        }
        return edge
      }),
    )
  }

  // Make toggle function available globally
  React.useEffect(() => {
    const toggleFunction = () => {
      console.log('toggleEdgeDragging called, current state:', showDragHandles)
      setShowDragHandles((prev) => {
        const newValue = !prev
        console.log(`Edge dragging ${newValue ? 'enabled' : 'disabled'}`)
        return newValue
      })
    }

    ;(
      window as Window & { toggleEdgeDragging?: () => void }
    ).toggleEdgeDragging = toggleFunction
    console.log('toggleEdgeDragging function registered on window')

    return () => {
      delete (window as Window & { toggleEdgeDragging?: () => void })
        .toggleEdgeDragging
    }
  }, [showDragHandles])

  const handleMouseDown = (
    e: React.MouseEvent,
    edgeIndex: number,
    endpoint: 'from' | 'to',
  ) => {
    e.stopPropagation()
    const svgRect = (
      e.currentTarget.closest('svg') as SVGElement
    ).getBoundingClientRect()
    const svgPoint = [
      ((e.clientX - svgRect.left) / svgRect.width) * 1291,
      ((e.clientY - svgRect.top) / svgRect.height) * 1263,
    ]
    const edgePoint = edgePositions[edgeIndex][endpoint]
    setDragState({
      edgeIndex,
      endpoint,
      offset: [svgPoint[0] - edgePoint[0], svgPoint[1] - edgePoint[1]],
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState) return
    e.preventDefault()

    const svgRect = (
      e.currentTarget.closest('svg') as SVGElement
    ).getBoundingClientRect()
    const svgPoint = [
      ((e.clientX - svgRect.left) / svgRect.width) * 1291,
      ((e.clientY - svgRect.top) / svgRect.height) * 1263,
    ]
    const newPoint: [number, number] = [
      svgPoint[0] - dragState.offset[0],
      svgPoint[1] - dragState.offset[1],
    ]

    setEdgePositions((prev) => {
      const newEdges = [...prev]
      newEdges[dragState.edgeIndex] = {
        ...newEdges[dragState.edgeIndex],
        [dragState.endpoint]: newPoint,
      }
      return newEdges
    })
  }

  const handleMouseUp = () => {
    if (dragState) {
      // Console log the updated edges array
      console.log('const edges = [')
      edgePositions.forEach((edge, i) => {
        console.log(
          `  { fromBuilding: '${edge.fromBuilding}', toBuilding: '${edge.toBuilding}', from: [${Math.round(edge.from[0])}, ${Math.round(edge.from[1])}], to: [${Math.round(edge.to[0])}, ${Math.round(edge.to[1])}] }${i < edgePositions.length - 1 ? ',' : ''}`,
        )
      })
      console.log(']')
    }
    setDragState(null)
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="relative w-full max-w-4xl mx-auto">
        <div className="relative w-full aspect-square overflow-hidden">
          <Image
            src="/images/lighthaven.jpeg"
            alt="Lighthaven Campus"
            fill
            className="object-contain"
            style={{ transform: 'rotate(-90deg)' }}
            priority
          />

          <svg
            viewBox="0 0 1291 1263"
            className="absolute inset-0 w-full h-full pointer-events-auto"
            preserveAspectRatio="xMidYMid meet"
            style={{ transform: 'rotate(-90deg)' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <defs>
              {/* Create a mask that excludes building areas */}
              <mask id="edgesMask">
                {/* White background allows everything through */}
                <rect width="1291" height="1263" fill="white" />
                {/* Black building shapes block edges */}
                {buildings.map((building) => (
                  <path
                    key={`mask-${building.id}`}
                    d={building.path}
                    fill="black"
                  />
                ))}
              </mask>

              {/* Create gradients for each edge with sharp division along the line */}
              {edgePositions.map((edge, index) => {
                // Calculate the gradient direction along the line
                const dx = edge.to[0] - edge.from[0]
                const dy = edge.to[1] - edge.from[1]
                const length = Math.sqrt(dx * dx + dy * dy)
                const unitX = length > 0 ? dx / length : 1
                const unitY = length > 0 ? dy / length : 0

                // Set gradient to follow the line direction
                const x1 = 50 - unitX * 50
                const y1 = 50 - unitY * 50
                const x2 = 50 + unitX * 50
                const y2 = 50 + unitY * 50

                return (
                  <linearGradient
                    key={`gradient-${index}`}
                    id={`edgeGradient-${index}`}
                    x1={`${x1}%`}
                    y1={`${y1}%`}
                    x2={`${x2}%`}
                    y2={`${y2}%`}
                  >
                    <stop
                      offset="0%"
                      stopColor={getEdgeColor(edge.fromColor)}
                    />
                    <stop
                      offset="50%"
                      stopColor={getEdgeColor(edge.fromColor)}
                    />
                    <stop offset="50%" stopColor={getEdgeColor(edge.toColor)} />
                    <stop
                      offset="100%"
                      stopColor={getEdgeColor(edge.toColor)}
                    />
                  </linearGradient>
                )
              })}
            </defs>

            {/* Edges layer - masked to hide under buildings */}
            {showMegagame && showMegagameElements && (
              <g className="edges-layer" mask="url(#edgesMask)">
                {edgePositions.map((edge, index) => {
                  // Calculate center point of the edge
                  const centerX = (edge.from[0] + edge.to[0]) / 2
                  const centerY = (edge.from[1] + edge.to[1]) / 2

                  return (
                    <g key={`edge-group-${index}`}>
                      {/* White outline */}
                      <line
                        x1={edge.from[0]}
                        y1={edge.from[1]}
                        x2={edge.to[0]}
                        y2={edge.to[1]}
                        stroke="white"
                        strokeWidth="11"
                        strokeOpacity="1.0"
                        strokeLinecap="round"
                      />
                      {/* Colored line */}
                      <line
                        x1={edge.from[0]}
                        y1={edge.from[1]}
                        x2={edge.to[0]}
                        y2={edge.to[1]}
                        stroke={`url(#edgeGradient-${index})`}
                        strokeWidth="5"
                        strokeOpacity="1.0"
                        strokeLinecap="round"
                      />

                      {/* Clickable area for "from" half */}
                      <line
                        x1={edge.from[0]}
                        y1={edge.from[1]}
                        x2={centerX}
                        y2={centerY}
                        stroke="transparent"
                        strokeWidth="15"
                        strokeLinecap="round"
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleEdgeColor(index, 'from')
                        }}
                      />

                      {/* Clickable area for "to" half */}
                      <line
                        x1={centerX}
                        y1={centerY}
                        x2={edge.to[0]}
                        y2={edge.to[1]}
                        stroke="transparent"
                        strokeWidth="15"
                        strokeLinecap="round"
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleEdgeColor(index, 'to')
                        }}
                      />

                      {/* Center image */}
                      <image
                        x={centerX - 10}
                        y={centerY - 10}
                        width="20"
                        height="20"
                        href="/2x2.png"
                        style={{ pointerEvents: 'none' }}
                      />
                    </g>
                  )
                })}
              </g>
            )}

            {/* Buildings layer - renders on top of edges */}
            <g className="buildings-layer">
              {buildings.map((building) => (
                <g
                  key={building.id}
                  className="group cursor-pointer"
                  onClick={() => {
                    toggleBuildingColor(building.id)
                    setSelectedBuilding(
                      selectedBuilding === building.id ? null : building.id,
                    )
                  }}
                >
                  <path
                    d={building.path}
                    className={`${getBuildingColorClasses(getBuildingDisplayColor(building.id))} transition-all duration-200 ${
                      selectedBuilding === building.id ? 'drop-shadow-lg' : ''
                    }`}
                    style={{
                      transformOrigin: 'center',
                      stroke: 'white',
                      strokeWidth: '3',
                      strokeLinejoin: 'round',
                      strokeLinecap: 'round',
                    }}
                  />
                  <title>{building.name}</title>
                  {showMegagameNames && (
                    <text
                      x={building.center[0]}
                      y={building.center[1]}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="black"
                      transform={`rotate(90 ${building.center[0]} ${building.center[1]})`}
                      style={{
                        fontSize: `${16 * textScale}px`,
                        fontWeight: 'bold',
                        fontFamily: 'serif',
                        pointerEvents: 'none',
                      }}
                    >
                      {building.name}
                    </text>
                  )}
                </g>
              ))}
            </g>

            {/* Locations layer - renders on top of buildings */}
            {highlightLocation && (
              <g className="locations-layer">
                {locations
                  .filter((location) => location.id === highlightLocation)
                  .map((location) => (
                    <g key={location.id} transform="rotate(90 645.5 631.5)">
                      <path
                        d={location.path}
                        className="fill-green-500/70 hover:fill-green-600/90 transition-all duration-200"
                        style={{
                          transformOrigin: 'center',
                          stroke: 'white',
                          strokeWidth: '3',
                          strokeLinejoin: 'round',
                          strokeLinecap: 'round',
                        }}
                      />
                      <title>{location.name}</title>
                      {showLocationNames && (
                        <text
                          x={location.center[0]}
                          y={
                            location.center[1] -
                            (showLocationDescription && location.description
                              ? 10
                              : 0)
                          }
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="black"
                          style={{
                            fontSize: `${16 * textScale}px`,
                            fontWeight: 'bold',
                            fontFamily: 'serif',
                            pointerEvents: 'none',
                          }}
                        >
                          {location.name}
                        </text>
                      )}
                      {showLocationDescription && location.description && (
                        <text
                          x={location.center[0]}
                          y={location.center[1] + (showLocationNames ? 10 : 0)}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="black"
                          style={{
                            fontSize: `${14 * textScale}px`,
                            fontWeight: 'bold',
                            fontFamily: 'serif',
                            pointerEvents: 'none',
                          }}
                        >
                          {location.description}
                        </text>
                      )}
                    </g>
                  ))}
              </g>
            )}

            {/* North arrow */}
            <g
              className="north-arrow"
              transform="translate(630, 1000) rotate(180) scale(1.5)"
            >
              {/* Arrow pointing up (north after rotation) */}
              <path
                d="M 0,-40 L -15,25 L 0,15 L 15,25 Z"
                fill="black"
                stroke="white"
                strokeWidth="3"
              />
              <text
                x="-45"
                y="0"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="black"
                transform="rotate(-90)"
                style={{
                  fontSize: `${22 * textScale}px`,
                  fontWeight: 'bold',
                  fontFamily: 'serif',
                }}
              >
                N
              </text>
            </g>

            {/* Draggable endpoint handles - above everything */}
            {showDragHandles && (
              <g className="drag-handles">
                {edgePositions.map((edge, index) => (
                  <g key={`handles-${index}`}>
                    {/* From endpoint */}
                    <circle
                      cx={edge.from[0]}
                      cy={edge.from[1]}
                      r="8"
                      fill="red"
                      fillOpacity="0.7"
                      stroke="white"
                      strokeWidth="2"
                      className="cursor-move hover:fill-red-600"
                      onMouseDown={(e) => handleMouseDown(e, index, 'from')}
                    />
                    {/* To endpoint */}
                    <circle
                      cx={edge.to[0]}
                      cy={edge.to[1]}
                      r="8"
                      fill="blue"
                      fillOpacity="0.7"
                      stroke="white"
                      strokeWidth="2"
                      className="cursor-move hover:fill-blue-600"
                      onMouseDown={(e) => handleMouseDown(e, index, 'to')}
                    />
                  </g>
                ))}
              </g>
            )}
          </svg>
        </div>
      </div>

      {selectedBuilding && (
        <div className="mt-6 p-4 bg-white rounded-lg shadow-md border">
          <h3 className="text-xl font-semibold mb-2">
            {buildings.find((b) => b.id === selectedBuilding)?.name}
          </h3>
          <p className="text-gray-600">
            Click on a building to see more information about it.
          </p>
        </div>
      )}
    </div>
  )
}
