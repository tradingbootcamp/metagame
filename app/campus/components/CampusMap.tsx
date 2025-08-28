'use client'

import React, { useState } from 'react'

import Image from 'next/image'

import { TEAM_COLORS_ENUM, teamColorToHex } from '@/utils/dbUtils'

import { DbTeamColor } from '@/types/database/dbTypeAliases'

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
  return teamColorToHex(color)
}

const megagameLocations: MegagameLocation[] = [
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
    id: 'X',
    name: 'X',
    path: 'm 969.398100,151.686997 16.731400,28.979670 -16.731400,28.979671 -33.462900,0.000002 -16.731400,-28.979670 16.731400,-28.979671 z',
    color: 'unassigned',
    center: [953, 185],
    description: '',
  },
  {
    id: 'Y',
    name: 'Y',
    path: 'm 1086.458013,167.200224 8.660801,32.322617 -23.661782,23.661808 -32.322680,-8.660834 -8.660801,-32.322617 23.661782,-23.661808 z',
    color: 'unassigned',
    center: [1063, 195],
    description: '',
  },
  {
    id: 'Z',
    name: 'Z',
    path: 'm 1117.625673,287.098037 16.731400,28.979670 -16.731400,28.979671 -33.462900,0.000002 -16.731400,-28.979670 16.731400,-28.979671 z',
    color: 'unassigned',
    center: [1101, 320],
    description: '',
  },
  {
    id: 'Q',
    name: 'Q',
    path: 'm 212.331520,797.470587 16.731400,28.979670 -16.731400,28.979671 -33.462900,0.000002 -16.731400,-28.979670 16.731400,-28.979671 z',
    color: 'unassigned',
    center: [195, 829],
    description: '',
  },
  {
    id: 'R',
    name: 'R',
    path: 'm 201.370740,621.294117 16.731400,28.979670 -16.731400,28.979671 -33.462900,0.000002 -16.731400,-28.979670 16.731400,-28.979671 z',
    color: 'unassigned',
    center: [185, 654],
    description: '',
  },
  {
    id: 'S',
    name: 'S',
    path: 'm 203.351140,464.235287 16.731400,28.979670 -16.731400,28.979671 -33.462900,0.000002 -16.731400,-28.979670 16.731400,-28.979671 z',
    color: 'unassigned',
    center: [186, 497],
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

const locations: Location[] = [
  {
    id: 'thePark',
    name: 'The Park',
    path: 'm 153.64706,314 176.79207,-11.86605 v 100.01422 l 15.34617,-0.22403 31.39117,123.84057 h -33.33333 l -29.82792,0.91096 -28.92568,-0.49026 0.49027,7.84425 h -41.18233 v 12.72677 h -81.27416 -11.09187 z',
    center: [238, 425],
    description: 'this is desc',
  },
  {
    id: 'eigenHall',
    name: 'Eigen Hall',
    path: 'M 800.46957,442.34191 800.99844,357.0331 680.5,355.57292 l -0.1875,21.41927 -28.25903,-0.48647 v 43.02797 L 679.9375,419.83073 679.75,441.25 Z',
    center: [740, 399],
    description: '',
  },
  {
    id: 'theClocktower',
    name: 'The Clocktower',
    path: 'm 384.45467,768.65968 -102.17693,-1.94454 1.06066,-126.92567 100.58594,0.35356 z',
    center: [333, 704],
    description: '3rd Floor',
  },
  {
    id: 'playtestingPlaza',
    name: 'Playtesting Plaza',
    path: 'm 330.43913,302.13395 v 100.01422 l 67.16641,-0.98053 2.94159,26.47435 100.99475,-0.49027 1.4708,-86.46839 -103.35521,1.23744 0.17414,-41.47417 z',
    center: [412, 374],
    description: '',
  },
]

interface Edge {
  fromMegagameLocation: string
  toMegagameLocation: string
  from: [number, number]
  to: [number, number]
  fromColor: BuildingColor
  toColor: BuildingColor
}

const edges: Edge[] = [
  {
    fromMegagameLocation: 'A',
    toMegagameLocation: 'B',
    from: [397, 653],
    to: [550, 661],
    fromColor: 'purple',
    toColor: 'unassigned',
  },
  {
    fromMegagameLocation: 'B',
    toMegagameLocation: 'C',
    from: [313, 570],
    to: [412, 414],
    fromColor: 'purple',
    toColor: 'unassigned',
  },
  {
    fromMegagameLocation: 'C',
    toMegagameLocation: 'D',
    from: [444, 445],
    to: [523, 444],
    fromColor: 'unassigned',
    toColor: 'unassigned',
  },
  {
    fromMegagameLocation: 'D',
    toMegagameLocation: 'E',
    from: [670, 448],
    to: [600, 519],
    fromColor: 'orange',
    toColor: 'unassigned',
  },
  {
    fromMegagameLocation: 'E',
    toMegagameLocation: 'F',
    from: [794, 373],
    to: [804, 278],
    fromColor: 'orange',
    toColor: 'unassigned',
  },
  {
    fromMegagameLocation: 'A',
    toMegagameLocation: 'D',
    from: [606, 603],
    to: [593, 544],
    fromColor: 'unassigned',
    toColor: 'unassigned',
  },
  {
    fromMegagameLocation: 'B',
    toMegagameLocation: 'D',
    from: [432, 547],
    to: [520, 500],
    fromColor: 'purple',
    toColor: 'unassigned',
  },
  {
    fromMegagameLocation: 'D',
    toMegagameLocation: 'F',
    from: [702, 258],
    to: [598, 356],
    fromColor: 'unassigned',
    toColor: 'unassigned',
  },
  {
    fromMegagameLocation: 'A',
    toMegagameLocation: 'E',
    from: [788, 429],
    to: [737, 582],
    fromColor: 'orange',
    toColor: 'unassigned',
  },
  {
    fromMegagameLocation: 'S',
    toMegagameLocation: 'R',
    from: [187, 493],
    to: [185, 650],
    fromColor: 'unassigned',
    toColor: 'unassigned',
  },
  {
    fromMegagameLocation: 'R',
    toMegagameLocation: 'Q',
    from: [185, 650],
    to: [196, 826],
    fromColor: 'unassigned',
    toColor: 'unassigned',
  },
  {
    fromMegagameLocation: 'S',
    toMegagameLocation: 'C',
    from: [187, 493],
    to: [349, 379],
    fromColor: 'unassigned',
    toColor: 'unassigned',
  },
  {
    fromMegagameLocation: 'S',
    toMegagameLocation: 'B',
    from: [187, 493],
    to: [261, 600],
    fromColor: 'unassigned',
    toColor: 'purple',
  },
  {
    fromMegagameLocation: 'R',
    toMegagameLocation: 'B',
    from: [196, 664],
    to: [268, 748],
    fromColor: 'unassigned',
    toColor: 'purple',
  },
  {
    fromMegagameLocation: 'Q',
    toMegagameLocation: 'B',
    from: [196, 826],
    to: [292, 758],
    fromColor: 'unassigned',
    toColor: 'purple',
  },
  {
    fromMegagameLocation: 'X',
    toMegagameLocation: 'Y',
    from: [953, 181],
    to: [1063, 191],
    fromColor: 'unassigned',
    toColor: 'unassigned',
  },
  {
    fromMegagameLocation: 'Y',
    toMegagameLocation: 'Z',
    from: [1063, 191],
    to: [1101, 316],
    fromColor: 'unassigned',
    toColor: 'unassigned',
  },
  {
    fromMegagameLocation: 'X',
    toMegagameLocation: 'F',
    from: [953, 181],
    to: [786, 213],
    fromColor: 'unassigned',
    toColor: 'unassigned',
  },
  {
    fromMegagameLocation: 'X',
    toMegagameLocation: 'E',
    from: [953, 181],
    to: [875, 389],
    fromColor: 'unassigned',
    toColor: 'orange',
  },
  {
    fromMegagameLocation: 'Y',
    toMegagameLocation: 'E',
    from: [1063, 191],
    to: [920, 382],
    fromColor: 'unassigned',
    toColor: 'orange',
  },
  {
    fromMegagameLocation: 'Z',
    toMegagameLocation: 'E',
    from: [1101, 316],
    to: [981, 390],
    fromColor: 'unassigned',
    toColor: 'orange',
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
}

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
    megagameLocations.reduce(
      (acc, megagameLocation) => ({
        ...acc,
        [megagameLocation.id]: megagameLocation.color,
      }),
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
          `  { fromMegagameLocation: '${edge.fromMegagameLocation}', toMegagameLocation: '${edge.toMegagameLocation}', from: [${Math.round(edge.from[0])}, ${Math.round(edge.from[1])}], to: [${Math.round(edge.to[0])}, ${Math.round(edge.to[1])}], fromColor: '${edge.fromColor}', toColor: '${edge.toColor}' }${i < edgePositions.length - 1 ? ',' : ''}`,
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
    <div className="w-full max-w-6xl mx-auto">
      <div className="relative w-full max-w-4xl mx-auto">
        <div className="relative w-full aspect-square overflow-hidden">
          <Image
            src="/images/lighthaven.png"
            alt="Lighthaven Campus"
            fill
            className="object-contain"
            priority
          />

          <svg
            viewBox="0 0 1263 1291"
            className="absolute inset-0 w-full h-full pointer-events-auto"
            preserveAspectRatio="xMidYMid meet"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleSvgClick}
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
            {showMegagame && (
              <g className="buildings-layer">
                {megagameLocations.map((megagameLocation) => (
                  <g
                    key={megagameLocation.id}
                    className="group cursor-pointer"
                    onClick={() => {
                      toggleBuildingColor(megagameLocation.id)
                      setSelectedBuilding(
                        selectedBuilding === megagameLocation.id
                          ? null
                          : megagameLocation.id,
                      )
                    }}
                  >
                    <path
                      d={megagameLocation.path}
                      className={`${getBuildingColorClasses(getBuildingDisplayColor(megagameLocation.id))} transition-all duration-200 ${
                        selectedBuilding === megagameLocation.id
                          ? 'drop-shadow-lg'
                          : ''
                      }`}
                      style={{
                        transformOrigin: 'center',
                        stroke: 'white',
                        strokeWidth: '3',
                        strokeLinejoin: 'round',
                        strokeLinecap: 'round',
                      }}
                    />
                    <title>{megagameLocation.name}</title>
                  </g>
                ))}
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
                      fontSize: `${40 * textScale}px`,
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
                {locations
                  .filter((location) => location.id === highlightLocation)
                  .map((location) => (
                    <g key={location.id}>
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
                          y={location.center[1] + (showLocationNames ? 10 : 0)}
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
                  ))}
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
                  fontSize: `${32 * textScale}px`,
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
            {megagameLocations.find((b) => b.id === selectedBuilding)?.name}
          </h3>
          <p className="text-gray-600">
            Click on a building to see more information about it.
          </p>
        </div>
      )}
    </div>
  )
}
