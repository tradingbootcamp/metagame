'use client'

import { useState } from 'react'

import { useProfileUpdate } from './hooks/useProfileUpdate'
import { ExternalLinkIcon } from 'lucide-react'
import Link from 'next/link'

import { ProfileFormData, initialProfileFormData } from '@/lib/schemas/profile'

import { cn } from '@/utils/cn'
import { URLS } from '@/utils/urls'

import { Button, buttonVariants } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'

import { DbFullProfile } from '@/types/database/dbTypeAliases'

interface ProfileInfoModalProps {
  onClose: () => void
  currentProfile: DbFullProfile | null | undefined
  currentUserId?: string
}

export function ProfileInfoModal({
  onClose,
  currentProfile,
  currentUserId,
}: ProfileInfoModalProps) {
  const [formData, setFormData] = useState<ProfileFormData>(
    currentProfile ?? initialProfileFormData,
  )

  const {
    updateProfile,
    dismissModal,
    isLoading,
    isUpdatingProfile,
    isDismissingModal,
  } = useProfileUpdate({
    currentUserId,
    onSuccess: onClose,
  })

  const handleSave = () => {
    updateProfile(formData)
  }

  const handleDismiss = () => {
    dismissModal()
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="mx-4 w-full max-w-md bg-card">
        <DialogTitle>
          <span className="mb-1 text-2xl font-bold">Complete Your Profile</span>
        </DialogTitle>
        <p className="mb-6 text-muted-foreground">
          We need some basic profile information
        </p>

        <div className="space-y-4">
          {/* Name Fields */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Name<span className="text-lg text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="First (required)"
                value={formData.first_name ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    first_name: e.target.value || null,
                  }))
                }
              />
              <Input
                placeholder="Last"
                value={formData.last_name ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    last_name: e.target.value || null,
                  }))
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="label">
              <span className="label-text">Bio</span>
            </Label>
            <Textarea
              placeholder="Bio"
              value={formData.bio ?? ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  bio: e.target.value || null,
                }))
              }
            />
          </div>

          {/* Homepage Display Radio Group */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Allow your profile card to be displayed on the homepage attendee
              list? (opt-in)<span className="text-lg text-red-500">*</span>
            </label>
            <RadioGroup
              value={
                formData.opted_in_to_homepage_display === null
                  ? ''
                  : formData.opted_in_to_homepage_display
                    ? 'yes'
                    : 'no'
              }
              onValueChange={(value) => {
                const newValue =
                  value === 'yes' ? true : value === 'no' ? false : null
                setFormData((prev) => ({
                  ...prev,
                  opted_in_to_homepage_display: newValue,
                }))
              }}
              className="flex"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="homepage-yes-modal" />
                <label htmlFor="homepage-yes-modal" className="text-sm">
                  Yes
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="homepage-no-modal" />
                <label htmlFor="homepage-no-modal" className="text-sm">
                  No
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Minor Checkbox */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Are you 18 or older?
              <span className="text-lg text-red-500">*</span>
            </label>
            <RadioGroup
              value={
                formData.minor === null ? '' : formData.minor ? 'no' : 'yes'
              }
              onValueChange={(value) => {
                const newValue =
                  value === 'yes' ? false : value === 'no' ? true : null
                setFormData((prev) => ({ ...prev, minor: newValue }))
              }}
              className="flex"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="age-yes-modal" />
                <label htmlFor="age-yes-modal" className="text-sm">
                  Yes
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="age-no-modal" />
                <label htmlFor="age-no-modal" className="text-sm">
                  No
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Kids Radio Group */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Are you bringing any children?
              <span className="text-lg text-red-500">*</span>
            </label>
            <RadioGroup
              value={
                formData.bringing_kids === null
                  ? ''
                  : formData.bringing_kids
                    ? 'yes'
                    : 'no'
              }
              onValueChange={(value) => {
                const newValue =
                  value === 'yes' ? true : value === 'no' ? false : null
                setFormData((prev) => ({ ...prev, bringing_kids: newValue }))
              }}
              className="flex"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="kids-yes-modal" />
                <label htmlFor="kids-yes-modal" className="text-sm">
                  Yes
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="kids-no-modal" />
                <label htmlFor="kids-no-modal" className="text-sm">
                  No
                </label>
              </div>
            </RadioGroup>
          </div>

          {formData.bringing_kids && (
            <Link
              className={cn(
                buttonVariants({ variant: 'secondary' }),
                'h-auto py-3 text-center break-words whitespace-normal text-black',
              )}
              href={URLS.CHILDREN_REGISTRATION}
              target="_blank"
            >
              <div className="flex flex-col items-center gap-1">
                <span>If you haven&apos;t, please fill out</span>
                <span className="flex items-center gap-1">
                  the children registration form{' '}
                  <ExternalLinkIcon className="mt-1 h-4 w-4" />
                </span>
              </div>
            </Link>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={handleSave} disabled={isLoading} className="w-full">
            {isUpdatingProfile ? 'Saving...' : 'Save Profile'}
          </Button>

          <Button
            variant="outline"
            onClick={handleDismiss}
            disabled={isLoading}
            className="w-full"
          >
            {isDismissingModal ? 'Dismissing...' : 'Stop prompting me for this'}
          </Button>

          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="w-full"
          >
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
