'use client'

import { useEffect, useState } from 'react'

import { CustomDie } from './CustomDie'
import type { Face } from './DiceUtils'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

const FACES: Face[] = ['left', 'top', 'right']

export function DieTest() {
  const [isAutoCycle, setIsAutoCycle] = useState(true)
  const [colors, setColors] = useState({
    fill: '#ff0000',
    stroke: '#0000ff',
  })
  const [strokeWidth, setStrokeWidth] = useState(13.824)
  const [currentNumbers, setCurrentNumbers] = useState<Record<Face, number>>({
    left: 1,
    top: 1,
    right: 1,
  })

  useEffect(() => {
    if (!isAutoCycle) return

    const interval = setInterval(() => {
      setCurrentNumbers((prev) => ({
        left: prev.left >= 6 ? 1 : prev.left + 1,
        top: prev.top >= 6 ? 1 : prev.top + 1,
        right: prev.right >= 6 ? 1 : prev.right + 1,
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [isAutoCycle])

  const handleNumberChange = (face: Face, value: string) => {
    const numValue = parseInt(value)
    if (numValue >= 0 && numValue <= 6) {
      setCurrentNumbers((prev) => ({ ...prev, [face]: numValue }))
    }
  }

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-8 rounded-xl border border-border-muted bg-bg-secondary/90 p-8 shadow-lg backdrop-blur-sm">
      <CustomDie
        dieIdentifier={currentNumbers}
        size={200}
        fill={colors.fill}
        stroke={colors.stroke}
        showDownloadButton
        strokeWidth={strokeWidth}
      />

      <div className="grid w-full grid-cols-2 gap-x-6 gap-y-4">
        <Label htmlFor="auto-cycle" className="justify-between">
          Auto cycle
          <Switch
            id="auto-cycle"
            checked={isAutoCycle}
            onCheckedChange={setIsAutoCycle}
          />
        </Label>

        <Label
          htmlFor="stroke-width"
          className="justify-between whitespace-nowrap"
        >
          Stroke width
          <Input
            id="stroke-width"
            type="number"
            step={0.5}
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-24"
          />
        </Label>

        <Label htmlFor="fill" className="justify-between">
          Fill
          <input
            id="fill"
            type="color"
            value={colors.fill}
            onChange={(e) =>
              setColors((prev) => ({ ...prev, fill: e.target.value }))
            }
            className="h-9 w-12 cursor-pointer rounded-md border border-input bg-transparent"
          />
        </Label>

        <Label htmlFor="stroke" className="justify-between">
          Stroke
          <input
            id="stroke"
            type="color"
            value={colors.stroke}
            onChange={(e) =>
              setColors((prev) => ({ ...prev, stroke: e.target.value }))
            }
            className="h-9 w-12 cursor-pointer rounded-md border border-input bg-transparent"
          />
        </Label>
      </div>

      <div className="grid w-full grid-cols-3 gap-4">
        {FACES.map((face) => (
          <Label
            key={face}
            htmlFor={`face-${face}`}
            className="flex-col items-start gap-1.5 capitalize"
          >
            {face}
            <Input
              id={`face-${face}`}
              type="number"
              min={0}
              max={6}
              value={currentNumbers[face]}
              onChange={(e) => handleNumberChange(face, e.target.value)}
              disabled={isAutoCycle}
            />
          </Label>
        ))}
      </div>
    </div>
  )
}
