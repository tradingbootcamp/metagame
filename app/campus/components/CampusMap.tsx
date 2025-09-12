'use client'

import React, { useEffect, useState } from 'react'

import Image from 'next/image'

import { teamColorToHex } from '@/utils/dbUtils'

import { useLocations } from '@/hooks/useLocations'
import { DbLocation, DbTeamColor } from '@/types/database/dbTypeAliases'

type BuildingColor = DbTeamColor

interface MegagameLocation {
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

interface MapInfo {
  id: string
  name: string
  path: string
  center: [number, number]
  description: string
}

const getBuildingFillColor = (color: BuildingColor): string => {
  const opacity = color === 'unassigned' ? 0.3 : 0.7
  switch (color) {
    case 'orange':
      return `rgba(249, 115, 22, ${opacity})` // orange-500
    case 'purple':
      return `rgba(168, 85, 247, ${opacity})` // purple-500
    case 'green':
      return `rgba(34, 197, 94, ${opacity})` // green-500
    case 'unassigned':
    default:
      return `rgba(107, 114, 128, ${opacity})` // gray-500
  }
}

const getEdgeRenderInfo = (orangeClaimed: boolean, purpleClaimed: boolean) => {
  if (!orangeClaimed && !purpleClaimed) {
    return { type: 'single', color: 'rgba(107, 114, 128, 0.7)' } // gray-500
  }
  if (orangeClaimed && !purpleClaimed) {
    return { type: 'single', color: teamColorToHex('orange') }
  }
  if (!orangeClaimed && purpleClaimed) {
    return { type: 'single', color: teamColorToHex('purple') }
  }
  // Both claimed - render two lines
  return {
    type: 'double',
    orangeColor: teamColorToHex('orange'),
    purpleColor: teamColorToHex('purple'),
  }
}

export const megagameLocations: MegagameLocation[] = [
  {
    id: 'A',
    name: 'A',
    path: 'm 537.45385,740.18641 1.96106,-82.36465 3.18673,0.24514 0.7354,-36.76994 54.4195,-0.98053 -0.7354,-23.77789 22.18452,0 0,-6.61859 12.37921,0.49027 -0.12256,-3.92213 6.12832,0 -0.24513,-8.45708 83.22261,-0.7354 0.49027,-14.58541 c 0,0 36.52479,-0.24513 36.64736,0.24514 0.12257,0.49026 0.49027,34.19603 0.49027,34.19603 l 36.64736,-0.73539 2.5739,70.108 -25.24869,0.49027 -1.22566,84.93854 7.47655,0 3.06416,46.69781 -3.92213,46.82039 -2.69646,7.10885 -6.37345,-0.24513 -1.22567,18.2624 c 0,0 -33.5832,1.83849 -34.07347,1.83849 -0.49026,0 -38.24073,-5.14779 -38.24073,-5.14779 l -31.13187,-0.49026 -38.3633,5.02522 -39.34383,-4.28983 -0.24513,-25.86151 -4.28983,0 -0.49026,-8.08939 -36.27967,-0.85796 0.7354,-45.22702 c 0,0 0.24513,-6.49602 0.12257,-6.98629 -0.12257,-0.49026 4.53496,-39.83409 3.30929,-39.83409 -1.22566,0 -11.52124,-0.49027 -11.52124,-0.49027 z',
    color: 'unassigned',
    center: [664, 726],
    description: '',
  },
  {
    id: 'B',
    name: 'B',
    path: 'm 442.21972,636.00494 0,-100.50448 -101.23988,1.22566 -0.49027,17.64957 -14.9531,-0.24514 0.24513,6.86372 -10.05045,0 -1.71593,-34.3186 -28.92568,-0.49026 0.49027,7.84425 -41.18233,0 0.49027,174.28948 21.08143,0.49026 0.49026,18.6301 c 0,0 -18.87523,27.45489 4.65753,51.47791 23.53276,24.02302 47.06551,5.63805 47.06551,5.63805 l 85.30625,0.49027 0,-50.25224 10.54071,-1.22567 0,-22.06196 -8.82478,-0.24513 0.49026,-75.01066 z',
    color: 'purple',
    center: [331, 637],
    description: '',
  },
  {
    id: 'C',
    name: 'C',
    path: 'm 330.43913,402.14817 0,-100.01422 161.29743,-3.92212 c 0,0 11.27612,5.39292 11.27612,8.33451 0,2.9416 -1.4708,120.60538 -1.4708,120.60538 l -46.57525,-0.98053 -0.98053,26.47435 -41.18233,0 0,-15.19824 27.45489,0.49027 -1.4708,-10.78585 -38.24073,0.49027 -2.94159,-26.47435 z',
    color: 'unassigned',
    center: [422, 356],
    description: '',
  },
  {
    id: 'D',
    name: 'D',
    path: 'm 518.21091,527.90134 21.32657,0 0.49026,-7.35398 17.8947,0.49026 -0.24513,29.90622 42.65312,0.98053 0,-14.70797 -26.96462,-1.22567 0,-14.21771 15.93364,0.49027 -0.24513,5.14779 22.79736,0 -0.24514,-16.4239 4.90266,0 1.96106,-174.77975 -107.85847,-1.22566 0.24514,175.76027 7.35398,0.24514 z',
    color: 'unassigned',
    center: [565, 426],
    description: '',
  },
  {
    id: 'E',
    name: 'E',
    path: 'm 652.05347,465.39245 0.98053,-109.81953 149.04079,1.4708 32.35754,-1.4708 30.88675,2.94159 139.23552,-1.96106 7.8442,68.14694 -7.8442,81.87439 -127.46915,-0.49027 -41.91772,0 -0.49026,-8.82478 -23.77789,-0.49027 0.7354,-54.17437 -108.10361,-2.45133 -0.73539,24.75842 z',
    color: 'orange',
    center: [861, 425],
    description: '',
  },
  {
    id: 'F',
    name: 'F',
    path: 'm 683.173030,275.169300 0.257450,-102.465500 25.984080,-7.844300 32.357540,5.883200 74.064970,-0.371300 1.639040,63.759200 -1.428740,53.050200 -25.493820,0.000000 -0.735400,-12.939700 z',
    color: 'unassigned',
    center: [747, 225],
    description: '',
  },
  {
    id: 'theGardens',
    name: 'The Gardens',
    path: 'm 983.95233,326.8509 c 139.38517,2.91398 126.75787,-98.05719 126.75787,-98.05719 l 6.7993,-76.78133 H 911.10295 v 132.58588 c 0,0 -13.59855,35.45337 72.84938,42.25264 z',
    color: 'unassigned',
    center: [973, 125],
    description: '',
  },
  {
    id: 'theBughouse',
    name: 'The Bughouse',
    path: 'm 177.024,843.59586 15.15723,-56.56754 89.71698,24.03959 -15.43811,57.6158 z',
    color: 'unassigned',
    center: [270, 820],
    description: '',
  },
  {
    id: 'thePark',
    name: 'The Park',
    path: 'm 178.11674,328.91496 -3.27822,181.94134 h 125.66519 l 21.85481,-16.93748 -1.09274,-163.85439 z',
    color: 'unassigned',
    center: [238, 425],
    description: '',
  },
  {
    id: 'foodCourt',
    name: 'Food Court',
    path: 'm 1004.5546,356.55345 7.8442,68.14694 -7.8442,81.87439 v 19.03352 l 137.9059,2.18548 -0.5464,-172.22086 z',
    color: 'unassigned',
    center: [987, 567],
    description: '',
  },
]

const buildingNames = [
  { id: 'A', name: 'A', center: [664, 726] },
  { id: 'B', name: 'B', center: [331, 637] },
  { id: 'C', name: 'C', center: [422, 356] },
  { id: 'D', name: 'D', center: [565, 426] },
  { id: 'E', name: 'E', center: [861, 425] },
  { id: 'F', name: 'F', center: [747, 225] },
]

interface Edge {
  fromMegagameLocation: string
  toMegagameLocation: string
  from: [number, number]
  to: [number, number]
  orangeClaimed: boolean
  purpleClaimed: boolean
}

const edges: Edge[] = [
  {
    fromMegagameLocation: 'A',
    toMegagameLocation: 'B',
    from: [397, 653],
    to: [550, 661],
    orangeClaimed: false,
    purpleClaimed: false,
  },
  {
    fromMegagameLocation: 'theBughouse',
    toMegagameLocation: 'A',
    from: [262, 843],
    to: [674, 855],
    orangeClaimed: false,
    purpleClaimed: false,
  },
  {
    fromMegagameLocation: 'C',
    toMegagameLocation: 'D',
    from: [444, 445],
    to: [523, 444],
    orangeClaimed: false,
    purpleClaimed: false,
  },
  {
    fromMegagameLocation: 'D',
    toMegagameLocation: 'E',
    from: [670, 448],
    to: [600, 519],
    orangeClaimed: false,
    purpleClaimed: false,
  },
  {
    fromMegagameLocation: 'foodCourt',
    toMegagameLocation: 'A',
    from: [1059, 517],
    to: [724, 694],
    orangeClaimed: false,
    purpleClaimed: false,
  },
  {
    fromMegagameLocation: 'A',
    toMegagameLocation: 'D',
    from: [606, 603],
    to: [593, 544],
    orangeClaimed: false,
    purpleClaimed: false,
  },
  {
    fromMegagameLocation: 'B',
    toMegagameLocation: 'D',
    from: [432, 547],
    to: [520, 500],
    orangeClaimed: false,
    purpleClaimed: false,
  },
  {
    fromMegagameLocation: 'D',
    toMegagameLocation: 'F',
    from: [702, 258],
    to: [598, 356],
    orangeClaimed: false,
    purpleClaimed: false,
  },
  {
    fromMegagameLocation: 'A',
    toMegagameLocation: 'E',
    from: [788, 429],
    to: [737, 582],
    orangeClaimed: false,
    purpleClaimed: false,
  },
  {
    fromMegagameLocation: 'B',
    toMegagameLocation: 'thePark',
    from: [326, 568],
    to: [316, 482],
    orangeClaimed: false,
    purpleClaimed: false,
  },
  {
    fromMegagameLocation: 'C',
    toMegagameLocation: 'thePark',
    from: [412, 390],
    to: [311, 457],
    orangeClaimed: false,
    purpleClaimed: false,
  },
  {
    fromMegagameLocation: 'E',
    toMegagameLocation: 'theGardens',
    from: [977, 373],
    to: [984, 309],
    orangeClaimed: false,
    purpleClaimed: false,
  },
  {
    fromMegagameLocation: 'F',
    toMegagameLocation: 'theGardens',
    from: [792, 216],
    to: [920, 222],
    orangeClaimed: false,
    purpleClaimed: false,
  },
  {
    fromMegagameLocation: 'theBughouse',
    toMegagameLocation: 'B',
    from: [227, 808],
    to: [258, 702],
    orangeClaimed: false,
    purpleClaimed: false,
  },
  {
    fromMegagameLocation: 'theBughouse',
    toMegagameLocation: 'thePark',
    from: [206, 803],
    to: [192, 491],
    orangeClaimed: false,
    purpleClaimed: false,
  },
  {
    fromMegagameLocation: 'foodCourt',
    toMegagameLocation: 'E',
    from: [1016, 520],
    to: [848, 494],
    orangeClaimed: false,
    purpleClaimed: false,
  },
  {
    fromMegagameLocation: 'foodCourt',
    toMegagameLocation: 'theGardens',
    from: [1024, 378],
    to: [1023, 313],
    orangeClaimed: false,
    purpleClaimed: false,
  },
]

interface CampusMapProps {
  showMegagameNames?: boolean
  showBuildingNames?: boolean
  showLocationNames?: boolean
  showLocationDescription?: boolean
  highlightBuilding?: string
  highlightLocation?: string
  showMegagame?: boolean
  showMegagameElements?: boolean
  showMegagameColor?: boolean
  textScale?: number
  cropped?: boolean
  disableInteractions?: boolean
  onLocationsLoaded?: (locations: Location[]) => void
}

// Create a locations array from the hardcoded data for now
export const locations = [
  // This will be populated by the database locations when available
  // For now, we'll use the megagame locations as fallback
  ...megagameLocations.map((loc) => ({
    id: loc.id,
    name: loc.name,
    path: loc.path,
    center: loc.center,
    description: loc.description,
  })),
]
export default function CampusMap({
  showMegagameNames = false,
  showBuildingNames = false,
  showLocationNames = false,
  showLocationDescription = false,
  highlightBuilding,
  highlightLocation,
  showMegagame = true,
  showMegagameElements = true,
  showMegagameColor = true,
  textScale = 1,
  cropped = false,
  disableInteractions = false,
  onLocationsLoaded,
}: CampusMapProps = {}) {
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
    megagameLocations.reduce(
      (acc, megagameLocation) => ({
        ...acc,
        [megagameLocation.id]: megagameLocation.color,
      }),
      {},
    ),
  )
  setBuildingColors((prev) => ({ ...prev }))

