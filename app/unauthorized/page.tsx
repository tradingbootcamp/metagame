import { Lock } from 'lucide-react'

export default function Unauthorized() {
  return (
    <div className="flex h-[calc(100vh-72px)] items-center justify-center">
      <div className="rounded-lg border border-border-primary bg-card p-6 text-center">
        <div className="mb-4">
          <Lock className="mx-auto h-12 w-12 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold">UNAUTHORIZED</h1>
        <p className="mt-2 text-muted-foreground">This page is locked</p>
      </div>
    </div>
  )
}
