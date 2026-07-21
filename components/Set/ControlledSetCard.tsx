import { useState } from 'react'

import SetCard from './SetCard'

type CardProps = {
  shape: 'diamond' | 'oval' | 'squiggle'
  color: 'red' | 'green' | 'purple'
  fill: 'solid' | 'striped' | 'open'
  number: 1 | 2 | 3
}

export default function ControlledSetCard() {
  const [card, setCard] = useState<CardProps>({
    shape: 'diamond',
    color: 'red',
    fill: 'solid',
    number: 1,
  })
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('lg')
  const [selected, setSelected] = useState(false)

  return (
    <div className="flex min-h-[140px] flex-col items-center gap-1">
      <div className="flex gap-1">
        <select
          title="Shape"
          value={card.shape}
          onChange={(e) =>
            setCard({ ...card, shape: e.target.value as CardProps['shape'] })
          }
        >
          <option value="diamond">Diamond</option>
          <option value="oval">Oval</option>
          <option value="squiggle">Squiggle</option>
        </select>

        <select
          title="Color"
          value={card.color}
          onChange={(e) =>
            setCard({ ...card, color: e.target.value as CardProps['color'] })
          }
        >
          <option value="red">Red</option>
          <option value="green">Green</option>
          <option value="purple">Purple</option>
        </select>

        <select
          title="Fill"
          value={card.fill}
          onChange={(e) =>
            setCard({ ...card, fill: e.target.value as CardProps['fill'] })
          }
        >
          <option value="solid">Solid</option>
          <option value="striped">Striped</option>
          <option value="open">Open</option>
        </select>

        <select
          title="Count"
          value={card.number}
          onChange={(e) =>
            setCard({
              ...card,
              number: Number(e.target.value) as CardProps['number'],
            })
          }
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>

        <select
          title="Size"
          value={size}
          onChange={(e) => setSize(e.target.value as 'sm' | 'md' | 'lg')}
        >
          <option value="lg">Large</option>
          <option value="md">Medium</option>
          <option value="sm">Small</option>
        </select>
      </div>

      <button
        type="button"
        aria-pressed={selected}
        aria-label="Toggle card selection"
        className="cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        onClick={() => setSelected(!selected)}
      >
        <SetCard card={card} size={size} selected={selected} />
      </button>
    </div>
  )
}
