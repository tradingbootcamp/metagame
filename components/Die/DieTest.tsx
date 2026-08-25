'use client'

import { useEffect, useState } from 'react'
import { FaDice } from 'react-icons/fa'

import { CustomDie } from './CustomDie'
import { type Face, generateRandomDieIdentifier } from './DiceUtils'
import { Ellipsis } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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

  const [realDice, setRealDice] = useState(true)
  const [noRepeats, setNoRepeats] = useState(true)

  const randomize = () => {
    setIsAutoCycle(false)
    setCurrentNumbers(
      generateRandomDieIdentifier({
        allowSevenSum: !realDice,
        allowRepeats: !(realDice || noRepeats),
      }),
    )
  }

  return (
    <div className="relative flex flex-col items-center gap-6 rounded-xl border border-border-muted bg-bg-secondary/90 px-8 py-6 shadow-lg backdrop-blur-sm">
      <div className="absolute top-3 right-3 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={randomize}
          title="Randomize"
          aria-label="Randomize"
        >
          <FaDice />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              title="Randomize options"
              aria-label="Randomize options"
            >
              <Ellipsis />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="flex w-auto flex-col gap-3">
            <Label htmlFor="real-dice">
              <Checkbox
                id="real-dice"
                checked={realDice}
                onCheckedChange={(v) => setRealDice(v === true)}
              />
              Real dice only (opposite faces sum to 7)
            </Label>
            <Label htmlFor="no-repeats">
              <Checkbox
                id="no-repeats"
                checked={realDice || noRepeats}
                disabled={realDice}
                onCheckedChange={(v) => setNoRepeats(v === true)}
              />
              No repeated faces
            </Label>
          </PopoverContent>
        </Popover>
      </div>

      <CustomDie
        dieIdentifier={currentNumbers}
        size={200}
        fill={colors.fill}
        stroke={colors.stroke}
        showDownloadButton
        strokeWidth={strokeWidth}
      />

      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
        <Label htmlFor="fill">
          Fill
          <input
            id="fill"
            type="color"
            value={colors.fill}
            onChange={(e) =>
              setColors((prev) => ({ ...prev, fill: e.target.value }))
            }
            className="size-8 cursor-pointer rounded-md border border-input bg-transparent"
          />
        </Label>

        <Label htmlFor="stroke">
          Stroke
          <input
            id="stroke"
            type="color"
            value={colors.stroke}
            onChange={(e) =>
              setColors((prev) => ({ ...prev, stroke: e.target.value }))
            }
            className="size-8 cursor-pointer rounded-md border border-input bg-transparent"
          />
        </Label>

        <Label htmlFor="stroke-width">
          Width
          <Input
            id="stroke-width"
            type="number"
            step={0.5}
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="h-8 w-20"
          />
        </Label>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
        <Label htmlFor="auto-cycle">
          Auto cycle
          <Switch
            id="auto-cycle"
            checked={isAutoCycle}
            onCheckedChange={setIsAutoCycle}
          />
        </Label>

        {FACES.map((face) => (
          <Label key={face} htmlFor={`face-${face}`} className="capitalize">
            {face}
            <Input
              id={`face-${face}`}
              type="number"
              min={0}
              max={6}
              value={currentNumbers[face]}
              onChange={(e) => handleNumberChange(face, e.target.value)}
              disabled={isAutoCycle}
              className="h-8 w-14"
            />
          </Label>
        ))}
      </div>
    </div>
  )
}