  // Try to use prefetched locations if available, otherwise manage our own state
  let dbLocations: DbLocation[] = []
  let usesPrefetchedData = false

  try {
    const locationsContext = useLocations()
    dbLocations = locationsContext.locations
    usesPrefetchedData = true
  } catch {
    // useLocations hook not available, we'll fetch our own data
  }

  const [selfFetchedLocations, setSelfFetchedLocations] = useState<
    DbLocation[]
  >([])
  //const [dbLocationsMapped, setDbLocationsMapped] = useState<Location[]>([])

  // const cycleColors: BuildingColor[] = TEAM_COLORS_ENUM

  // Fetch locations ourselves if not using prefetched data
  useEffect(() => {
    if (!usesPrefetchedData) {
      const fetchLocations = async () => {
        try {
          const response = await fetch('/api/queries/locations')
          const locations = await response.json()
          setSelfFetchedLocations(locations)
        } catch (error) {
          console.error('Error fetching locations:', error)
          setSelfFetchedLocations([])
        }
      }
      fetchLocations()
    }
  }, [usesPrefetchedData])

  // Use prefetched locations or self-fetched locations
  const effectiveDbLocations = usesPrefetchedData
    ? dbLocations
    : selfFetchedLocations

  // Map database locations to Location format using map_info when locations change
  useEffect(() => {
    const mappedLocations: Location[] = effectiveDbLocations
      .filter((loc: DbLocation) => loc.map_info)
      .map((loc: DbLocation) => {
        const mapInfo = loc.map_info as unknown as MapInfo
        return {
          id: mapInfo.id || loc.id,
          name: mapInfo.name || loc.name,
          path: mapInfo.path || '',
          center: mapInfo.center || [0, 0],
          description: mapInfo.description || '',
        }
      })
    onLocationsLoaded?.(mappedLocations)
  }, [effectiveDbLocations, onLocationsLoaded])

