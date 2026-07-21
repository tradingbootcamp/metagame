'use client'

import { useState } from 'react'

import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'

export function DummyTool({}: {
  searchParams?: Promise<Record<string, string | undefined>>
} = {}) {
  const [input1, setInput1] = useState('')
  const [input2, setInput2] = useState('')
  const [toastMessageInput, setToastMessageInput] = useState('')

  const handleLog = () => {
    const data = {
      input1,
      input2,
      timestamp: new Date().toISOString(),
    }

    console.log('Dummy Tool Log:', data)
    toast.success('Logged test data to console')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="input1">Test Input 1</Label>
          <Input
            id="input1"
            value={input1}
            onChange={(e) => setInput1(e.target.value)}
            placeholder="Enter test value 1"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="input2">Test Input 2</Label>
          <Input
            id="input2"
            value={input2}
            onChange={(e) => setInput2(e.target.value)}
            placeholder="Enter test value 2"
          />
        </div>

        <Button onClick={handleLog}>Log Test Data</Button>

        <div className="flex flex-col gap-2">
          <Label htmlFor="toastMessage">Toast Message</Label>
          <Textarea
            id="toastMessage"
            placeholder="Enter toast message"
            value={toastMessageInput}
            onChange={(e) => setToastMessageInput(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label id="toastTypeLabel">Toast Type</Label>
          <RadioGroup
            aria-labelledby="toastTypeLabel"
            defaultValue="success"
            onValueChange={(value) => {
              const message = toastMessageInput || `${value} toast`
              switch (value) {
                case 'success':
                  toast.success(message)
                  break
                case 'error':
                  toast.error(message)
                  break
                case 'info':
                  toast.info(message)
                  break
                case 'warning':
                  toast.warning(message)
                  break
              }
            }}
          >
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="success" id="success" />
                <Label htmlFor="success">Success</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="error" id="error" />
                <Label htmlFor="error">Error</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="info" id="info" />
                <Label htmlFor="info">Info</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="warning" id="warning" />
                <Label htmlFor="warning">Warning</Label>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  )
}
