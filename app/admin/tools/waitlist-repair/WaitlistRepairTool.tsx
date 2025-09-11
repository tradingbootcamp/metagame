'use client'

import { useState } from 'react'

import { useMutation } from '@tanstack/react-query'
import { AlertTriangle, CheckCircle, Users } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { repairSessionWaitlists } from '@/app/actions/db/sessionRsvps'

interface RepairResult {
  sessionId: string
  promoted: string[]
  type: 'regular' | 'megagame'
}

export default function WaitlistRepairTool() {
  const [lastResults, setLastResults] = useState<RepairResult[]>([])

  const repairMutation = useMutation({
    mutationFn: repairSessionWaitlists,
    onSuccess: (results) => {
      setLastResults(results)
      if (results.length === 0) {
        toast.success(
          'No waitlist repairs needed - all sessions are properly balanced!',
        )
      } else {
        const totalPromoted = results.reduce(
          (sum, r) => sum + r.promoted.length,
          0,
        )
        toast.success(
          `Repaired ${results.length} sessions, promoted ${totalPromoted} users from waitlists`,
        )
      }
    },
    onError: (error) => {
      toast.error(`Failed to repair waitlists: ${error.message}`)
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <div>
          <h3 className="text-lg font-semibold">Waitlist Repair Tool</h3>
          <p className="text-sm text-muted-foreground">
            Fix waitlist drift caused by cascade deletions (when users or
            sessions are deleted)
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Checks all sessions with capacity limits</p>
          <p>
            • Identifies sessions with open spots but users still on waitlist
          </p>
          <p>• Promotes waitlisted users to fill available capacity</p>
          <p>
            • Handles both regular sessions and megagames (with team balancing)
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          onClick={() => repairMutation.mutate()}
          disabled={repairMutation.isPending}
          className="min-w-32"
        >
          {repairMutation.isPending ? 'Repairing...' : 'Repair All Waitlists'}
        </Button>
      </div>

      {lastResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Last Repair Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lastResults.map((result) => (
              <div
                key={result.sessionId}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="font-mono text-sm">{result.sessionId}</span>
                  <Badge
                    variant={
                      result.type === 'megagame' ? 'secondary' : 'outline'
                    }
                  >
                    {result.type}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Promoted {result.promoted.length} user
                  {result.promoted.length !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {repairMutation.isError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">
                {repairMutation.error?.message || 'An error occurred'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