  const getBuildingDisplayColor = (buildingId: string): BuildingColor => {
    if (highlightBuilding) {
      return highlightBuilding === buildingId ? 'green' : 'unassigned'
    }
    if (showMegagame && showMegagameColor) {
      return buildingColors[buildingId]
    }
    return 'unassigned'
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
      ((e.clientX - svgRect.left) / svgRect.width) * 1263,
      ((e.clientY - svgRect.top) / svgRect.height) * 1291,
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
      ((e.clientX - svgRect.left) / svgRect.width) * 1263,
      ((e.clientY - svgRect.top) / svgRect.height) * 1291,
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
          `  { fromMegagameLocation: '${edge.fromMegagameLocation}', toMegagameLocation: '${edge.toMegagameLocation}', from: [${Math.round(edge.from[0])}, ${Math.round(edge.from[1])}], to: [${Math.round(edge.to[0])}, ${Math.round(edge.to[1])}], orangeClaimed: ${edge.orangeClaimed}, purpleClaimed: ${edge.purpleClaimed} }${i < edgePositions.length - 1 ? ',' : ''}`,
        )
      })
      console.log(']')
    }
    setDragState(null)
  }

  const handleSvgClick = (e: React.MouseEvent) => {
    // Always log coordinates, regardless of what was clicked
    const svgRect = (e.currentTarget as SVGElement).getBoundingClientRect()
    const svgPoint = [
      Math.round(((e.clientX - svgRect.left) / svgRect.width) * 1263),
      Math.round(((e.clientY - svgRect.top) / svgRect.height) * 1291),
    ]
    console.log(`[${svgPoint[0]}, ${svgPoint[1]}]`)

    // Don't prevent propagation - let other click handlers work
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div
        className={`relative mx-auto w-full max-w-4xl overflow-hidden ${cropped ? 'aspect-[100/94]' : ''}`}
        style={cropped ? { height: '30%' } : {}}
      >
        <div
          className="relative aspect-square w-full"
          style={
            cropped
              ? {
                  marginTop: '-8%',
                  marginLeft: '-13%',
                  width: '123%',
                }
              : {}
          }
        >
          <Image
            src="/images/lighthaven.png"
            alt="Lighthaven Campus"
            fill
            className="object-contain"
            priority
          />

          <svg
            viewBox="0 0 1263 1291"
            className="pointer-events-auto absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMid meet"
            onMouseMove={disableInteractions ? undefined : handleMouseMove}
            onMouseUp={disableInteractions ? undefined : handleMouseUp}
            onMouseLeave={disableInteractions ? undefined : handleMouseUp}
            onClick={disableInteractions ? undefined : handleSvgClick}
          >
            <defs>
              {/* Create a mask that excludes building areas */}
              <mask id="edgesMask">
                {/* White background allows everything through */}
                <rect width="1263" height="1291" fill="white" />
                {/* Black building shapes block edges */}
                {megagameLocations.map((megagameLocation) => (
                  <path
                    key={`mask-${megagameLocation.id}`}
                    d={megagameLocation.path}
                    fill="black"
                  />
                ))}
              </mask>
            </defs>

            {/* Edges layer - masked to hide under buildings */}
            {showMegagame && showMegagameElements && (
              <g className="edges-layer" mask="url(#edgesMask)">
                {edgePositions.map((edge, index) => {
                  // Calculate center point of the edge
                  // const centerX = (edge.from[0] + edge.to[0]) / 2
                  // const centerY = (edge.from[1] + edge.to[1]) / 2

                  const renderInfo = getEdgeRenderInfo(
                    edge.orangeClaimed,
                    edge.purpleClaimed,
                  )

                  return (
                    <g key={`edge-group-${index}`}>
                      {renderInfo.type === 'single' ? (
                        <>
                          {/* White outline */}
                          <line
                            x1={edge.from[0]}
                            y1={edge.from[1]}
                            x2={edge.to[0]}
                            y2={edge.to[1]}
                            stroke="white"
                            strokeWidth="14"
                            strokeOpacity="1.0"
                            strokeLinecap="round"
                          />
                          {/* Single colored line */}
                          <line
                            x1={edge.from[0]}
                            y1={edge.from[1]}
                            x2={edge.to[0]}
                            y2={edge.to[1]}
                            stroke={renderInfo.color}
                            strokeWidth="8"
                            strokeOpacity="1.0"
                            strokeLinecap="round"
                          />
                        </>
                      ) : (
                        <>
                          {/* White outline */}
                          <line
                            x1={edge.from[0]}
                            y1={edge.from[1]}
                            x2={edge.to[0]}
                            y2={edge.to[1]}
                            stroke="white"
                            strokeWidth="14"
                            strokeOpacity="1.0"
                            strokeLinecap="round"
                          />
                          {/* Calculate perpendicular offset for double lines */}
                          {(() => {
                            const dx = edge.to[0] - edge.from[0]
                            const dy = edge.to[1] - edge.from[1]
                            const length = Math.sqrt(dx * dx + dy * dy)
                            const unitX = length > 0 ? dx / length : 1
                            const unitY = length > 0 ? dy / length : 0
                            // Perpendicular vector for offset
                            const perpX = -unitY * 2 // 1.5px offset
                            const perpY = unitX * 2

                            return (
                              <>
                                {/* Orange line */}
                                <line
                                  x1={edge.from[0] + perpX}
                                  y1={edge.from[1] + perpY}
                                  x2={edge.to[0] + perpX}
                                  y2={edge.to[1] + perpY}
                                  stroke={renderInfo.orangeColor}
                                  strokeWidth="4"
                                  strokeOpacity="1.0"
                                  strokeLinecap="round"
                                />
                                {/* Purple line */}
                                <line
                                  x1={edge.from[0] - perpX}
                                  y1={edge.from[1] - perpY}
                                  x2={edge.to[0] - perpX}
                                  y2={edge.to[1] - perpY}
                                  stroke={renderInfo.purpleColor}
                                  strokeWidth="4"
                                  strokeOpacity="1.0"
                                  strokeLinecap="round"
                                />
                              </>
                            )
                          })()}
                        </>
                      )}
                    </g>
                  )
                })}
              </g>
            )}

            {/* Buildings layer - renders on top of edges */}
            {showMegagame && (
              <g className="buildings-layer">
                {megagameLocations.map((megagameLocation) => (
                  <g key={megagameLocation.id}>
                    <path
                      d={megagameLocation.path}
                      className="transition-all duration-200"
                      style={{
                        fill: getBuildingFillColor(
                          getBuildingDisplayColor(megagameLocation.id),
                        ),
                        transformOrigin: 'center',
                        stroke: 'white',
                        strokeWidth: '3',
                        strokeLinejoin: 'round',
                        strokeLinecap: 'round',
                      }}
                    />
                    <title>{megagameLocation.name}</title>
                    {megagameLocation.name == 'A' && (
                      <Image
                        src="/images/building/A_test.svg"
                        alt="Lighthaven Campus"
                        fill
                        className="object-contain"
                        priority
                      />
                    )}
                  </g>
                ))}
              </g>
            )}
            {/* Edge center images layer - renders above buildings */}
            {showMegagame && showMegagameElements && (
              <g className="edge-images-layer">
                {edgePositions.map((edge, index) => {
                  const centerX = (edge.from[0] + edge.to[0]) / 2
                  const centerY = (edge.from[1] + edge.to[1]) / 2

                  return (
                    <image
                      key={`edge-image-${index}`}
                      x={centerX - 20}
                      y={centerY - 20}
                      width="40"
                      height="40"
                      href="/building/Locked.png"
                      style={{ pointerEvents: 'none' }}
                    />
                  )
                })}
              </g>
            )}
            {/* Building names layer - always visible when showBuildingNames is true */}
            {showBuildingNames && (
              <g className="building-names-layer">
                {buildingNames.map((building) => (
                  <text
                    key={`building-name-${building.id}`}
                    x={building.center[0]}
                    y={building.center[1]}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    style={{
                      fontSize: `${40 * textScale}px`,
                      fontWeight: 'bold',
                      pointerEvents: 'none',
                      filter:
                        'drop-shadow(0px 0px 5px black) drop-shadow(0px 0px 2px black) drop-shadow(0px 0px 2px black) drop-shadow(0px 0px 2px black)',
                    }}
                  >
                    {building.name}
                  </text>
                ))}
              </g>
            )}

            {/* Megagame location names layer - visible when showMegagame and showMegagameNames are true */}
            {showMegagame && showMegagameNames && (
              <g className="megagame-names-layer">
                {megagameLocations.map((megagameLocation) => (
                  <text
                    key={`megagame-name-${megagameLocation.id}`}
                    x={megagameLocation.center[0]}
                    y={megagameLocation.center[1]}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    style={{
                      fontSize: `${(megagameLocation.name.length == 1 ? 60 : 40) * textScale}px`,
                      fontWeight: 'bold',
                      pointerEvents: 'none',
                      filter:
                        'drop-shadow(0px 0px 5px black) drop-shadow(0px 0px 2px black) drop-shadow(0px 0px 2px black) drop-shadow(0px 0px 2px black)',
                    }}
                  >
                    {megagameLocation.name}
                  </text>
                ))}
              </g>
            )}

            {/* Locations layer - renders on top of buildings */}
            {highlightLocation && (
              <g className="locations-layer">
                {effectiveDbLocations
                  .filter(
                    (dbLocation) =>
                      dbLocation.id === highlightLocation &&
                      dbLocation.map_info,
                  )
                  .map((dbLocation) => {
                    const mapInfo = dbLocation.map_info as unknown as MapInfo
                    const location = {
                      id: mapInfo.id || dbLocation.id,
                      name: mapInfo.name || dbLocation.name,
                      path: mapInfo.path || '',
                      center: mapInfo.center || [0, 0],
                      description: mapInfo.description || '',
                    }
                    return (
                      <g key={dbLocation.id}>
                        <path
                          d={location.path}
                          className="fill-green-500/70 transition-all duration-200 hover:fill-green-600/90"
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
                                ? 30
                                : 0)
                            }
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="white"
                            style={{
                              fontSize: `${20 * textScale}px`,
                              fontWeight: 'bold',
                              pointerEvents: 'none',
                              filter:
                                'drop-shadow(0px 0px 2px black) drop-shadow(0px 0px 2px black) drop-shadow(0px 0px 2px black) drop-shadow(0px 0px 2px black)',
                            }}
                          >
                            {location.name}
                          </text>
                        )}
                        {showLocationDescription && location.description && (
                          <text
                            x={location.center[0]}
                            y={
                              location.center[1] + (showLocationNames ? 20 : 0)
                            }
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="white"
                            style={{
                              fontSize: `${17 * textScale}px`,
                              fontWeight: 'bold',
                              pointerEvents: 'none',
                              filter:
                                'drop-shadow(0px 0px 2px black) drop-shadow(0px 0px 2px black) drop-shadow(0px 0px 2px black) drop-shadow(0px 0px 2px black)',
                            }}
                          >
                            {location.description}
                          </text>
                        )}
                      </g>
                    )
                  })}
              </g>
            )}

            {/* North arrow */}
            <g
              className="north-arrow"
              transform="translate(1050, 691) scale(1.5)"
            >
              {/* Arrow pointing right (north) */}
              <path
                d="M 40,0 L -25,-15 L -15,0 L -25,15 Z"
                fill="black"
                stroke="white"
                strokeWidth="3"
                transform="rotate(9.28)"
              />
              <text
                x="-45"
                y="-1"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                style={{
                  fontSize: `${28 * textScale}px`,
                  fontWeight: 'bold',
                  filter:
                    'drop-shadow(0px 0px 2px black) drop-shadow(0px 0px 2px black) drop-shadow(0px 0px 2px black) drop-shadow(0px 0px 2px black)',
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
                      onMouseDown={
                        disableInteractions
                          ? undefined
                          : (e) => handleMouseDown(e, index, 'from')
                      }
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
                      onMouseDown={
                        disableInteractions
                          ? undefined
                          : (e) => handleMouseDown(e, index, 'to')
                      }
                    />
                  </g>
                ))}
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  )
}
