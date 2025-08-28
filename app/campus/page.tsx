'use client'

import { useState } from 'react'

import CampusMap from './components/CampusMap'

export default function CampusPage() {
  const [showMegagameNames, setShowMegagameNames] = useState(false)
  const [showBuildingNames, setShowBuildingNames] = useState(false)
  const [showLocationNames, setShowLocationNames] = useState(false)
  const [showLocationDescription, setShowLocationDescription] = useState(false)
  const [highlightBuilding, setHighlightBuilding] = useState('')
  const [highlightLocation, setHighlightLocation] = useState('')
  const [showMegagame, setShowMegagame] = useState(true)
  const [showMegagameElements, setShowMegagameElements] = useState(true)
  const [showMegagameColor, setShowMegagameColor] = useState(true)
  const [textScale, setTextScale] = useState(1)

  const buildings = ['A', 'B', 'C', 'D', 'E', 'F']
  const locations = [
    { id: 'thePark', name: 'The Park' },
    { id: 'eigenHall', name: 'Eigen Hall' },
    { id: 'theClocktower', name: 'The Clocktower' },
    { id: 'playtestingPlaza', name: 'Playtesting Plaza' },
  ]

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Campus Map</h1>

      <div className="max-w-6xl mx-auto mb-6 p-4 bg-white rounded-lg shadow border border-gray-300">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          Map Controls
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Megagame Controls */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showMegagame"
              checked={showMegagame}
              onChange={(e) => setShowMegagame(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label
              htmlFor="showMegagame"
              className="text-sm font-medium text-gray-900"
            >
              Show Megagame
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showMegagameElements"
              checked={showMegagameElements}
              onChange={(e) => setShowMegagameElements(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label
              htmlFor="showMegagameElements"
              className="text-sm font-medium text-gray-900"
            >
              Show Edges
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showMegagameColor"
              checked={showMegagameColor}
              onChange={(e) => setShowMegagameColor(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label
              htmlFor="showMegagameColor"
              className="text-sm font-medium text-gray-900"
            >
              Show Team Colors
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showBuildingNames"
              checked={showBuildingNames}
              onChange={(e) => setShowBuildingNames(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label
              htmlFor="showBuildingNames"
              className="text-sm font-medium text-gray-900"
            >
              Show Building Names
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showMegagameNames"
              checked={showMegagameNames}
              onChange={(e) => setShowMegagameNames(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label
              htmlFor="showMegagameNames"
              className="text-sm font-medium text-gray-900"
            >
              Show Megagame Names
            </label>
          </div>

          <div className="flex flex-col space-y-1">
            <label
              htmlFor="highlightBuilding"
              className="text-sm font-medium text-gray-900"
            >
              Highlight Building
            </label>
            <select
              id="highlightBuilding"
              value={highlightBuilding}
              onChange={(e) => setHighlightBuilding(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="">None</option>
              {buildings.map((building) => (
                <option key={building} value={building}>
                  Building {building}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-1">
            <label
              htmlFor="highlightLocation"
              className="text-sm font-medium text-gray-900"
            >
              Highlight Location
            </label>
            <select
              id="highlightLocation"
              value={highlightLocation}
              onChange={(e) => setHighlightLocation(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="">None</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showLocationNames"
              checked={showLocationNames}
              onChange={(e) => setShowLocationNames(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label
              htmlFor="showLocationNames"
              className="text-sm font-medium text-gray-900"
            >
              Show Location Names
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showLocationDescription"
              checked={showLocationDescription}
              onChange={(e) => setShowLocationDescription(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label
              htmlFor="showLocationDescription"
              className="text-sm font-medium text-gray-900"
            >
              Show Location Descriptions
            </label>
          </div>

          <div className="flex flex-col space-y-1">
            <label
              htmlFor="textScale"
              className="text-sm font-medium text-gray-900"
            >
              Text Size
            </label>
            <input
              type="range"
              id="textScale"
              min="0.5"
              max="2"
              step="0.1"
              value={textScale}
              onChange={(e) => setTextScale(parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-600 text-center">
              {textScale.toFixed(1)}x
            </span>
          </div>
        </div>
      </div>

      <CampusMap
        showMegagameNames={showMegagameNames}
        showBuildingNames={showBuildingNames}
        showLocationNames={showLocationNames}
        showLocationDescription={showLocationDescription}
        highlightBuilding={highlightBuilding || undefined}
        highlightLocation={highlightLocation || undefined}
        showMegagame={showMegagame}
        showMegagameElements={showMegagameElements}
        showMegagameColor={showMegagameColor}
        textScale={textScale}
      />
    </div>
  )
}
