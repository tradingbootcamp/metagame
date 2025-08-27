'use client'

import { useState } from 'react'

import CampusMap from './components/CampusMap'

export default function CampusPage() {
  const [showNames, setShowNames] = useState(false)
  const [highlightBuilding, setHighlightBuilding] = useState('')
  const [showMegagame, setShowMegagame] = useState(true)

  const buildings = ['A', 'B', 'C', 'D', 'E', 'F']

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Campus Map</h1>

      <div className="max-w-4xl mx-auto mb-6 p-4 bg-white rounded-lg shadow border border-gray-300">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          Map Controls
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showNames"
              checked={showNames}
              onChange={(e) => setShowNames(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label
              htmlFor="showNames"
              className="text-sm font-medium text-gray-900"
            >
              Show Names
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
        </div>
      </div>

      <CampusMap
        showNames={showNames}
        highlightBuilding={highlightBuilding || undefined}
        showMegagame={showMegagame}
      />
    </div>
  )
}
