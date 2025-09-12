import { Dialog, DialogContent, DialogTitle } from './ui/dialog'

export default function PickACard({ sessionId }: { sessionId: string }) {
  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent>
        <DialogTitle>Pick a Card</DialogTitle>
        {sessionId}
      </DialogContent>
    </Dialog>
  )
}
